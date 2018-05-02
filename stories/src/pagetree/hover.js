// @flow

import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import { Draggable, Droppable, DragDropContext } from '../../../src';

import Navigation, { AkNavigationItem } from '@atlaskit/navigation';
import type {FlattenItem, Tree} from './types';
import {
  flattenTree, getDestinationPath, getSourcePath, moveItemOnTree
} from './tree-utils';
import AkIconChevronDown from "@atlaskit/icon/glyph/chevron-down";
import {dot} from './hover.css';
import {tree} from './getTree';

const Container = styled.div`
  display: flex;
`;

const Dot = styled.span`
    display: flex;
    width: 24px;
    height: 32px;
    justify-content: center;
    font-size: 12px;
    line-height: 32px;
`;

const isDraggingClassName = 'isdragging';

const getTree = (): (Tree) => {
  return tree;
};

type State = {
  tree: Tree,
};

export default class NavigationWithDragAndDrop extends Component<void, State> {
  state = {
    tree: getTree(),
  };

  componentDidMount() {
    // eslint-disable-next-line no-unused-expressions
    injectGlobal`
      body.${isDraggingClassName} {
        cursor: grabbing;
        user-select: none;
      }
    `;
  }

  onDragStart = () => {
    if (document.body) {
      document.body.classList.add(isDraggingClassName);
    }
  };

  onDragEnd = (result: Object) => {
    if (document.body) {
      document.body.classList.remove(isDraggingClassName);
    }

    const source = result.source;
    const destination = result.destination;

    if (destination === null) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      console.error('unsupported use case');
      return;
    }

    const flattenItems: FlattenItem[] = flattenTree(this.state.tree);
    const sourcePath = getSourcePath(flattenItems, source.index);
    const destinationPath = getDestinationPath(flattenItems, destination.index, destination.index > source.index);
    const tree = moveItemOnTree(this.state.tree, sourcePath, destinationPath);

    this.setState({
      tree,
    });
  };

  renderContainerItems = () => {
    const items: FlattenItem[] = flattenTree(this.state.tree);

    console.log(items);

    return items.map((item: FlattenItem, index) => (
        <Draggable draggableId={item.id} index={index} key={item.id}>
          {(provided, snapshot) => (
              <div style={{paddingLeft: (item.path.length - 1) * 35}}>
                <AkNavigationItem
                    isDragging={snapshot.isDragging}
                    onClick={() => console.log(`clicking on ${item.content}`)}
                    text={item.content}
                    dnd={provided}
                    isSelected={provided.isHovered}
                    icon={item.children ? <AkIconChevronDown label="" size='medium' /> : <Dot>&bull;</Dot>}
                />
                {provided.placeholder}
              </div>
          )}
        </Draggable>
    ));
  };

  renderContainerContent = () => {
    const containerItems = this.renderContainerItems();
    return (
        <DragDropContext
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
        >
          <Droppable droppableId="list">
            {dropProvided => (
                <div ref={dropProvided.innerRef}>{containerItems}</div>
            )}
          </Droppable>
        </DragDropContext>
    );
  };

  render() {
    return (
        <Container>
          <Navigation>{this.renderContainerContent()}</Navigation>
        </Container>
    );
  }
}
