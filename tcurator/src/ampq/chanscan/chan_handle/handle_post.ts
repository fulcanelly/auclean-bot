
import { v4 as uuidv4 } from 'uuid';
import { NeogmaInstance } from 'neogma';
import { ChannelPost, ChannelPostInstance } from '../../../models/channel_post';
import { PostViews } from '../../../models/post_views';
import { Channel } from '../../../models/channel';
import { User, UserInstance } from '../../../models/user';
import { spy } from '../../../types/spy_packet';
import moment from 'moment';
import { relateTo } from '@/utils/patch';
import { TypeErrasedAdder } from '.';

export async function createChannelPost(data: spy.Post, adder: TypeErrasedAdder) {
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
		return void await createViews(data, adder)
	}

	const post: ChannelPostInstance = adder.addToCreated(
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
		await handleForwardFromChannel(post, data, adder)
	}

	//CREATE OF FIND USER AND MARK AS POST IS QUOTE
	if (data.fwd_from_user) {
		const user_id = String(data.fwd_from_user.user_id)

		const user: UserInstance =
			await User.findOne({ where: { user_id } }) ||
			adder.addToCreated(
				await User.createOne({
					uuid: uuidv4(),
					user_id
				})
			)

		await relateTo({
			merge: true,
			from: user,
			alias: 'appears_in_posts',
			where: {
				id: data.id,
				channel_id: data.channel_id
			}
		})

	}

	await relateTo({
		merge: true,
		from: chan,
		alias: 'posts',
		where: {
			id: data.id,
			channel_id: data.channel_id
		},
	})

	await createViews(data, adder)
}



async function handleForwardFromChannel(post: ChannelPostInstance, data: spy.Post, adder: TypeErrasedAdder) {

    const fwd = data.fwd_from_channel!

		const chan =
			await Channel.findOne({
				where: {
					id: fwd.channel_id
				}
			}) ||
			adder.addToCreated(
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
		    adder.addToCreated(
				await ChannelPost.createOne({
					uuid: uuidv4(),
					id: fwd.channel_post_id,
					channel_id: fwd.channel_id,
					created_at: fwd.date
				})
			)

		await relateTo({
			from: chan,
			merge: true,
			alias: 'posts',
			where: {
				id: fwd.channel_post_id,
				channel_id: fwd.channel_id
			}
		})

		await relateTo({
			from: post,
			merge: true,
			alias: 'forwarded_from',
			where: {
				id: fwd.channel_post_id,
				channel_id: fwd.channel_id
			}
		})
}

async function createViews(data: spy.Post, adder: TypeErrasedAdder) {
	if (!data.views) {
		return
	}
	// may be there is a need to restrict how often this need to be updated
	const views = adder.addToCreated(
		await PostViews.createOne({
			views: data.views,
			date: moment().unix(),
			uuid: uuidv4(),
		}))

	await relateTo({
		merge: true,
		from: views,
		alias: 'of_post',
		where: {
			id: data.id,
			channel_id: data.channel_id
		}
	})
}
