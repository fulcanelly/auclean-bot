
import { AsyncLocalStorage } from 'async_hooks';
import { QueryBuilder } from 'neogma';
import { logger } from '../logger';
const asyncLocalStorage = new AsyncLocalStorage();

let counter = 1

export class TransactionManager {
  currentTransaction: any

  constructor() { }

  startTransaction() { }

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

export async function transactionWrapper<T>(callback: () => Promise<T> | T) {
  const transactionManager = new TransactionManager();

  let currentTransaction = {
    id: counter++
  }

  await asyncLocalStorage.run(currentTransaction, async () => {
    try {
      transactionManager.startTransaction();
      return await callback();
      await transactionManager.commit();
    } catch (error) {
      await transactionManager.rollback();
      throw error;
    }
  })

}

export const transactionManager = new TransactionManager()


const origianlQueryyBuilderRun = QueryBuilder.prototype.run

QueryBuilder.prototype.run = function(this, a, b) {
  // TODO add asyncLocalStorage
  // asyncLocalStorage.enterWith
  // asyncLocalStorage.exit()
  const sessiong = asyncLocalStorage.getStore() ?? b

  logger.silly({ b })
  return origianlQueryyBuilderRun.bind(this)(a, b)
}
