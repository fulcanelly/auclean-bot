
export type AnyObject = Record<string, any>;export type OmitProps<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
export type OmitFunctions<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
};
export type NonFunctionProps<T> = {
  [K in keyof T]: T[K] extends Function ? never : T[K];
};
export type ServiceParams = '__existsInDatabase' | 'dataValues' | 'changed' | 'labels';


export type WhereParamsOf<T> = Partial<OmitProps<OmitFunctions<NonFunctionProps<T>>, ServiceParams>>;
export type SaverObject = { save: (args?: { merge?: boolean; }) => Promise<void>; };

