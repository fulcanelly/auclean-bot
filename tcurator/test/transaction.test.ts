import '@/neo4j'
import '@/models/__relations'
import '@/utils/neo4j/log_patch'
import '@/utils/neo4j/implicit_transaction'

import { User } from "@/models/user"
import { randUUID } from "./randUUID"
import { neogma } from "@/neo4j"
import { ModelFactory, QueryBuilder } from "neogma"
import { OnlineLog } from "@/models/online_log"
import { Channel } from '@/models/channel'
import { timeout } from '@/utils/timeout'


// class ok {
//   async run(
//     /** the QueryRunner instance to use */
//     queryRunnerOrRunnable,
//     /** an existing session to use. Set it only if the first param is a QueryRunner instance */
//     existingSession) {
//         const queryRunner = queryRunnerOrRunnable instanceof QueryRunner_1.QueryRunner
//             ? queryRunnerOrRunnable
//             : QueryBuilder.queryRunner;
//         if (!queryRunner) {
//             throw new Errors_1.NeogmaError('A queryRunner was not given to run this builder. Make sure that the first parameter is a QueryRunner instance, or that QueryBuilder.queryRunner is set');
//         }
//         const sessionToGet = queryRunnerOrRunnable && !(queryRunnerOrRunnable instanceof QueryRunner_1.QueryRunner)
//             ? queryRunnerOrRunnable
//             : existingSession;
//         return (0, Sessions_1.getRunnable)(sessionToGet, async (session) => {
//             return queryRunner.run(this.getStatement(), this.getBindParam().get(), session);
//         }, queryRunner.getDriver(), queryRunner.sessionParams);
//     }
// }

class Barrier {
  count: number
  resolve: null | ((value: unknown) => void)
  promise: Promise<any>

  constructor(count) {
    this.count = count;
    this.resolve = null;
    this.promise = new Promise(resolve => {
      this.resolve = resolve;
    });
  }

  signal() {
    if (--this.count === 0) {
      this.resolve!(1);
    }
  }

  wait() {
    return this.promise;
  }
}


async function testTransactionsWorking(barrierS: Barrier, barrierF: Barrier) {
  const t = null
   await neogma.getTransaction(null, async (t) => {

    console.log('enter')
    await timeout(1000)

    barrierS.signal()

    await barrierS.wait()
    console.log('continue')

    await User.findOne({ session: t })
    await User.findOne()

    const one = await User.createOne({
      uuid: randUUID()
    }, { session: t })

    // await one.delete({ session: t })

    const count = await new QueryBuilder()
      .match({
        model: User,
        identifier: 'u'
      })
      .return('count(u) as c')
      .run(t)


      barrierF.signal()
      await barrierF.wait()

    console.log(count.records[0].get('c'))

   })
}

describe('ok', () => {

   it('check transactions is working', async() => {
    const x = 10
    const barrier = new Barrier(x);
    const endbarrier = new Barrier(x);

    const res = new Array(x).fill(0).map(_=> testTransactionsWorking(barrier, endbarrier))
    await Promise.all(res)
   })
})
