// @flow

import type {FlattenItem, Item, Path, Tree} from './types';

export const flattenTree: FlattenItem[] = (tree: Tree, path: Path = []) => {
  if(tree.children && Array.isArray(tree.children) && tree.children.length > 0) {
    return tree.children.reduce(function(flat, item, index) {
      let currentPath = [...path, index];
      let currentItem = {
        ...item,
        path: currentPath,
      };
      let children = Array.isArray(item.children) ? flattenTree(item, currentPath) : [];
      return flat.concat([
        currentItem,
        ...children
      ]);
    }, []);
  } else {
    return []
  }
};

export const isSameLevel: boolean = (a: Path, b: Path) => {
  return a.length === b.length && parentPath(a).every((v, i)=> v === b[i]);
};

export const parentPath: Path = (child: Path) => {
  console.log(child);
  return child.slice(0, child.length - 1);
};

export const getItem: Item = (tree: Tree, path: Path) => {
  let cursor: Item = tree;
  for(let i of path) {
    cursor = cursor.children[i];
  }
  return cursor;
};

export const childIndex: number = (child: Path) => child[child.length - 1];
