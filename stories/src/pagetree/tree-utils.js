// @flow

import type {FlattenItem, FlattenTree, Item, Path, Tree} from './types';

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

export const hasSameParent: boolean = (a: Path, b: Path) => {
  return a.length === b.length && parentPath(a).every((v, i)=> v === b[i]);
};

export const parentPath: Path = (child: Path) => {
  return child.slice(0, child.length - 1);
};

export const isSamePath: boolean = (a: Path, b: Path) => {
  if(!a || !b) {
    return false;
  }
  return a.length === b.length && a.every((v, i)=> v === b[i]);
};

export const getItem: Item = (tree: Tree, path: Path) => {
  let cursor: Item = tree;
  for(let i of path) {
    cursor = cursor.children[i];
  }
  return cursor;
};

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
  const extraOffset = hasSameParent(sourcePath, destinationPath) || destinationPath[destinationPath.length - 1] === 0 ? 0 : 1;
  console.log('Extra offset: ', extraOffset);
  destinationParent.children.splice(childIndex(destinationPath) + extraOffset, 0, itemToMove);
  return newTree;
};

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  // make a shallow copy so we do not modify the original array
  const result: any[] = Array.from(list);

  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const getSourcePath = (flattenTree: FlattenTree, sourceIndex: number) => flattenTree[sourceIndex].path;

export const getDestinationPath = (flattenTree: FlattenTree, destinationIndex: number, down: boolean) => {
  if(down) {
    const movedUpPath = flattenTree[destinationIndex].path;
    const nextItemPath = flattenTree[destinationIndex + 1] && flattenTree[destinationIndex + 1].path;

    // Moving within the same level
    if(nextItemPath && hasSameParent(movedUpPath, nextItemPath)) {
      return movedUpPath;
    }

    // Move to the beginning of the list
    let nextItemParentPath = nextItemPath && parentPath(nextItemPath);
    if(nextItemParentPath && isSamePath(movedUpPath, nextItemParentPath)) {
      return [...nextItemParentPath, 0];
    }

    // Move to the end of the list
    let newPath = [...movedUpPath];
    newPath[newPath.length - 1] += 1;

    return newPath;
  } else {
    const movedDownPath = flattenTree[destinationIndex].path;
    const nextItemPath = flattenTree[destinationIndex - 1] && flattenTree[destinationIndex - 1].path;

    // Moving within the same level
    if(nextItemPath && hasSameParent(movedDownPath, nextItemPath)) {
      return movedDownPath;
    }

    // Move to the beginning of the list
    let movedDownParentPath = parentPath(movedDownPath);
    if(nextItemPath && isSamePath(movedDownParentPath, nextItemPath)) {
      return [...movedDownParentPath, 0];
    }

    // Move to the end of the list
    return movedDownPath;
  }
};
