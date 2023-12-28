import { Channel, ChannelInstance } from "@/models/channel";
import { ChannelPost } from "@/models/channel_post";
import { PostViews } from "@/models/post_views";
import moment from "moment";
import { randUUID } from "./randUUID";
import { relateTo } from "@/utils/patch";

export const getMostViewedPostsTests = () =>
  describe('Channel Model - getMostViewedPosts method', () => {
    let channel: ChannelInstance;

    beforeEach(async () => {
      // Assuming a method to create a channel and return its instance
      channel = await Channel.createOne({
        id: 1,
        need_to_scan: false
      });
    })

    describe('when the base is empty', () => {
      it('should return an empty array', async () => {
        const mostViewedPosts = await channel.getMostViewedPosts(10);
        expect(mostViewedPosts.length).toEqual(0);
      });
    });

    describe('when stats are older than specified days', () => {
      beforeEach(async () => {
        const oldPost = await ChannelPost.createOne({
          id: 101,
          channel_id: channel.id,
          uuid: '',
          created_at: moment().subtract(31, 'days').unix()
        });

        await relateTo({
          from: channel,
          alias: 'posts',
          where: { id: oldPost.id },
          merge: true,
        })

        const view = await PostViews.createOne({
          views: 50,
          date: 0, // we dont care in this test about post views creation date
          uuid: randUUID()
        });

        await relateTo({
          merge: true,
          from: oldPost,
          alias: 'view_hisotry',
          where: {
            uuid: view.uuid
          }
        })
      });

      it('should exclude old stats', async () => {
        const daysAgo = 30;
        const mostViewedPosts = await channel.getMostViewedPosts(10, daysAgo);
        expect(mostViewedPosts).toEqual([]);
      });
    });

    describe('when multiple posts are created on the same day with different view counts', () => {
      beforeEach(async () => {
        const today = moment().unix()

        const createPostsAndViews = Array.from({ length: 5 }, async (_, i) => {
          const post = await ChannelPost.createOne({
            id: 200 + i,
            channel_id: channel.id,
            uuid: randUUID(),
            created_at: today
          });

          await relateTo({
            merge: true,
            from: channel,
            alias: 'posts',
            target: post,
          });

          const view = await PostViews.createOne({
            views: i * 100, // Increasing view count for each post
            date: today,
            uuid: randUUID()
          });

          await relateTo({
            merge: true,
            from: post,
            alias: 'view_hisotry',
            target: view
          })
        })

        await Promise.all(createPostsAndViews)
      });

      it('should handle multiple posts correctly', async () => {
        const mostViewedPosts = await channel.getMostViewedPosts(10, 10);
        expect(mostViewedPosts.length).toBe(5);
        expect(mostViewedPosts[0].views).toBeGreaterThan(mostViewedPosts[4].views); // Assuming descending order
      });
    });

    describe('when valid posts and views are present', () => {
      beforeEach(async () => {
        const createPostsAndViews = Array.from({ length: 3 }, async (_, i) => {
          const postDate = moment().subtract(i, 'days').unix()
          const post = await ChannelPost.createOne({
            id: 300 + i,
            channel_id: channel.id,
            uuid: randUUID(),
            created_at: postDate
          });

          await relateTo({
            merge: true,
            from: channel,
            alias: 'posts',
            target: post,
          })

          const view = await PostViews.createOne({
            views: i * 100, // Increasing view count for each post
            date: postDate,
            uuid: randUUID()
          });

          await relateTo({
            from: post,
            alias: 'view_hisotry',
            merge: true,
            target: view,
          })
        })
        await Promise.all(createPostsAndViews)
      });

      it('should return correct data', async () => {
        const daysAgo = 10; // Example value
        const mostViewedPosts = await channel.getMostViewedPosts(10, daysAgo);
        expect(mostViewedPosts.length).toBe(3);
        // Further assertions to check the data consistency and ordering
      });
    })

    describe('when posts have multiple views', () => {
      beforeEach(async () => {
        const today = moment().unix();

        const createPostsAndMultipleViews = Array.from({ length: 3 }, async (_, i) => {
          const post = await ChannelPost.createOne({
            id: 400 + i,
            channel_id: channel.id,
            uuid: randUUID(),
            created_at: today
          });

          await relateTo({
            from: channel,
            alias: 'posts',
            target: post,
            merge: true
          })

          // Create multiple views for each post
          const viewsPromises = Array.from({ length: 3 }, async (__, j) =>
            PostViews.createOne({
              views: (j + 1) * 100, // Different view counts
              date: today + j * 1000, // Incrementing the date to simulate different times
              uuid: randUUID()
            }).then(view => relateTo({
              from: post,
              alias: 'view_hisotry',
              target: view,
              merge: true
            }))
          );

          return Promise.all(viewsPromises);
        });

        await Promise.all(createPostsAndMultipleViews);
      });

      it('should select the latest view count for each post', async () => {
        const mostViewedPosts = await channel.getMostViewedPosts(10, 10);
        expect(mostViewedPosts.length).toBe(3);
        mostViewedPosts.forEach((post, index) => {
          expect(post.views).toBe(300); // The latest view count for each post
        });
      });
    });

    describe('when some posts are older than the specified range', () => {
      beforeEach(async () => {
        const today = moment().unix();
        const daysAgo = moment().subtract(15, 'days').unix()

        const createMixedPosts = Array.from({ length: 5 }, async (_, i) => {
          const postDate = i < 3 ? today : daysAgo; // First 3 posts are recent, last 2 are older
          const post = await ChannelPost.createOne({
            id: 500 + i,
            channel_id: channel.id,
            uuid: randUUID(),
            created_at: postDate
          });

          await relateTo({
            from: channel,
            alias: 'posts',
            target: post,
            merge: true
          })

          const view = await PostViews.createOne({
            views: i * 100, // Increasing view count for each post
            date: postDate,
            uuid: randUUID()
          });

          await relateTo({
            merge: true,
            from: post,
            alias: 'view_hisotry',
            target: view
          })
        });

        await Promise.all(createMixedPosts);
      });

      it('should exclude posts older than the specified days', async () => {
        const daysAgo = 10; // Only posts within the last 10 days should be included
        const mostViewedPosts = await channel.getMostViewedPosts(10, daysAgo);
        expect(mostViewedPosts.length).toBe(3); // Expecting only 3 recent posts

        // Further check to ensure the ids of the included posts are as expected
        const expectedPostIds = [502, 501, 500]; // IDs of the 3 recent posts
        mostViewedPosts.forEach((post, index) => {
          expect(post.post_id).toBe(expectedPostIds[index]);
        });
      });
    });
  })
