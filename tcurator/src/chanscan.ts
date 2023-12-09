import amqplib from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

import { User } from './models/user';
import { Session, SessionProps } from './models/session';
import { Channel } from './models/channel';
import { ChannelPost } from './models/channel_post';
import * as R from 'ramda'
// import { createIfNotExists } from './lib';
import { NeogmaInstance, NeogmaModel, QueryBuilder, QueryRunner } from 'neogma';
import { OnlineLog } from './models/online_log';
import { PostViews } from './models/post_views';
import { ChannelSubs } from './models/channel_subs';
import { ChannelScanLog, ChannelScanLogInstance, ChannelScanLogProps } from './models/channel_scan_log';
import { sentry } from './sentry';
import { neogma } from './neo4j';
import { retry } from './utils/retry';
import { spy } from './types/spy_packet';

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

	//TODO connect to log
	channel.consume('py:chanscan:reply', R.curry(schanChanHandle)(channel))

	type spy_request = {
		requested_by_user_id: string,
		session?: string,
		identifier?: string
	}

	channel.consume('tg:spy', async (msg: any) => {
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


	})
}

async function countRelatedToLog(log: ChannelScanLogInstance, model: NeogmaModel<any, { [k: string]: any }>): Promise<number> {
	const count = await new QueryBuilder()
		.match({
			related: [
				{
					model,
					identifier: 'a'
				},
				model.getRelationshipByAlias('added_by_log'),
				{
					model: ChannelScanLog,
					where: {
						uuid: log.uuid
					}
				}
			]
		})
		.return('count(a) as c')
		.run(neogma.queryRunner)

	return Number(count.records[0].get('c'))
}

async function logSummary(log: ChannelScanLogInstance) {
	return {
		enrolled_at: log.enrolled_at,
		started_at: log.started_at,
		finished_at: log.finished_at,

		posts: await countRelatedToLog(log, ChannelPost as any),
	 	views: await countRelatedToLog(log, PostViews as any),
		channels: await countRelatedToLog(log, Channel as any),
		users: await countRelatedToLog(log, User as any),
	}
}

const RETRY_ATTEMPTS = 10

export async function schanChanHandle(channel: amqplib.Channel, msg: any) {
	const data = JSON.parse(msg!.content.toString()) as spy.Packet
	console.log(data)

	const createdByLog: NeogmaInstance<{}, { [k: string]: any }>[] = []
	const addToCreated: (instance: NeogmaInstance<any, any>) => any = (instance: NeogmaInstance<any, any>) =>
		R.tap((instance: NeogmaInstance<any, any>) => createdByLog.push(instance), instance)


	try {
		await retry(async () => {


			if (data.type == 'start_event') {
				const chanScanLog = await ChannelScanLog.findOne({
					where: {
						uuid: data.log_id
					}
				})
				chanScanLog!.started_at = Date.now()
				return await chanScanLog?.save()
			}

			if (data.type == 'channel') {
				return await handleChannelEntry(data, addToCreated)
			}

			if (data.type == 'post') {
				return await createChannelPost(data, addToCreated)
			}

			if (data.type == 'finish_event') {
				const chanScanLog = await ChannelScanLog.findOne({
					where: {
						uuid: data.log_id
					}
				})
				chanScanLog!.finished_at = Date.now()
				await chanScanLog?.save()

				const queryResult = await new QueryBuilder()
					.match({
						related: [
							{
								model: ChannelScanLog,
								where: {
									uuid: chanScanLog!.uuid
								}
							},
							ChannelScanLog.getRelationshipByAlias('handled_by'),
							{
								model: Session,
								identifier: 's'
							}
						]
					})
					.return('s')
					.run(neogma.queryRunner)

				const session = QueryRunner.getResultProperties<SessionProps>(queryResult, 's')

				const request = {
					scan_summary: await logSummary(chanScanLog!),
					user_id: session[0].user_id
				}

				channel.sendToQueue('tg:login:answer', Buffer.from(JSON.stringify(request)))
			}

		}, RETRY_ATTEMPTS)

	} finally {
		await retry(async () => {
			const result = createdByLog.map(model =>
				model.relateTo({
					alias: 'added_by_log',
					where: {
						uuid: data.log_id
					}
				})
			)
			await Promise.all(result)
		}, RETRY_ATTEMPTS)

		channel.ack(msg, false)
	}

}

async function handleChannelEntry(data: spy.Channel, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
	await Channel.findOne({
		where: {
			id: data.id
		}
	}) ||
		addToCreated(
			await Channel.createOne({
				id: data.id,
				title: data.title,
				username: data.username,
				created_at: data.date,
				need_to_scan: false,
			})
		)
	await addSubsCount(data, addToCreated)
}

async function addSubsCount(data: spy.Channel, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
	if (!data.subs) {
		return
	}

	const subs = addToCreated(
		await ChannelSubs.createOne({
			count: data.subs,
			date: Date.now(),
			uuid: uuidv4(),
		}))


	await subs.relateTo({
		alias: 'of_channel',
		where: {
			id: data.id,
		}
	})
}

async function createViews(data: spy.Post, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
	// may be there is a need to restrict how often this need to be updated
	const views = addToCreated(
		await PostViews.createOne({
			views: data.views,
			date: Date.now(),
			uuid: uuidv4(),
		}))


	await views.relateTo({
		alias: 'of_post',
		where: {
			id: data.id,
			channel_id: data.channel_id
		}
	})
}

async function createChannelPost(data: spy.Post, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
	const chan = await Channel.findOne({
		where: {
			id: data.channel_id
		}
	})

	if (!chan) {
		throw 'no channel'
	}

	//CHECk IF IT EXISTS

	if (await ChannelPost.findOne({
		where: {
			id: data.id,
			channel_id: data.channel_id
		},
	})) {
		return void await createViews(data, addToCreated)
	}

	const post = addToCreated(
		await ChannelPost.createOne({
			uuid: uuidv4(),
			id: data.id,
			channel_id: data.channel_id,
			grouped_id: data.grouped_id,
			post_author: data.post_author,
			created_at: data.date
		})
	);

	// CONNECT TO SOURSE IF IT's FORWAREDED
	if (data.fwd_from_channel) {
		const fwd = data.fwd_from_channel

		const chan =
			await Channel.findOne({
				where: {
					id: fwd.channel_id
				}
			}) ||
			addToCreated(
				await Channel.createOne({
					id: fwd.channel_id,
					title: fwd.title,
					username: fwd.username,
					created_at: fwd.date,
					need_to_scan: false,
				})
			)

		await ChannelPost.findOne({
			where: {
				id: fwd.channel_post_id,
				channel_id: fwd.channel_id
			}
		}) ||
			addToCreated(
				await ChannelPost.createOne({
					uuid: uuidv4(),
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id,
					created_at: fwd.date
				})
			)

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
			addToCreated(
				await User.createOne({
					uuid: uuidv4(),
					user_id
				})
			)

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
	await createViews(data, addToCreated)
}
