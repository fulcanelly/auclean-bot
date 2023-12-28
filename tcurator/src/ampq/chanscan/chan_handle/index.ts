import amqplib from 'amqplib';
import { NeogmaInstance } from 'neogma';
import * as R from 'ramda'
import { spy } from '../../../types/spy_packet';
import { retry } from '../../../utils/retry';
import { createChannelPost } from './handle_post';
import { handleFinish } from './handle_finish';
import { handleChannelEntry } from './handle_channel';
import { handleStart } from './handle_start';
import { relateTo } from '@/utils/patch';


const RETRY_ATTEMPTS = 2


export class TypeErrasedAdder {

	constructor(readonly adder: (elm: any) => void) {}

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
		await retry(async () => {
			if (data.type == 'start_event') {
				return await handleStart(data)
			}

			if (data.type == 'channel') {
				return await handleChannelEntry(data, adder)
			}

			if (data.type == 'post') {
				return await createChannelPost(data, adder)
			}

			if (data.type == 'finish_event') {
				return await handleFinish(channel, data)
			}

		}, RETRY_ATTEMPTS)

	} finally {
		await retry(async () => {
			await Promise.all(createdByLog.map(model => relateTo({
				merge: true,
				from: model,
				alias: 'added_by_log',
				where: {
					uuid: data.log_id
				},
			})))
	}, RETRY_ATTEMPTS)

	channel.ack(msg, false)
}

}


