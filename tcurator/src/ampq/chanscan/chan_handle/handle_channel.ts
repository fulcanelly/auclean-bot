import { NeogmaInstance, NeogmaInstanceValidationError, QueryBuilder, QueryRunner } from 'neogma';
import { Channel, ChannelInstance, ChannelProps } from '../../../models/channel';
import { spy } from '../../../types/spy_packet';
import { ChannelSubs, ChannelSubsInstance } from '../../../models/channel_subs';
import { v4 as uuidv4 } from 'uuid';
import { ChannelScanLog } from '../../../models/channel_scan_log';
import { neogma } from '../../../neo4j';
import moment from 'moment';
import { relate } from '@/utils/neo4j/relate';
import { relateTo } from '@/utils/neo4j/relateTo';
import { TypeErrasedAdder } from '.';
import { getQueryResult } from '@/utils/getQueryResult';


export async function handleChannelEntry(data: spy.Channel & spy.Packet, adder: TypeErrasedAdder) {
	const chan = await Channel.findOne({
		where: {
			id: data.id
		}
	}) ||
		adder.addToCreated(
			await Channel.createOne({
				id: data.id,
				title: data.title,
				username: data.username,
				created_at: data.date,
				need_to_scan: false,
			})
		);


	await relateToMainChannel(chan.id, data.log_id)
	await addSubsCount(data, adder);
}

export async function addSubsCount(data: spy.Channel, adder: TypeErrasedAdder) {
	if (!data.subs) {
		return
	}

	const subs = adder.addToCreated(
		await ChannelSubs.createOne({
			count: data.subs,
			date: moment().unix(),
			uuid: uuidv4(),
		}))

	await relate(subs)
		.of_channel
		.where({ id: data.id })
		.save()
}


async function relateToMainChannel(channel_id: number, log_id: string) {
	const queryResult = await new QueryBuilder()
		.match({
			related: [
				{
					model: ChannelScanLog,
					where: {
						uuid: log_id
					}
				},
				ChannelScanLog.getRelationshipByAlias('of_channel'),
				{
					model: Channel,
					identifier: 's'
				}
			]
		})
		.return('s')
		.run(neogma.queryRunner);


	if (getQueryResult(queryResult, Channel, 's').length) {
		return
	}

	const scan = await ChannelScanLog.findOne({
		where: {
			uuid: log_id
		}
	})

	await relate(scan!)
		.of_channel
		.where({ id: channel_id })
		.save()
}
