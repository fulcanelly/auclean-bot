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


type RelOrNode = (RelationType | NodeType)

type BuildType<I extends any | undefined = undefined> = () =>
  I extends undefined ?
  RelOrNode[] :
  (RelOrNode & { identifier: I })[]

type NonNullUndefined<T> = NonNullable<T> extends never ? undefined : NonNullable<T>

type RecursiveRelsOf<
  R extends AnyObject,
  I extends any | undefined,
> = {
    [K in keyof R]: R[K] extends { Instance: infer InstanceType }
    ? {
      [C in keyof RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1], I>]:
      RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1], I>[C]
    } & {
      build: BuildType<I>,

      where: (args: WhereParamsOf<ExtractTypesOfInstance<InstanceType>[0]>)
        => RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1], I> & { build: BuildType<I> },

      exact: (instance: ExtractTypesOfInstance<InstanceType>[0])
        => RecursiveRelsOf<ExtractTypesOfInstance<InstanceType>[1], I> & { build: BuildType<I> },

      <
        N extends string | undefined = undefined,
        R extends string | undefined = undefined
      >(args?: {
        nodeIdentifier?: N,
        relIdentifier?: R
      }): RecursiveRelsOf<
        ExtractTypesOfInstance<InstanceType>[1], NonNullUndefined<I | N | R | undefined>
      > & { build: BuildType<NonNullUndefined<I | N | R>> };
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
  M extends AnyObject,
  I extends string
>({ fromI, fromM, identifier }: {
  fromI?: NeogmaInstance<P, R, M> | undefined,
  fromM?: NeogmaModel<P, R, M> | undefined,
  identifier?: I,
}): RecursiveRelsOf<R, I> {
  const startModel = getModelFrom({ fromI, fromM }) as NeogmaModel<P, R, M>

  type PathType = (RelationType | NodeType) & { identifier?: string }
  const buildRels = (model: NeogmaModel<any, any, any>, path: PathType[] = [], nodeIdentifier?: string): RecursiveRelsOf<any, any> => {
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

    return res as any as RecursiveRelsOf<any, any>;
  };

  return buildRels(startModel as any, [], identifier);
}

