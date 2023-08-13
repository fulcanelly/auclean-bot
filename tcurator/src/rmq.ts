import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { OnlineLog } from './data/online_log';
import { NeogmaInstance, QueryBuilder, QueryRunner } from 'neogma';
import { UserProps, UserRelatedNodesI, Users } from './data/users';
import { tg } from './data/telegram_session';
import { neogma } from './neo4j';


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
                    time: date as string,
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

        } catch(e) {
            console.log(e)
            console.log((e as any)?.data?.errors)
            channel.nack(msg, false, true)
        }

    })


}



async function createUserIfNotExists(user_id: string, name: string): Promise<NeogmaInstance<UserProps, UserRelatedNodesI>>  {
    const user = await Users.findOne({ where: { user_id } })

    if (user) {
        if (user.name != name) {
            user.name = name
            await user.save()
        }
        return user
    }


    return await Users.createOne({
        user_id,
        name: name,
        uuid: uuidv4()
    })

}

async function createSessionIfNotExists(session_name: string, phone: string, user_id: string) {
    let session = await tg.Session.findOne({
        where: {
            session_name,
            user_id
        }
    })

    if (session) {
        return session
    }

    return await tg.Session.createOne({
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
                    model: tg.Session,
                    identifier: 's'
                })
                .where('s.session_name is not null')
                .return('s')
                .skip(shift)
                .limit(PAGE_SIZE)
                .run(neogma.queryRunner)

        const sessions = QueryRunner.getResultProperties<tg.SessionProps>(sessionsResult, 's')

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
