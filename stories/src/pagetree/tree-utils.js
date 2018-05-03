// @flow

import type {FlattenItem, FlattenTree, Item, Path, Tree} from './types';

export const flattenTree: FlattenItem[] = (tree: Tree, path: Path = []) => {
  if (tree.children && Array.isArray(tree.children) && tree.children.length > 0) {
    return tree.children.reduce(function (flat, item, index) {
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

export const hasSameParent: boolean = (a: Path, b: Path) => {
  return a && b && a.length === b.length && parentPath(a).every((v, i) => v === b[i]);
};

export const parentPath: Path = (child: Path) => {
  return child.slice(0, child.length - 1);
};

export const isSamePath: boolean = (a: Path, b: Path) => {
  if (!a || !b) {
    return false;
  }
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

export const getItem: Item = (tree: Tree, path: Path) => {
  let cursor: Item = tree;
  for (let i of path) {
    cursor = cursor.children[i];
  }
  return cursor;
};

const isParentOf: boolean = (parent: Path, child: Path) => parent && child && isSamePath(parent, parentPath(child));

export const childIndex: number = (child: Path) => child[child.length - 1];

export const moveItemOnTree: Tree = (tree: Tree, sourcePath: Path, destinationPath: Path) => {
  const newTree = {...tree};
  console.log('Source: ', sourcePath);
  console.log('Destination: ', destinationPath);
  let itemToMove = getItem(newTree, sourcePath);
  const sourceParent = getItem(newTree, parentPath(sourcePath));
  const destinationParent = getItem(newTree, parentPath(destinationPath));
  sourceParent.children.splice(childIndex(sourcePath), 1);
  // We need extra offset if there is no shift in the destination array, ugly solution
  destinationParent.children.splice(childIndex(destinationPath), 0, itemToMove);
  return newTree;
};

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  // make a shallow copy so we do not modify the original array
  const result: any[] = Array.from(list);

  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const isBeginningOfTheList = (upperPath: Path, lowerPath: Path) => !upperPath || isParentOf(upperPath, lowerPath);

export const getSourcePath = (flattenTree: FlattenTree, sourceIndex: number) => flattenTree[sourceIndex].path;

export const getDestinationPath = (flattenTree: FlattenTree, destinationIndex: number, sourceIndex: number) => {
  const down = destinationIndex > sourceIndex;
  const sourcePath = getSourcePath(flattenTree, sourceIndex);
  const upperPath = down ? flattenTree[destinationIndex].path : flattenTree[destinationIndex - 1] && flattenTree[destinationIndex - 1].path;
  const lowerPath = down ? flattenTree[destinationIndex + 1] && flattenTree[destinationIndex + 1].path : flattenTree[destinationIndex].path;

  console.log('Upperpath: ', upperPath);
  console.log('Lowerpath: ', lowerPath);

  // Inserting between 2 items on the same level
  if (hasSameParent(upperPath, lowerPath)) {
    if (down && !hasSameParent(upperPath, sourcePath)) {
      return lowerPath;
    } else {
      return flattenTree[destinationIndex].path;
    }
  }

  // Beginning of the list
  if (isBeginningOfTheList(upperPath, lowerPath)) {
    return lowerPath;
  }

  // End of list ambiguous case
  // Priority order of disambiguation
  // 1. Stay on the same level

  if (!lowerPath || upperPath.length === sourcePath.length) {
    // Insert to the upper list
    let newPath = [...upperPath];
    if (!hasSameParent(upperPath, sourcePath)) {
      newPath[newPath.length - 1] += 1;
    }
    return newPath;
  }

  let newPath = [...lowerPath];
  if (down) {
    newPath[newPath.length - 1] -= 1;
  }
  return newPath;
};
