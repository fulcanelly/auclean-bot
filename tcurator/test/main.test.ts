import '../src/neo4j'
import '../src/models/__relations'

import { User } from '../src/models/user'
import { OnlineLog } from '../src/models/online_log'
import { Neo4jSupportedProperties, NeogmaModel, QueryBuilder, QueryRunner, Where, getTransaction } from "neogma";
import { neogma } from "../src/neo4j";
import { QueryResult, RecordShape } from "neo4j-driver";


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
    await User.findOne({session: t})
    const one = await User.createOne({
      name: undefined,
      user_id: undefined,
      uuid: rangUUID()
    }, {session: t})

    await one.delete({session: t})

    const count = await new QueryBuilder()
      .match({
        model: OnlineLog,
        identifier: 'u'
      })
      // .where("u.uuid starts with 'test:'")
      .return('count(u) as c')
      .run(t)

      const res = Number(count.records[0].get('c'))

    console.log({res, n: Number(res)})
  })
}

async function deleteAll() {

  // MATCH (u:`User`)-[r]-(l:`OnlineLog`) WHERE u.uuid starts with 'test:' and l.uuid starts with 'test:' DELETE r, u, l
  await neogma.queryRunner.run(
    "MATCH (u:`User`) WHERE u.uuid starts with 'test:' DETACH DELETE u"
  )


  await neogma.queryRunner.run(
    "MATCH (u:`OnlineLog`) WHERE u.uuid starts with 'test:' DETACH DELETE u"
  )
}

describe('models ::', () => {

  beforeAll(deleteAll)

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
