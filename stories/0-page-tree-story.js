// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import NavigationWithDragAndDrop from './src/pagetree/hover';

storiesOf('PageTree', module)
  .add('Hover experience', () => (
    <NavigationWithDragAndDrop />
  ));
