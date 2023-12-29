import amqplib from 'amqplib';
import { NeogmaInstance } from 'neogma';
import * as R from 'ramda'
import { spy } from '../../../types/spy_packet';
import { retry } from '../../../utils/retry';
import { createChannelPost } from './handle_post';
import { handleFinish } from './handle_finish';
import { handleChannelEntry } from './handle_channel';
import { handleStart } from './handle_start';
import { relate, relateTo } from '@/utils/patch';
import { sentry } from '@/sentry';
import { logger } from '@/utils/logger';


const RETRY_ATTEMPTS = 2


export class TypeErrasedAdder {

	constructor(readonly adder: (elm: any) => void) { }

	addToCreated<T>(element: T): T {
		this.adder(element)
		return element
	}
}

export async function schanChanHandle(channel: amqplib.Channel, msg: any) {
	const data = JSON.parse(msg!.content.toString()) as spy.Packet
	const createdByLog: NeogmaInstance<{}, { [k: string]: any }>[] = []
	const adder = new TypeErrasedAdder(it => createdByLog.push(it))

	console.log(data)

	try {
		if (data.type == 'start_event') {
			await handleStart(data)
		}

		if (data.type == 'channel') {
			await handleChannelEntry(data, adder)
		}

		if (data.type == 'post') {
			await createChannelPost(data, adder)
		}

		if (data.type == 'finish_event') {
			await handleFinish(channel, data)
		}

		const added = createdByLog.map(model => relateTo({
			merge: true,
			from: model,
			alias: 'added_by_log',
			where: {
				uuid: data.log_id
			},
		}))
		await Promise.all(added)
	} catch (e) {
		sentry.captureException(e)
		logger.error(e)
	}

	channel.ack(msg, false)
}




