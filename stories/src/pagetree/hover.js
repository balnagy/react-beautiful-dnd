// @flow

import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import { Draggable, Droppable, DragDropContext } from '../../../src';

import Navigation, { AkNavigationItem } from '@atlaskit/navigation';
import type {FlattenItem} from './types';
import {childIndex, flattenTree, getItem, isSameLevel, parentPath} from './tree-utils';
import AkIconChevronDown from "@atlaskit/icon/glyph/chevron-down";
import dot from './hover.css';

const Container = styled.div`
  display: flex;
`;

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  // make a shallow copy so we do not modify the original array
  const result: any[] = Array.from(list);

  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const isDraggingClassName = 'isdragging';

const getTree = (): (Tree) => {
  return {
    id: '0',
    content: '__root',
    children: [
      {
        id: '1', content: 'About', children: [
        {id: '8', content: 'What?'},
        {id: '9', content: 'How?'},
        {id: '10', content: 'When?'}
      ]
      },
      {id: '2', content: 'Sightings'},
      {id: '3', content: 'Gear'},
      {id: '4', content: 'History'},
      {id: '5', content: 'Balazs'},
      {id: '6', content: 'Edith'},
      {id: '7', content: 'David'},
    ]
  }
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

    if (destination == null) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      console.error('unsupported use case');
      return;
    }

    const flattenItems: FlattenItem[] = flattenTree(this.state.tree);
    const sourcePath = flattenItems[source.index].path;
    const destinationPath = flattenItems[destination.index].path;

    if(isSameLevel(sourcePath, destinationPath)) {
      console.log('Moving leaf on the same level');
      const parent = getItem(this.state.tree, parentPath(sourcePath));
      if(parent) {
        parent.children = reorder(
          parent.children,
          childIndex(sourcePath),
          childIndex(destinationPath),
        );
      }
    } else {
      let itemToMove = getItem(this.state.tree, sourcePath);
      const sourceParent = getItem(this.state.tree, parentPath(sourcePath));
      const destinationParent = getItem(this.state.tree, parentPath(destinationPath));
      sourceParent.children.splice(childIndex(sourcePath), 1);
      // If moving between level it's not shifting up when moving
      const extraOffset = destination.index > source.index ? 1 : 0;
      destinationParent.children.splice(childIndex(destinationPath) + extraOffset, 0, itemToMove);
    }

    const tree = {...this.state.tree};
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
              <div style={{paddingLeft: item.path.length * 35}}>
                <AkNavigationItem
                    isDragging={snapshot.isDragging}
                    onClick={() => console.log(`clicking on ${item.content}`)}
                    text={item.content}
                    dnd={provided}
                    isSelected={provided.isHovered}
                    icon={item.children ? <AkIconChevronDown label="" size='medium' /> : <span className={dot}>&bull;</span>}
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
