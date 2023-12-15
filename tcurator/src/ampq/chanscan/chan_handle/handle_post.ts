
import { v4 as uuidv4 } from 'uuid';
import { NeogmaInstance } from 'neogma';
import { ChannelPost, ChannelPostInstance } from '../../../models/channel_post';
import { PostViews } from '../../../models/post_views';
import { Channel } from '../../../models/channel';
import { User } from '../../../models/user';
import { spy } from '../../../types/spy_packet';

export async function createChannelPost(data: spy.Post, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
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
		await handleForwardFromChannel(post, data, addToCreated)
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



async function handleForwardFromChannel(post: ChannelPostInstance, data: spy.Post, addToCreated: (instance: NeogmaInstance<any, any>) => any) {

    const fwd = data.fwd_from_channel!

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

async function createViews(data: spy.Post, addToCreated: (instance: NeogmaInstance<any, any>) => any) {
	if (!data.views) {
		return
	}
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
