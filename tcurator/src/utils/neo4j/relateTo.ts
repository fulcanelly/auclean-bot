import { Neo4jSupportedProperties, NeogmaInstance, NeogmaModel, QueryBuilder } from 'neogma';
import { neogma } from '@/neo4j';
import { ServiceParams } from './types';
import { NonFunctionProps } from './types';
import { OmitFunctions } from './types';
import { OmitProps } from './types';
import { AnyObject } from './types';


export async function relateTo<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject,
  I extends keyof R = keyof R
>(params: {
  from: NeogmaInstance<P, R, M>;
  alias: I;
  merge?: boolean;
} & (
    {
      where: Partial<OmitProps<OmitFunctions<NonFunctionProps<R[I]['Instance']>>, ServiceParams>>;
      target?: undefined;
    } |
    {
      target: R[I]['Instance'];
      where?: undefined;
    })
): Promise<void> {
  const from = params.from;
  const fromModel = neogma.modelsByName[from!.labels[0]] as NeogmaModel<any, any>;

  const getWhereParamsByModel = (model: NeogmaModel<any, any>, instance: NeogmaInstance<any, any>) => {
    const key = model.getPrimaryKeyField();
    if (key) {
      return Object.fromEntries([
        [key, instance[key]]
      ]);
    } else {
      return instance.dataValues;
    }
  };

  const relation = fromModel.getRelationshipByAlias(params.alias);
  const targetModel = relation.model as NeogmaModel<any, any>;

  let targetWhere: any;

  if (params.target) {
    const target = params.target;
    targetWhere = getWhereParamsByModel(targetModel, target);
  } else {
    targetWhere = params.where;
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
    });

  const func = params.merge ? match.merge : match.create;

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
  }).run(neogma.queryRunner);
}
