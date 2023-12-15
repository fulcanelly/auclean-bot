import amqplib from 'amqplib';
import { NeogmaInstance } from 'neogma';
import * as R from 'ramda'
import { spy } from '../../../types/spy_packet';
import { retry } from '../../../utils/retry';
import { createChannelPost } from './handle_post';
import { handleFinish } from './handle_finish';
import { handleChannelEntry } from './handle_channel';
import { handleStart } from './handle_start';
import { Message } from '../../../models/message';


const RETRY_ATTEMPTS = 2



const t = {
	id: 1269,
	media_group_id: null,
	reply_to_message_id: 1265,
	comment_to: {
		channel_id: -1001427285409,
		message_id: 6810
	},
	author: {
		id: 1628740396,
		username: 'fkmmhh',
		first_name: 'fkm',
		last_name: null
	},
	sender_chat: null,
	date: 1702589675,
	discussion_chat: { id: -1001550097223, title: 'sadameka music Chat' },
	type: 'comment',
	log_id: '340647a2-e5bf-4abb-9d5f-b327d0798579'
}

export async function schanChanHandle(channel: amqplib.Channel, msg: any) {
	const data = JSON.parse(msg!.content.toString()) as spy.Packet
	const createdByLog: NeogmaInstance<{}, { [k: string]: any }>[] = []
	const addToCreated: (instance: NeogmaInstance<any, any>) => any = (instance: NeogmaInstance<any, any>) =>
		R.tap((instance: NeogmaInstance<any, any>) => createdByLog.push(instance), instance)

	console.log(data)
	if (data.type == 'comment') {

		const comment =
			await Message.findOne({
				where: {
					id: data.id
				}
			}) || addToCreated(await Message.createOne({
				id: data.id,
				date: data.date,
			}))
		// return
	}


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


function handleComment() { }

