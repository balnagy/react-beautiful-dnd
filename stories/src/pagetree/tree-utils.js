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
  destinationParent.children = destinationParent.children || [];
  destinationParent.children.splice(childIndex(destinationPath), 0, itemToMove);
  return newTree;
};

const isBeginningOfTheList = (upperPath: Path, lowerPath: Path) => !upperPath || isParentOf(upperPath, lowerPath);

export const getSourcePath = (flattenTree: FlattenTree, sourceIndex: number) => flattenTree[sourceIndex].path;

export const getDestinationPath = (flattenTree: FlattenTree, destinationIndex: number, sourceIndex: number, droppedLevel: number) => {
  const down = destinationIndex > sourceIndex;
  const samePlace = destinationIndex === sourceIndex;
  const sourcePath = getSourcePath(flattenTree, sourceIndex);
  const upperPath = down ? flattenTree[destinationIndex].path : flattenTree[destinationIndex - 1] && flattenTree[destinationIndex - 1].path;
  const lowerPath = down || samePlace ? flattenTree[destinationIndex + 1] && flattenTree[destinationIndex + 1].path : flattenTree[destinationIndex].path;

  console.log('Upperpath: ', upperPath);
  console.log('Lowerpath: ', lowerPath);

  const lowestLevel = lowerPath ? lowerPath.length : 1;
  const highestLevel = upperPath.length + 1;
  const finalLevel = Math.min(Math.max(droppedLevel, lowestLevel), highestLevel);

  if(samePlace && finalLevel === sourcePath.length) {
    return sourcePath;
  }

  // Inserting between 2 items on the same level
  if (hasSameParent(upperPath, lowerPath)) {
    if(finalLevel === upperPath.length) {
      if ((samePlace || down) && !hasSameParent(upperPath, sourcePath)) {
        return lowerPath;
      } else {
        return flattenTree[destinationIndex].path;
      }
    } else if(finalLevel > upperPath.length) {
      return [...upperPath, 0];
    }
  }

  // Beginning of the list
  if (isBeginningOfTheList(upperPath, lowerPath)) {
    return lowerPath;
  }

  // End of list

  if(finalLevel > upperPath.length) {
    // New child of the upper item
    return [...upperPath, 0];
  }

  if(finalLevel === upperPath.length) {
    // Insert to the upper list
    let newPath = [...upperPath];
    if (!hasSameParent(upperPath, sourcePath)) {
      newPath[newPath.length - 1] += 1;
    }
    return newPath;
  }

  const afterItem = upperPath.slice(0, finalLevel);
  let newPath = [...afterItem];
  if (!hasSameParent(afterItem, sourcePath)) {
    newPath[newPath.length - 1] += 1;
  }
  return newPath;

};
