import amqplib from 'amqplib';
import { NeogmaInstance } from 'neogma';
import * as R from 'ramda'
import { spy } from '../../../types/spy_packet';
import { retry } from '../../../utils/retry';
import { createChannelPost } from './handle_post';
import { handleFinish } from './handle_finish';
import { handleChannelEntry } from './handle_channel';
import { handleStart } from './handle_start';


const RETRY_ATTEMPTS = 2

export async function schanChanHandle(channel: amqplib.Channel, msg: any) {
	const data = JSON.parse(msg!.content.toString()) as spy.Packet
	const createdByLog: NeogmaInstance<{}, { [k: string]: any }>[] = []
	const addToCreated: (instance: NeogmaInstance<any, any>) => any = (instance: NeogmaInstance<any, any>) =>
		R.tap((instance: NeogmaInstance<any, any>) => createdByLog.push(instance), instance)

	console.log(data)

	try {
		await retry(async () => {
			if (data.type == 'start_event') {
				return await handleStart(data)
			}

			if (data.type == 'channel') {
				return await handleChannelEntry(data, addToCreated)
			}

			if (data.type == 'post') {
				return await createChannelPost(data, addToCreated)
			}

			if (data.type == 'finish_event') {
				return await handleFinish(channel, data)
			}

		}, RETRY_ATTEMPTS)

	} finally {
		const boundTo = {
			alias: 'added_by_log',
			where: {
				uuid: data.log_id
			}
		}
		await retry(async () => {
			await Promise.all(createdByLog.map(model => model.relateTo(boundTo)))
		}, RETRY_ATTEMPTS)

		channel.ack(msg, false)
	}

}


