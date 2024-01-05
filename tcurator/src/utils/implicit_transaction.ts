
import { AsyncLocalStorage } from 'async_hooks';
const asyncLocalStorage = new AsyncLocalStorage();

let counter = 1

export class TransactionManager {
  currentTransaction: any

  constructor() { }

  startTransaction() {

  }

  getCurrentTransaction() {
    return asyncLocalStorage.getStore();
  }

  async commit() {
    this.currentTransaction = null;
  }

  async rollback() {
    this.currentTransaction = null;
  }
}

export async function transactionWrapper(callback) {
  const transactionManager = new TransactionManager();

  let currentTransaction = {
    id: counter++
  }

  await asyncLocalStorage.run(currentTransaction, async () => {
    try {
      transactionManager.startTransaction();
      await callback();
      await transactionManager.commit();
    } catch (error) {
      await transactionManager.rollback();
      throw error;
    }
  })

}

export const transactionManager = new TransactionManager()


