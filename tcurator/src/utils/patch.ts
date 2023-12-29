import neo4j, { RecordShape } from 'neo4j-driver';
import { logger } from './logger';
import { processTransaction } from '@/sentry';
import { Neo4jSupportedProperties, NeogmaInstance, NeogmaModel, QueryBuilder } from 'neogma';
import { neogma } from '@/neo4j';


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


export type AnyObject = Record<string, any>

export type OmitProps<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type OmitFunctions<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
}

export type NonFunctionProps<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K];
}

export type ServiceParams = '__existsInDatabase' | 'dataValues' | 'changed' | 'labels';

export async function relateTo<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject,
  I extends keyof R = keyof R
>(params: {
  from: NeogmaInstance<P, R, M>,
  alias: I,
  merge?: boolean,
} & (
    {
      where: Partial<OmitProps<OmitFunctions<NonFunctionProps<R[I]['Instance']>>, ServiceParams>>,
      target?: undefined
    } |
    {
      target: R[I]['Instance'],
      where?: undefined
    }
  )
): Promise<void> {
  const from = params.from
  const fromModel = neogma.modelsByName[from!.labels[0]] as NeogmaModel<any, any>

  const getWhereParamsByModel = (model: NeogmaModel<any, any>, instance: NeogmaInstance<any, any>) => {
    const key = model.getPrimaryKeyField()
    if (key) {
      return Object.fromEntries([
        [key, instance[key]]
      ])
    } else {
      return instance.dataValues
    }
  }

  const relation = fromModel.getRelationshipByAlias(params.alias)
  const targetModel = relation.model as NeogmaModel<any, any>

  let targetWhere: any

  if (params.target) {
    const target = params.target
    targetWhere = getWhereParamsByModel(targetModel, target)
  } else {
    targetWhere = params.where
  }

  const match = new QueryBuilder()
    .match({
      where: getWhereParamsByModel(fromModel, from),
      identifier: 'a',
      model: fromModel
    })
    .match({
      where: targetWhere,
      identifier: 'b',
      model: targetModel
    })

  const func = params.merge ? match.merge : match.create

  await func.bind(match)({
    related: [
      {
        identifier: 'a',
      },
      relation,
      {
        identifier: 'b',
      }
    ]
  }).run(neogma.queryRunner)
}


type WhereParamsOf<T> = Partial<OmitProps<OmitFunctions<NonFunctionProps<T>>, ServiceParams>>

type SaverObject = { save: (args?: { merge?: boolean }) => Promise<void> }

export function relate<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject,
  I extends keyof R = keyof R,
>(
  from: NeogmaInstance<P, R, M>,
): {
    [K in I]: {
      (args: R[K]['Instance']): SaverObject
      where: (args: WhereParamsOf<R[K]['Instance']>) => SaverObject
    }
  } {
  type Instance = R[I]['Instance']
  type Where = WhereParamsOf<R[I]['Instance']>

  const fromModel = neogma.modelsByName[from.labels[0]] as NeogmaModel<any, any>;
  const keys = Object.keys(fromModel.relationships)

  const regular = keys
    .map(alias => {
      const saveTarget = (target: Instance) => ({
        save: ({ merge } = { merge: true}) => relateTo({ from, alias, target, merge })
      })

      const saveWhere = (where: Where) => ({
        save: ({ merge } = { merge: true}) => relateTo({ from, alias, where, merge })
      })

      saveTarget.where = saveWhere

      return [alias, saveTarget]
    })

  return Object.fromEntries(regular)
}
