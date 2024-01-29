import { transactionManager, transactionWrapper } from "@/utils/neo4j/implicit_transaction";
import { ValueOf } from "next/dist/shared/lib/constants";
import { Add, Subtract, Multiply, Divide, Pow, Compare, Mod } from 'ts-arithmetic'

describe('Transaction Manager', () => {
  describe('transaction provisoning', () => {
    it('transaction avaliable in transactionWrapper', async () => {
      await transactionWrapper(async () => {
        const transaction = transactionManager.getCurrentTransaction();
        expect(transaction).not.toBe(undefined)
      })
      const transaction = transactionManager.getCurrentTransaction();
      expect(transaction).toBe(undefined)
    })

    it('transactions from concurent transaction wrappers not same', async () => {
      let a, b

      await Promise.all([
        transactionWrapper(() => {
          a = transactionManager.getCurrentTransaction();
        }),

        transactionWrapper(() => {
          b = transactionManager.getCurrentTransaction();
        })
      ])

      expect(a).not.toStrictEqual(b)
    })

    it('transactions from different transaction wrappers not same', async () => {
      let a, b

      await transactionWrapper(() => {
        a = transactionManager.getCurrentTransaction();
      })

      await transactionWrapper(() => {
        b = transactionManager.getCurrentTransaction();
      })

      expect(a).not.toStrictEqual(b)
    })

    it('nested transactions not the same', async () => {
      let a, b

      await transactionWrapper(async () => {
        a = transactionManager.getCurrentTransaction();
        await transactionWrapper(() => {
          b = transactionManager.getCurrentTransaction();
        })
      })

      expect(a).not.toStrictEqual(b)
    })
  })
});

type MeterString = `${number} m`;

function loh(it: MeterString) {

}
function add(a: number): Add<typeof a, 1> {
  throw ''
}

function ok<T extends string>(...a: T[]): typeof a {
  throw ''
}


class StringBuilder<C = {}> {
  add<T extends string>(c: T): StringBuilder<C | T> {
    throw ''
  }

  build(): { identifier: C }[] {
    throw ''
  }
}

function test() {

  const shit = new StringBuilder()
    .add('sdfsd')
    .add('fsdfsd')
    .add('kmkmkm')
    .add('sdfsd sdkfm skmkdsf')
    .add('sdfksd smdkfmskdm msdfmk')
    .build()

  for (let x of shit) {
    if (x.identifier == '') {

    }
  }

  ok(' ', 'b', 'kkmk')


  loh('10 m')

  const c = add(1 as const)
}


