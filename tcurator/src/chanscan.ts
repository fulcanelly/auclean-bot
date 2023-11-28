import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

import { User, UserInstance, UserProps, UserRelatedNodesI } from './models/user';
import { Session, SessionProps } from './models/session';
import EventEmitter from 'events';
import { ChannelScanLog } from './models/channel_scan_log';
import { Channel } from './models/channel';
import { ChannelPost } from './models/channel_post';
import * as R from 'ramda'

//TODO,
// 1 log
// 	1.1 add log bouding
// 	1.2 time parsing took
//  1.3 log timeouts
// 2 views
// 3 updates
// 4 comments


namespace spy {
	type Channel = {
		id: number;
		title: string;
		username: string;
		subs?: number;
		date: number;
		type: 'channel';
		// created_at?: number;
		// need_to_scan?: boolean;

		// uuid?: string;
		// channel_id?: string;
	};

	type Post = {
		id: number;
		grouped_id: undefined | number;
		views: number;
		post_author: string;
		date: number;
		channel_id: number;
		type: 'post';
		fwd_from_channel?: {
			channel_post_id: number;
			channel_id: number;
			post_author: string;
			date: number;
		};
		fwd_from_user?: {
			date: number;
			user_id: number;
		};
	}

	export type Packet = (Post | Channel) & { log_id: number }
}

export async function setupChanSpy(channel: amqplib.Channel) {

	await channel.assertQueue('py:chanscan', { durable: true })
	await channel.assertQueue('py:chanscan:reply', { durable: true })

	//TODO connect to log
	channel.consume('py:chanscan:reply', R.curry(schanChanHandle)(channel))

	channel.consume('tg:spy', async (msg: any) => {
			channel.ack(msg, false)

			const data = JSON.parse(msg!.content.toString())// ..content.toString()
			console.log(data)
			const props = msg!.properties
			// Session.getPrimaryKeyField()
			const session = await Session.findOne({
					where: {
							user_id: data.requested_by_user_id?.toString()
					}
			})

			if (session) {

					const dataToSpy = {
							session: session.session_name,
							identifier: data.identifier,
					}

					// TODO
					// const log = await ChannelScanLog.createOne({
					// })
					channel.sendToQueue('py:chanscan', Buffer.from(JSON.stringify(dataToSpy)))
			}


			console.log(session)

			channel.sendToQueue(props.replyTo, Buffer.from(JSON.stringify({
					...data, ...session?.dataValues
			}, null, '  ')), {
					correlationId: props.correlationId
			})
	})
}


export async function schanChanHandle(channel: amqplib.Channel, msg: any) {
	channel.ack(msg, false)
	// console.log("AA")
	const data = JSON.parse(msg!.content.toString()) as spy.Packet// ..content.toString()
	console.log(data)

	if (data.type == 'post') {

		//FIND CHANNEL
		const chan = await Channel.findOne({
			where: {
				id: data.channel_id
			}
		})

		if (!chan) {
			//TODO
			throw 'async borken, no channel'
			// return void channel.nack(msg, false, true)
		}

		//CHECk IF IT EXISTS

		if (await ChannelPost.findOne({
			where: {
				id: data.id,
				channel_id: data.channel_id
			},
		})) {
			return
		}

		const post = await ChannelPost.createOne({
			uuid: uuidv4(),
			id: data.id,
			channel_id: data.channel_id,
			grouped_id: data.grouped_id,
			post_author: data.post_author,
			created_at: data.date
		})

		// CONNECT TO SOURSE IF IT's FORWAREDED
		if (data.fwd_from_channel) {
			const fwd = data.fwd_from_channel

			const chan =
				await Channel.findOne({
					where: {
						id: fwd.channel_id
					}
				}) ||
				await Channel.createOne({
					id: fwd.channel_id,
					created_at: fwd.date,
					need_to_scan: false,
				})

			await ChannelPost.findOne({
				where: {
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id
				}
			}) ||
				await ChannelPost.createOne({
					uuid: uuidv4(),
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id,
					created_at: fwd.date
				})

			await chan.relateTo({
				alias: 'posts',
				where: {
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id
				}
			})

			await post.relateTo({
				alias: 'forwarded_from',
				where: {
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id
				}
			})
		}

		//CREATE OF FIND USER AND MARK AS POST IS QUOTE
		if (data.fwd_from_user) {
			const user_id = String(data.fwd_from_user.user_id)

			const user =
				await User.findOne({ where: { user_id } }) ||
				await User.createOne({
					uuid: uuidv4(),
					user_id
				})

			await user.relateTo({
				alias: 'appears_in_posts',
				where: {
					id: data.id,
					channel_id: data.channel_id
				}
			})

		}

		await chan.relateTo({
			alias: 'posts',
			where: {
				id: data.id,
				channel_id: data.channel_id
			},
		})
	} else if (data.type == 'channel') {

		await Channel.findOne({
			where: {
				id: data.id
			}
		}) ||
			await Channel.createOne({
				id: data.id,
				title: data.title,
				username: data.username,
				created_at: data.date,
				need_to_scan: false,
			})

		// channel.nack(msg, false, true)

	}
}
