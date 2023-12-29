import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { QueryBuilder, QueryRunner } from 'neogma';
import { neogma } from './neo4j';
import { sentry } from './sentry';
import { OnlineLog } from './models/online_log';
import { User, UserInstance } from './models/user';
import { Session, SessionProps } from './models/session';
import { setupChanSpy } from './ampq/chanscan/setup';
import { logger } from './utils/logger';
import { config } from '@/config';
import { relate, relateTo } from './utils/patch';
import { getQueryResult } from './utils/getQueryResult';

declare module "./config" {
    namespace config {
        interface Modules {
            rmq: {
                prefetch: number
            }
        }
    }
}

const prefetch = config.appConfig.modules.rmq.prefetch

export async function setupRmq() {
    logger.verbose('connecting to rmq')

    let client = await amqplib.connect({
        hostname: process.env.RMQ_HOST,
        username: process.env.RMQ_USERNAME,
        password: process.env.RMQ_PASSWORD,
    })

    let channel = await client.createChannel()

    await channel.prefetch(prefetch)
    await channel.assertQueue('tg:login', { durable: true })
    await channel.assertQueue('tg:login:answer', { durable: true })
    await channel.assertQueue('curator:event', { durable: true })
    await channel.assertQueue('curator:command', { durable: true })
    await channel.assertQueue('tg:spy')
    await channel.assertQueue('tg:reply')

    const chan = await client.createChannel()
    await chan.prefetch(prefetch)
    setupChanSpy(chan)


    channel.consume('curator:event', async (msg_) => {
        const msg = msg_ as amqplib.Message
        const data = JSON.parse(msg.content.toString())

        logger.verbose(data)

        try {
            if (data.login_success) {
                await createSessionIfNotExists(
                    data.login_success.session_name,
                    data.login_success.type,
                    '',
                    data.login_success.user_id.toString())
                channel.ack(msg as amqplib.Message, false)
            } else if (data.login_init) {
                channel.ack(msg as amqplib.Message, false)
            } else if (data.event == 'request_session') {
                await sendAllSessions(channel)
                channel.ack(msg as amqplib.Message, false)
            } else if (data.online_status) {
                let { subject_user_id, reporter_user_id, online, date, name } = data.online_status

                subject_user_id = String(subject_user_id)
                reporter_user_id = String(reporter_user_id)


                if (online == null) {
                    channel.ack(msg, false)
                    return
                }

                await createUserIfNotExists(subject_user_id, name)
                await createUserIfNotExists(reporter_user_id, '')

                const onlineLog = await OnlineLog.createOne({
                    time: Number(date),
                    online: online as boolean,
                    uuid: uuidv4(),
                })

                await relate(onlineLog)
                    .belong_to
                    .where({
                        user_id: subject_user_id
                    })
                    .save()

                await relate(onlineLog)
                    .reported_by
                    .where({
                        user_id: reporter_user_id
                    })
                    .save()

                channel.ack(msg, false)

            } else {
                throw null
            }

        } catch (e) {
            sentry.captureException(e)
            logger.error(e)
            logger.warn((e as any)?.data?.errors)
            channel.nack(msg, false, true)
        }

    })


    return client
}



async function createUserIfNotExists(user_id: string, name: string): Promise<UserInstance> {
    const user = await User.findOne({ where: { user_id } })

    if (user) {
        if (user.name != name && name != '') {
            user.name = name
            await user.save()
        }
        return user
    }


    return await User.createOne({
        user_id,
        name: name,
        uuid: uuidv4()
    })

}

async function createSessionIfNotExists(session_name: string, type: string, phone: string, user_id: string) {
    let session = await Session.findOne({
        where: {
            session_name,
            user_id
        }
    })

    if (session) {
        return session
    }

    return await Session.createOne({
        session_name,
        phone,
        user_id,

        type,
        created_at: new Date().toString(),
        uuid: uuidv4(),
    })
}


async function sendAllSessions(channel: amqplib.Channel) {
    const PAGE_SIZE = 10

    logger.verbose("sending all sessions")
    for (let index = 0; ; index++) {

        const shift = PAGE_SIZE * index
        console.log({ shift })
        const sessionsResult = await
            new QueryBuilder()
                .match({
                    model: Session,
                    identifier: 's'
                })
                .where('s.session_name is not null')
                .return('s')
                .skip(shift)
                .limit(PAGE_SIZE)
                .run(neogma.queryRunner)


        const sessions = getQueryResult(sessionsResult, Session, 's').map(it => it.dataValues)

        console.log(sessions)

        if (sessions.length != 0) {
            await channel.sendToQueue('curator:command', Buffer.from(
                JSON.stringify({
                    sessions
                })
            ), { persistent: true })

        } else {
            return
        }
    }
}
