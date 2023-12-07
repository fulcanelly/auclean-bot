import '../src/neo4j'
import '../src/models/__relations'
import { schanChanHandle, spy } from '../src/chanscan'

import { User } from '../src/models/user'
import { OnlineLog } from '../src/models/online_log'
import { Neo4jSupportedProperties, NeogmaModel, QueryBuilder, QueryRunner, Where, getTransaction } from "neogma";
import { neogma } from "../src/neo4j";
import { QueryResult, RecordShape } from "neo4j-driver";
import { Channel, ChannelProps } from '../src/models/channel'
import { ChannelPost } from '../src/models/channel_post'
import { ChannelSubs, ChannelSubsProps } from '../src/models/channel_subs'
import { PostViews, PostViewsProps } from '../src/models/post_views'
import { ChannelScanLog, ChannelScanLogProps } from '../src/models/channel_scan_log'


type AnyObj = Record<string, any>

function obtainResult<T extends Neo4jSupportedProperties, D extends AnyObj, K extends AnyObj, J extends AnyObj>(
  model: NeogmaModel<T, D, K, J>,
  identifier: string,
  data: QueryResult<RecordShape>
) {
  return QueryRunner.getResultProperties<T>(data, identifier)
    .map(it => model.buildFromRecord({
      properties: it,
      labels: [
        model.getLabel()
      ]
    }))
}

let i = 0

function rangUUID() {
  return `test:${++i}`
}

async function testTransactionsWorking() {
  await neogma.getTransaction(null, async (t) => {
    await User.findOne({ session: t })
    const one = await User.createOne({
      name: undefined,
      user_id: undefined,
      uuid: rangUUID()
    }, { session: t })

    await one.delete({ session: t })

    const count = await new QueryBuilder()
      .match({
        model: OnlineLog,
        identifier: 'u'
      })
      // .where("u.uuid starts with 'test:'")
      .return('count(u) as c')
      .run(t)

    const res = Number(count.records[0].get('c'))

    console.log({ res, n: Number(res) })
  })
}

async function deleteAll() {
  await neogma.queryRunner.run(
    "MATCH (u:`User`) DETACH DELETE u"
  )

  await neogma.queryRunner.run(
    "MATCH (u:`OnlineLog`) DETACH DELETE u"
  )

  await neogma.queryRunner.run(
    "MATCH (u:`Channel`)  DETACH DELETE u"
  )

  await neogma.queryRunner.run(
    "MATCH (u:`ChannelPost`) DETACH DELETE u"
  )

  await neogma.queryRunner.run(
    "MATCH (a:PostViews) DETACH DELETE a"
  )

  await neogma.queryRunner.run(
    "MATCH (a:ChannelSubs) DETACH DELETE a"
  )

  await neogma.queryRunner.run(
    "MATCH (a:ChannelScanLog) DETACH DELETE a"
  )
}


describe('models ::', () => {

  beforeEach(deleteAll)

  it('check transactions is working', testTransactionsWorking)

  describe('relation ONLINE_REPORTED_BY', () => {
    it('.reported_by', async () => {
      // Create a User
      const user = await User.createOne({
        uuid: rangUUID(),
        name: 'Test User',
        user_id: undefined
      });

      // Create an OnlineLog entry reported by the created User
      const log = await OnlineLog.createOne({
        online: true,
        time: Number(new Date().toISOString()),
        uuid: rangUUID()
      });

      // Relate the OnlineLog entry to the User
      await log.relateTo({
        alias: "reported_by",
        where: {
          uuid: user.uuid
        }
      });

      // Query to verify the relationship is created
      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: User,
              where: {
                uuid: user.uuid
              }
            },
            {
              ...User.getRelationshipByAlias('reported'),
              direction: 'out'
            },
            {
              model: OnlineLog,
              identifier: 'reportedLogs',
            }
          ]
        })
        .return('reportedLogs')
        .run(neogma.queryRunner);

      // Verify that the OnlineLog entry is related to the User
      expect(obtainResult(OnlineLog, 'reportedLogs', result).length).toEqual(1);
    });
    it('.reported :: User relates to OnlineLog', async () => {
      const user = await User.createOne({
        uuid: rangUUID(),
        name: 'Test User',
        user_id: undefined
      });

      const log = await OnlineLog.createOne({
        online: true,
        time: Number(new Date()),
        uuid: rangUUID()
      });

      await user.relateTo({
        alias: 'reported',
        where: {
          uuid: log.uuid
        }
      });

      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: OnlineLog,
              where: {
                uuid: log.uuid
              }
            },
            {
              ...OnlineLog.getRelationshipByAlias('reported_by'),
              direction: 'in'
            },
            {
              model: User,
              identifier: 'reportingUsers',
            }
          ]
        })
        .return('reportingUsers')
        .run(neogma.queryRunner);

      expect(obtainResult(User, 'reportingUsers', result).length).toEqual(1);
    });

  })

  describe('relation ONLINE_BELONS_TO', () => {
    it('User relates to OnlineLog as online_logs', async () => {
      const user = await User.createOne({
        uuid: rangUUID(),
        name: '',
        user_id: undefined
      });

      const log = await OnlineLog.createOne({
        online: true,
        time: Number(new Date()),
        uuid: rangUUID()
      });

      await user.relateTo({
        alias: 'online_logs',
        where: {
          uuid: log.uuid
        }
      });

      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: OnlineLog,
              where: {
                uuid: log.uuid
              }
            },
            {
              ...OnlineLog.getRelationshipByAlias('belong_to'),
              direction: 'in'
            },
            {
              model: User,
              identifier: 'users',
            }
          ]
        })
        .return('users')
        .run(neogma.queryRunner);

      expect(obtainResult(User, 'users', result).length).toEqual(1);
    });

    it('.belong_to', async () => {
      const log = await OnlineLog.createOne({
        online: false,
        time: Number(new Date()),
        uuid: rangUUID()
      })

      const user = await User.createOne({
        uuid: rangUUID(),
        name: undefined,
        user_id: undefined
      })

      await log.relateTo({
        alias: "belong_to",
        where: {
          uuid: user.uuid
        }
      })

      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: User,
              where: {
                uuid: user.uuid
              }
            },
            {
              ...User.getRelationshipByAlias('online_logs'),
              direction: 'out'
            },
            {
              model: OnlineLog,
              identifier: 'logs',
            }
          ]
        })
        .return('logs')
        .run(neogma.queryRunner)

      expect(obtainResult(OnlineLog, 'logs', result).length).toEqual(1)
    })
  })


})

const post_author = 'test:00000000000000000000------------------------------00000000000000009000000000000:test'

const makeMsg = (packet: spy.Packet) => ({
  content: JSON.stringify(packet)
})

const chan = {
  ack() { },
  nack() { },
} as any

describe('schanChanHandle', () => {

  const log_id = rangUUID()

  beforeEach(async () => {
    await deleteAll()
    await ChannelScanLog.createOne({
      uuid: log_id,
      started_at: 0,
      finished_at: 0
    })
  })

  it('scan log', async () => {
    const packet: spy.Packet = {
      type: 'channel',
      id: -123,
      title: 'Test Channel',
      username: 'test:channel',
      date: Date.now(),
      log_id
    }
    const msg = makeMsg(packet);

    await schanChanHandle(chan, msg);

    const channel = await Channel.findOne({ where: { id: packet.id } });
    expect(channel).toBeDefined();
    expect(channel!.title).toBe(packet.title);
    expect(channel!.username).toBe(packet.username);


    const result = await new QueryBuilder()
      .match({
        related: [
          {
            model: Channel,
            where: {
              id: packet.id
            }
          },
          Channel.getRelationshipByAlias('added_by_log'),
          {
            model: ChannelScanLog,
            identifier: 'log'
          }
        ]
      })
      .return('log')
      .run(neogma.queryRunner)

    const log = QueryRunner.getResultProperties<ChannelScanLogProps>(result, 'log')

    expect(log.length).toBe(1)

  })

  describe('channel packet sent >', () => {
    describe('when no channel >', () => {
      it('should create channel in db', async () => {
        const packet: spy.Packet = {
          type: 'channel',
          id: -123,
          title: 'Test Channel',
          username: 'test:channel',
          date: Date.now(),
          log_id
        }
        const msg = makeMsg(packet);

        await schanChanHandle(chan, msg);

        const result = await Channel.findOne({ where: { id: packet.id } });
        expect(result).toBeDefined();
        expect(result!.title).toBe(packet.title);
        expect(result!.username).toBe(packet.username);
      });
    });

    describe('when there is channel >', () => {
      it('updates existing channel', () => {

      })
    })

    it('when same entry received, nothing created or updated', async () => {
      const packet: spy.Packet = {
        type: 'channel',
        id: 125,
        title: 'Duplicate Test Channel',
        username: 'test:channel',
        date: Date.now(),
        log_id
      };

      const msg = makeMsg(packet);

      await schanChanHandle(chan, msg); // First call
      await schanChanHandle(chan, msg); // Duplicate call

      const results = await Channel.findMany({ where: { id: packet.id } });
      expect(results.length).toBe(1); // Ensure only one entry exists
    });

    it('subs', async () => {
      const packet: spy.Packet = {
        type: 'channel',
        id: -123,
        title: 'Test Channel',
        username: 'test:channel',
        date: Date.now(),
        subs: 132,
        log_id
      }
      const msg = makeMsg(packet);

      await schanChanHandle(chan, msg);

      const channel = await Channel.findOne({ where: { id: packet.id } });
      expect(channel).toBeDefined();
      expect(channel!.title).toBe(packet.title);
      expect(channel!.username).toBe(packet.username);


      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: Channel,
              where: {
                id: packet.id
              }
            },
            Channel.getRelationshipByAlias('subs_history'),
            {
              model: ChannelSubs,
              identifier: 'views'
            }
          ]
        })
        .return('views')
        .run(neogma.queryRunner)

      const res = QueryRunner.getResultProperties<ChannelSubsProps>(result, 'views')
      expect(res.length).toBe(1)
      expect(res[0].count).toBe(packet.subs)
    })
  })

  describe('post pocket sent', () => {
    beforeEach(async () => {
      const makeChan = (id: number) => makeMsg({
        type: 'channel',
        id,
        title: 'Duplicate Test Channel',
        username: 'test:channel',
        date: Date.now(),
        log_id
      });

      await schanChanHandle(chan, makeChan(1));
      await schanChanHandle(chan, makeChan(2));
    })

    describe('when regualar post', () => {
      it('creates record in db', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 200,
          grouped_id: undefined,
          views: 10,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          log_id
        };
        const msg = makeMsg(packet);

        await schanChanHandle(chan, msg);

        const result = await ChannelPost.findOne({ where: { id: packet.id, channel_id: packet.channel_id } });
        expect(result).toBeDefined();
        expect(result!.post_author).toBe(packet.post_author);
      })
    })

    describe('when forwarded from channel', () => {
      it('creates post, froward_from relation, post in that channel, forawrded from channel', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 201,
          grouped_id: undefined,
          views: 15,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          fwd_from_channel: {
            channel_post_id: 301,
            channel_id: 2, // This should be a different channel ID
            post_author,
            date: Date.now()
          },
          log_id
        };
        const msg = makeMsg(packet);

        await schanChanHandle(chan, msg);

        const resultPost = await ChannelPost.findOne({ where: { id: packet.id, channel_id: packet.channel_id } });
        const resultFwdFromPost = await ChannelPost.findOne({ where: { id: packet!.fwd_from_channel!.channel_post_id, channel_id: packet!.fwd_from_channel!.channel_id } });

        const result = await new QueryBuilder()
          .match({
            related: [
              {
                model: Channel,
                where: {
                  id: 1
                }
              },
              Channel.getRelationshipByAlias('posts'),
              { model: ChannelPost },
              ChannelPost.getRelationshipByAlias('forwarded_from'),
              { model: ChannelPost },
              ChannelPost.getRelationshipByAlias('of_channel'),
              {
                model: Channel,
                identifier: 'ch'
              }
            ]
          })
          .return('ch')
          .run(neogma.queryRunner)

        const res = QueryRunner.getResultProperties<ChannelProps>(result, 'ch')

        expect(res.length).toBe(1)
        expect(res[0].id).toBe(packet.fwd_from_channel?.channel_id)

        expect(resultPost).toBeDefined();
        expect(resultPost!.id).toBe(packet.id)

        expect(resultFwdFromPost).toBeDefined();
        expect(resultFwdFromPost!.id).toBe(packet.fwd_from_channel!.channel_post_id)
      })
    })

    describe('when forwarded from user', () => {
      it('creates post, froward_from relation, user if not exists', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 202,
          grouped_id: undefined,
          views: 20,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          fwd_from_user: {
            date: Date.now(),
            user_id: 3
          },
          log_id
        };
        const msg = makeMsg(packet);

        //NOT SURE ABOUT THIS LINE
        await (await User.findOne({ where: { user_id: packet!.fwd_from_user!.user_id.toString() } }))?.delete()

        await schanChanHandle(chan, msg);

        const resultPost = await ChannelPost.findOne({ where: { id: packet.id, channel_id: packet.channel_id } });
        const resultUser = await User.findOne({ where: { user_id: packet!.fwd_from_user!.user_id.toString() } });

        expect(resultPost).toBeDefined();
        expect(resultUser).toBeDefined();
      })
    })

    describe('when regular post already exists', () => {
      it('nothing created or updated', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 200,
          grouped_id: undefined,
          views: 10,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          log_id
        };
        const msg = makeMsg(packet);

        await schanChanHandle(chan, msg);
        await schanChanHandle(chan, msg);

        const result = await ChannelPost.findMany({ where: { id: packet.id, channel_id: packet.channel_id } });

        expect(result.length).toBe(1);
      })
    })

    describe('when forwarded from channel already exists', () => {
      it('nothing created or updated', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 201,
          grouped_id: undefined,
          views: 15,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          fwd_from_channel: {
            channel_post_id: 301,
            channel_id: 2, // This should be a different channel ID
            post_author,
            date: Date.now()
          },
          log_id
        };
        const msg = makeMsg(packet);

        await schanChanHandle(chan, msg);
        await schanChanHandle(chan, msg);

        const resultPost = await ChannelPost.findMany({ where: { id: packet.id, channel_id: packet.channel_id } });
        const resultFwdFromPost = await ChannelPost.findMany({ where: { id: packet!.fwd_from_channel!.channel_post_id, channel_id: packet!.fwd_from_channel!.channel_id } });

        expect(resultPost.length).toBe(1);
        expect(resultFwdFromPost.length).toBe(1);
      })
    })

    describe('when forwarded from user already exists', () => {
      it('nothing created or updated', async () => {
        const packet: spy.Packet = {
          type: 'post',
          id: 202,
          grouped_id: undefined,
          views: 20,
          post_author,
          date: Date.now(),
          channel_id: 1, // Ensure this channel exists in the DB
          fwd_from_user: {
            date: Date.now(),
            user_id: 4
          },
          log_id
        };
        const msg = makeMsg(packet);

        //NOT SURE ABOUT THIS LINE

        await (await User.findOne({ where: { user_id: packet!.fwd_from_user!.user_id.toString() } }))?.delete()

        await schanChanHandle(chan, msg);
        await schanChanHandle(chan, msg);

        const resultPost = await ChannelPost.findMany({ where: { id: packet.id, channel_id: packet.channel_id } });
        const resultUser = await User.findMany({ where: { user_id: packet!.fwd_from_user!.user_id.toString() } });

        expect(resultPost.length).toBe(1);
        expect(resultUser.length).toBe(1);
      })
    })

    it('views', async () => {

      const packet: spy.Packet = {
        type: 'post',
        id: 200,
        grouped_id: undefined,
        views: 12,
        post_author,
        date: Date.now(),
        channel_id: 1, // Ensure this channel exists in the DB
        log_id
      };
      const msg = makeMsg(packet);

      await schanChanHandle(chan, msg);

      const post = await ChannelPost.findOne({ where: { id: packet.id, channel_id: packet.channel_id } });
      expect(post).toBeDefined();
      expect(post!.post_author).toBe(packet.post_author);

      const result = await new QueryBuilder()
        .match({
          related: [
            {
              model: Channel,
              where: {
                id: packet.channel_id
              }
            },
            Channel.getRelationshipByAlias('posts'),
            { model: ChannelPost },
            ChannelPost.getRelationshipByAlias('view_hisotry'),
            {
              model: PostViews,
              identifier: 'views'
            }
          ]
        })
        .return('views')
        .run(neogma.queryRunner)

      const res = QueryRunner.getResultProperties<PostViewsProps>(result, 'views')
      expect(res.length).toBe(1)
      expect(res[0].views).toBe(packet.views)

      // ChannelSubs.findOne()

    })
  })



  setInterval(() => {
    // console.log(User.getRelationshipByAlias('appears_in_posts'))
  }, 100)
})

