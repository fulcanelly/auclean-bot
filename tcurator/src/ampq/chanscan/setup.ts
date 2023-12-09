import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';


import * as R from 'ramda'
import { schanChanHandle } from './chan_handle';
import { ChannelScanLog } from '../../models/channel_scan_log';
import { Session } from '../../models/session';
// import { createIfNotExists } from './lib';


//TODO,
// 1 log
// 	1.1 add log bouding
// 	1.2 time parsing took
//  1.3 log timeouts
// 2 views
// 3 updates
// 4 comments
// 5 subs

// got to forward channel

// differend scan modes -> recursive | aloone
// match (c:ChannelPost) RETURN datetime({epochSeconds: toInteger(c.created_at)}) AS date limit 10;


// Session.getPrimaryKeyField()
export async function setupChanSpy(channel: amqplib.Channel) {
	await channel.assertQueue('py:chanscan', { durable: true })
	await channel.assertQueue('py:chanscan:reply', { durable: true })

	channel.consume('py:chanscan:reply', R.curry(schanChanHandle)(channel))
	channel.consume('tg:spy', R.curry(processSpyRequest)(channel))
}


type spy_request = {
    requested_by_user_id: string,
    session?: string,
    identifier?: string
}

async function processSpyRequest(channel: amqplib.Channel, msg: any) {
    channel.ack(msg, false)

		const data = JSON.parse(msg!.content.toString()) as spy_request
		const user_id = data.requested_by_user_id?.toString()
		const props = msg!.properties

		const replyBack = (data: any) => channel.sendToQueue(props.replyTo, Buffer.from(JSON.stringify(data, null, '  ')), {
			correlationId: props.correlationId
		})

		if (data.session && data.identifier) {
			const log = await ChannelScanLog.createOne({
				uuid: uuidv4(),
				enrolled_at: Date.now(),
				started_at: 0,
				finished_at: 0
			})

			const session = await Session.findOne({
				where: {
					user_id: user_id,
					session_name: data.session
				}
			})

			await session?.relateTo({
				alias: 'scan_logs',
				where: {
					uuid: log.uuid
				}
			})

			const dataToSpy = {
				session: session!.session_name,
				identifier: data.identifier,
				log_id: log.uuid
			}

			channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(dataToSpy)))

			replyBack({ log_id: log.uuid })
		} else {
			const sessions = await Session.findMany({
				where: {
					user_id
				}
			})

			replyBack(sessions.map(s => s.session_name))
		}
		console.log(data)


}
