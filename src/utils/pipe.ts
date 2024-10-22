export type Fn = (input: string) => string;
export const pipe = (input: string, ...fns: Fn[]) => fns.reduce((acc, fn) => fn(acc), input);
