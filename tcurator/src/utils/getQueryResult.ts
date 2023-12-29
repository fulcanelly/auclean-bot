import { Neo4jSupportedProperties, NeogmaModel } from "neogma";
import { QueryResult } from "neo4j-driver";
import { recordToObject } from '@/utils/record_to_object';
import { AnyObj } from '../../test/main.test';



export function getQueryResult<
  T extends Neo4jSupportedProperties,
  D extends AnyObj,
  K extends AnyObj,
  J extends AnyObj>(queryResult: QueryResult, model: NeogmaModel<T, D, K, J>, key: string) {
  return queryResult.records.map(recordToObject).map(it => it[key]).map(model.buildFromRecord);
}
