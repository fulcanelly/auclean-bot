import neo4j, { RecordShape } from 'neo4j-driver';
import { logger } from './logger';
import { processTransaction } from '@/sentry';


const originalRun = neo4j.Session.prototype.run;

type func = typeof originalRun

type Query = Parameters<func>[0]
type TransactionConfig = Parameters<func>[2]
type Result<T extends RecordShape> = ReturnType<typeof originalRun<T>>

async function patchedRun<R extends RecordShape = RecordShape>(this, query: Query, parameters?: any, transactionConfig?: TransactionConfig): Promise<Result<R>> {
  const startTime = Date.now()
  const result = await originalRun.bind(this)(query, parameters, transactionConfig)
  const executionTime = Date.now() - startTime; // Calculate elapsed time

  logger.debug('Query: ' + query, {
    tookMs: executionTime,
    parameters
  })

  processTransaction(query, executionTime, parameters)
  return result
}

neo4j.Session.prototype.run = patchedRun as any



