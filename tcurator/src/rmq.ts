import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { Neo4jSupportedProperties, NeogmaModel, QueryBuilder, QueryRunner } from 'neogma';
import { neogma } from './neo4j';
import { sentry } from './sentry';
import { OnlineLog } from './models/online_log';
import { User, UserInstance } from './models/user';
import { Session, SessionProps } from './models/session';
import { setupChanSpy } from './chanscan';

async function createIfNotExists
    <T extends Neo4jSupportedProperties, K extends {}, J extends {}, M extends {}>(
        model: NeogmaModel<T, K, J, M>, key: string, entry: T) {
    model.getPrimaryKeyField

    const where: { [l: string]: any } = {}
    where[key] = entry[key]

    const found = await model.findOne({ where })

    if (found) {
        return found
    } else {
        await model.createOne(entry as any)
    }
}

export async function setupRmq() {
    console.log('connecting to rmq')

    let client = await amqplib.connect({
        hostname: process.env.RMQ_HOST,
        username: process.env.RMQ_USERNAME,
        password: process.env.RMQ_PASSWORD,
    })

    let channel = await client.createChannel()

    await channel.assertQueue('tg:login', { durable: true })
    await channel.assertQueue('tg:login:answer', { durable: true })
    await channel.assertQueue('curator:event', { durable: true })
    await channel.assertQueue('curator:command', { durable: true })
    await channel.assertQueue('tg:spy')
    await channel.assertQueue('tg:reply')

    setupChanSpy(await client.createChannel())


    channel.consume('curator:event', async (msg_) => {
        const msg = msg_ as amqplib.Message
        const data = JSON.parse(msg.content.toString())

        console.log(data)

        try {
            if (data.login_success) {
                await createSessionIfNotExists(
                    data.login_success.session_name,
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

                await onlineLog.relateTo({
                    alias: 'belong_to',
                    where: {
                        user_id: subject_user_id
                    }
                })

                await onlineLog.relateTo({
                    alias: 'reported_by',
                    where: {
                        user_id: reporter_user_id
                    }
                })

                channel.ack(msg, false)

            } else {
                throw null
            }

        } catch (e) {
            sentry.captureException(e)
            console.log(e)
            console.log((e as any)?.data?.errors)
            channel.nack(msg, false, true)
        }

    })


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

async function createSessionIfNotExists(session_name: string, phone: string, user_id: string) {
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

        created_at: new Date().toString(),
        uuid: uuidv4(),
    })
}


async function sendAllSessions(channel: amqplib.Channel) {
    const PAGE_SIZE = 10

    console.log("ALL SESSIONS")
    for (let index = 0; ; index++) {
        console.log("START")

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

        const sessions = QueryRunner.getResultProperties<SessionProps>(sessionsResult, 's')

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
