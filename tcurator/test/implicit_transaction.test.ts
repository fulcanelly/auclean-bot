import { transactionManager, transactionWrapper } from "@/utils/implicit_transaction";

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
      expect(a).not.toStrictEqual(b) //toStrictEqual({})

    })

    it('transactions from different transaction wrappers not same', async () => {
      let a, b
      await transactionWrapper(() => {
        a = transactionManager.getCurrentTransaction();
      })

      await transactionWrapper(() => {
        b = transactionManager.getCurrentTransaction();
      })

      expect(a).not.toStrictEqual(b) //toStrictEqual({})
    })
  })
});
