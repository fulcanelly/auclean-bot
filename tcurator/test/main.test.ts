import "../src/data/relations";
import { Users } from '../src/data/users'
import { OnlineLog } from '../src/data/online_log'
import { Neo4jSupportedProperties, NeogmaModel, QueryBuilder, QueryRunner, Where } from "neogma";
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

async function deleteAll() {
  await new QueryBuilder()
    .match({
      related: [
        {
          model: Users,
          identifier: 'u'
        },
        {
          direction: 'none',
          identifier: 'r'
        },
        {
          model: OnlineLog,
          identifier: 'l'
        }
      ]
    })
    .where("u.uuid starts with 'test:' and l.uuid starts with 'test:'")
    .delete('r, u, l')
    .run(neogma.queryRunner)

  await new QueryBuilder()
    .match({
      model: Users,
      identifier: 'u'
    })
    .where("u.uuid starts with 'test:'")
    .delete('u')
    .run(neogma.queryRunner)


  await new QueryBuilder()
    .match({
      model: OnlineLog,
      identifier: 'u'
    })
    .where("u.uuid starts with 'test:'")
    .delete('u')
    .run(neogma.queryRunner)
}

describe('models ::', () => {

  beforeAll(deleteAll)

  // afterAll(neogma.driver.close)
  //ONLINE_REPORTED_BY reported_by reported
  // ONLINE_BELONS_TO belong_to online_logs

  describe('relation ONLINE_REPORTED_BY', () => {
    it('.reported_by', async () => {
      // Create a User
      const user = await Users.createOne({
        uuid: rangUUID(),
        name: 'Test User',
        user_id: undefined
      });

      // Create an OnlineLog entry reported by the created User
      const log = await OnlineLog.createOne({
        online: true,
        time: new Date().toISOString(),
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
              model: Users,
              where: {
                uuid: user.uuid
              }
            },
            {
              ...Users.getRelationshipByAlias('reported'),
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
      const user = await Users.createOne({
        uuid: rangUUID(),
        name: 'Test User',
        user_id: undefined
      });

      const log = await OnlineLog.createOne({
        online: true,
        time: new Date().toISOString(),
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
              model: Users,
              identifier: 'reportingUsers',
            }
          ]
        })
        .return('reportingUsers')
        .run(neogma.queryRunner);

      expect(obtainResult(Users, 'reportingUsers', result).length).toEqual(1);
    });

  })

  describe('relation ONLINE_BELONS_TO', () => {
    it('User relates to OnlineLog as online_logs', async () => {
      const user = await Users.createOne({
        uuid: rangUUID(),
        name: '',
        user_id: undefined
      });

      const log = await OnlineLog.createOne({
        online: true,
        time: new Date().toISOString(),
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
              model: Users,
              identifier: 'users',
            }
          ]
        })
        .return('users')
        .run(neogma.queryRunner);

      expect(obtainResult(Users, 'users', result).length).toEqual(1);
    });

    it('.belong_to', async () => {
      const log = await OnlineLog.createOne({
        online: false,
        time: "",
        uuid: rangUUID()
      })

      const user = await Users.createOne({
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
              model: Users,
              where: {
                uuid: user.uuid
              }
            },
            {
              ...Users.getRelationshipByAlias('online_logs'),
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
