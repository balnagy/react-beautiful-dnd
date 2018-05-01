// @flow

export type Tree = Item;

export type Item = {|
  id: string,
  content: string,
  children: Tree,
|};

export type FlattenItem = {|
  id: string,
  content: string,
  children: Tree,
  path: Path,
|};

export type Path = number[];
