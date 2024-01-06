import '@/rmq'
import '@/models/__relations'
import * as R from 'ramda'

import { Channel, ChannelInstance } from "@/models/channel";
import { neogma } from "@/neo4j";
import { Neo4jSupportedProperties, NeogmaInstance, NeogmaModel } from "neogma";

export type AnyObject = Record<string, any>

export type OmitProps<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export type OmitFunctions<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
}

export type NonFunctionProps<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K];
}

export type ServiceParams = '__existsInDatabase' | 'dataValues' | 'changed' | 'labels';

export type WhereParamsOf<T> = Partial<OmitProps<OmitFunctions<NonFunctionProps<T>>, ServiceParams>>
export type SaverObject = { save: (args?: { merge?: boolean }) => Promise<void> }




type ExtractTypesOfNInstance<T> = T extends NeogmaInstance<infer P, infer R, infer M> ? [P, R, M] : never;


type RelationType
  = {
    direction: 'in' | 'out' | 'none';
    name: string;
  } // thats basically part of // : Pick<any, "name" | "direction" | "model">

type NodeType
  = {
    label: string;
  } // you can get this from model -  NeogmaModel<any, any>

type BuildType = () => (RelationType | NodeType)[]

type RecursiveRelsOf<R extends AnyObject> = {
  [K in keyof R]: R[K] extends { Instance: infer InstanceType }
  ? {
    [C in keyof RecursiveRelsOf<ExtractTypesOfNInstance<InstanceType>[1]>]:
    RecursiveRelsOf<ExtractTypesOfNInstance<InstanceType>[1]>[C]
  } & {
    build: BuildType,
    (args?: {
      nodeIdentifier?: string,
      relIdentifier?: string
    }): RecursiveRelsOf<ExtractTypesOfNInstance<InstanceType>[1]> & { build: BuildType };
  }

  : never;
};



export function rel_build_of<
  P extends Neo4jSupportedProperties,
  R extends AnyObject,
  M extends AnyObject
>({ fromI, fromM }: {
  fromI?: NeogmaInstance<P, R, M> | undefined,
  fromM?: NeogmaModel<P, R, M> | undefined,
}): RecursiveRelsOf<R> {
  const getModel = (): NeogmaModel<P, R, M> => {
    if (fromI) {
      return neogma.modelsByName[fromI.labels[0]] as any
    } else if (fromM) {
      return fromM;
    } else {
      throw new Error('Either fromI or fromM must be provided');
    }
  }

  type PathType = (RelationType | NodeType) & { identifier?: string }
  const buildRels = (model: NeogmaModel<any, any, any>, path: PathType[] = [], nodeIdentifier?: string): RecursiveRelsOf<any> => {
    const currentPath = [
      ...path,
      {
        label: model.getModelName()
      }
    ]

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
      build: R.always(currentPath)
    });

    for (const alias in model.relationships) {
      const rel = model.relationships[alias] as any;

      Object.defineProperty(res, alias, {
        get: () => buildRels(rel.model, [
          ...currentPath,
          {
            direction: rel.direction,
            name: rel.name
          },
        ]),
        enumerable: true,
        configurable: true
      })
    }

    return res as any as RecursiveRelsOf<any>;
  };

  return buildRels(getModel() as any);
}



