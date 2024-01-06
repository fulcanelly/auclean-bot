import '@/rmq'
import '@/models/__relations'
import * as R from 'ramda'

import { neogma } from "@/neo4j";
import { Neo4jSupportedProperties, NeogmaInstance, NeogmaModel } from "neogma";
import { AnyObject, WhereParamsOf } from './types';


type ExtractTypesOfInstance<T> = T extends NeogmaInstance<infer P, infer R, infer M> ? [P, R, M] : never;


type RelationType
  = {
    direction: 'in' | 'out' | 'none';
    name: string;
  }

type NodeType
  = {
    label: string;
  }

type BuildType = () => (RelationType | NodeType)[]

type RecursiveRelsOf<R extends AnyObject> = {
  [K in keyof R]: R[K] extends { Instance: infer InstanceType }
  ? {
    [C in keyof RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1]>]:
    RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1]>[C]
  } & {
    build: BuildType,

    where: (args: WhereParamsOf<ExtractTypesOfInstance<InstanceType>[0]>)
      => RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1]> & { build: BuildType },

    exact: (instance: ExtractTypesOfInstance<InstanceType>[0])
      => RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1]> & { build: BuildType },

    (args?: {
      nodeIdentifier?: string,
      relIdentifier?: string
    }): RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1]> & { build: BuildType };
  }

  : never;
};


function getModelFrom(args: {
  fromI?: NeogmaInstance<any, any, any> | undefined,
  fromM?: NeogmaModel<any, any, any, any> | undefined,
}) {
  const { fromI, fromM } = args
  if (fromI) {
    return neogma.modelsByName[fromI.labels[0]] as any
  } else if (fromM) {
    return fromM;
  } else {
    throw new Error('Either fromI or fromM must be provided');
  }
}

export function rel_build_of<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject
>({ fromI, fromM, identifier }: {
  fromI?: NeogmaInstance<P, R, M> | undefined,
  fromM?: NeogmaModel<P, R, M> | undefined,
  identifier?: string,
}): RecursiveRelsOf<R> {
  const startModel = getModelFrom({ fromI, fromM }) as NeogmaModel<P, R, M>

  type PathType = (RelationType | NodeType) & { identifier?: string }
  const buildRels = (model: NeogmaModel<any, any, any>, path: PathType[] = [], nodeIdentifier?: string): RecursiveRelsOf<any> => {
    const currentPath = path
      .concat({
        label: model.getModelName()
      })

    if (nodeIdentifier) {
      currentPath[currentPath.length - 1].identifier = nodeIdentifier
    }

    const res = (args: {
      nodeIdentifier?: string,
      relIdentifier?: string
    }) => {
      const pathWithIdentifiers = R.init(currentPath)
      const { nodeIdentifier, relIdentifier } = args

      if (relIdentifier) {
        pathWithIdentifiers[pathWithIdentifiers.length - 1].identifier = relIdentifier
      }

      return buildRels(model, pathWithIdentifiers, nodeIdentifier)
    };

    Object.assign(res, {
      build: R.always(currentPath),
      where: null,
      exact: null,
    });

    const defineRelationshipGetter = ({ rel, alias }) =>
      Object.defineProperty(res, alias, {
        get: () => buildRels(rel.model,
          currentPath.concat({
            direction: rel.direction,
            name: rel.name
          })),
        enumerable: true,
        configurable: true
      })

    Object.keys(model.relationships)
      .map(alias => ({ alias, rel: model.relationships[alias]! }))
      .forEach(defineRelationshipGetter)

    return res as any as RecursiveRelsOf<any>;
  };

  return buildRels(startModel as any, [], identifier);
}

