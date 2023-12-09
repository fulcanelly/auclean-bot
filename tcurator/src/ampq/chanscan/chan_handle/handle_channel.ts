import { NeogmaInstance } from 'neogma';
import { Channel } from '../../../models/channel';
import { spy } from '../../../types/spy_packet';
import { ChannelSubs } from '../../../models/channel_subs';
import { v4 as uuidv4 } from 'uuid';

export async function handleChannelEntry(data: spy.Channel, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
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
		);
	await addSubsCount(data, addToCreated);
}

export async function addSubsCount(data: spy.Channel, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
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

