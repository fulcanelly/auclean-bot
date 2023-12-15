import { ChannelScanLog, ChannelScanLogInstance } from '../models/channel_scan_log';
import { NeogmaModel, QueryBuilder } from 'neogma';
import { neogma } from '../neo4j';
import { ChannelPost } from '../models/channel_post';
import { PostViews } from '../models/post_views';
import { Channel } from '../models/channel';
import { User } from '../models/user';


export async function logSummary(log: ChannelScanLogInstance) {
	const channel = await log.getChannel()

	const addedBy = await channel.getChannelAddedBy()

	return {
		log_id: log.uuid,

		channel: {
			title: channel.title,
			username: channel.username
		},
		added_by: {
			title: addedBy?.title,
			username: addedBy?.username
		},
		time: {
			enrolled_at: log.enrolled_at,
			started_at: log.started_at,
			finished_at: log.finished_at,
		},
		posts: await countRelatedToLog(log, ChannelPost as any),
	 	views: await countRelatedToLog(log, PostViews as any),
		channels: await countRelatedToLog(log, Channel as any),
		users: await countRelatedToLog(log, User as any),
	}
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
