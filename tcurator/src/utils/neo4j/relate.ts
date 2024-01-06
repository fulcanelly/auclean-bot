import { Neo4jSupportedProperties, NeogmaInstance, NeogmaModel } from 'neogma';
import { neogma } from '@/neo4j';
import { relateTo } from './relateTo';
import { SaverObject } from './types';
import { WhereParamsOf } from './types';
import { AnyObject } from './types';


export function relate<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject,
  I extends keyof R = keyof R
>(
  from: NeogmaInstance<P, R, M>
): {
    [K in I]: {
      (args: R[K]['Instance']): SaverObject;
      where: (args: WhereParamsOf<R[K]['Instance']>) => SaverObject;
    };
  } {
  type Instance = R[I]['Instance'];
  type Where = WhereParamsOf<R[I]['Instance']>;

  const fromModel = neogma.modelsByName[from.labels[0]] as NeogmaModel<any, any>;
  const keys = Object.keys(fromModel.relationships);

  const regular = keys
    .map(alias => {
      const saveTarget = (target: Instance) => ({
        save: ({ merge } = { merge: true }) => relateTo({ from, alias, target, merge })
      });

      const saveWhere = (where: Where) => ({
        save: ({ merge } = { merge: true }) => relateTo({ from, alias, where, merge })
      });

      saveTarget.where = saveWhere;

      return [alias, saveTarget];
    });

  return Object.fromEntries(regular);
}
