import { NeogmaInstance, NeogmaInstanceValidationError, QueryBuilder, QueryRunner } from 'neogma';
import { Channel, ChannelInstance, ChannelProps } from '../../../models/channel';
import { spy } from '../../../types/spy_packet';
import { ChannelSubs, ChannelSubsInstance } from '../../../models/channel_subs';
import { v4 as uuidv4 } from 'uuid';
import { ChannelScanLog } from '../../../models/channel_scan_log';
import { neogma } from '../../../neo4j';
import moment from 'moment';
import { relateTo } from '@/utils/patch';
import { TypeErrasedAdder } from '.';


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

		await relateTo({
			from: subs,
			merge: true,
			alias: 'of_channel',
			where: {
				id: data.id,
			}
		})
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

	if (QueryRunner.getResultProperties<ChannelProps>(queryResult, 's').length) {
		return
	}

	const scan = await ChannelScanLog.findOne({
		where: {
			uuid: log_id
		}
	})

	await relateTo({
		merge: true,
		from: scan!,
		alias: 'of_channel',
		where: {
			id: channel_id
		}
	})
}
