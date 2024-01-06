import { Neo4jSupportedProperties, NeogmaModel } from "neogma";
import { QueryResult } from "neo4j-driver";
import { recordToObject } from '@/utils/neo4j/record_to_object';
import { AnyObject } from './types';


export function getQueryResult<
  T extends Neo4jSupportedProperties,
  D extends AnyObject,
  K extends AnyObject,
  J extends AnyObject>(queryResult: QueryResult, model: NeogmaModel<T, D, K, J>, key: string) {
  return queryResult.records.map(recordToObject).map(it => it[key]).map(model.buildFromRecord);
}
