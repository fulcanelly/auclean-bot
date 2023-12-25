import amqplib from 'amqplib';


import * as R from 'ramda'
import { schanChanHandle } from './chan_handle';
import { ChannelScanLogProps } from '../../models/channel_scan_log';
import { Session } from '../../models/session';
import { QueryBuilder, QueryRunner, neo4jDriver } from 'neogma';
import { Channel } from '../../models/channel';
import { neogma } from '../../neo4j';
import { initFirstScan } from '../../services/init_first_scan';
import { logger } from '@/utils/logger';
import { py_chanscan_request } from '@/types/py_chanscan_request';
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
	identifier?: string,
	test?: boolean
	stop?: boolean
	is_regular?: boolean
}

async function processSpyRequest(channel: amqplib.Channel, msg: any) {
	channel.ack(msg, false)

	const data = JSON.parse(msg!.content.toString()) as spy_request
	const user_id = data.requested_by_user_id?.toString()
	const props = msg!.properties

	const replyBack = (data: any) => channel.sendToQueue(props.replyTo, Buffer.from(JSON.stringify(data, null, '  ')), {
		correlationId: props.correlationId
	})

	logger.error('got', data)

	if (data.stop && data.session) {

		const payload: py_chanscan_request = {
			type: 'remove_job',
			session: data.session
		}

		channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(payload)));

		replyBack(payload)
	} else if (data.test && data.session) {

		const payload: py_chanscan_request = {
			type: 'test_load',
			session: data.session
		}

		channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(payload)));

		replyBack(payload)
	} else if (data.session && data.identifier) {
		const session = await Session.findOne({
			where: {
				user_id,
				session_name: data.session
			}
		})

		const log = await initFirstScan(channel, session!, data.identifier, data.is_regular)

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

