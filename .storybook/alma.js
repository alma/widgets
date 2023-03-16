import { create } from '@storybook/theming'
import logo from './public/alma-orange.svg'
import React from 'react'

export default create({
  base: 'light',
  brandTitle: 'Alma PoS storybook',
  brandUrl: 'https://getalma.eu/',
  brandImage: logo,
  brandTarget: '_blank',

  colorPrimary: '#60d2df',
  colorSecondary: '#fa5022',
  fontBase: 'venn',

  // UI
  appBg: '#f9f9f9',
  appContentBg: '#fff',
  appBorderRadius: 4,

  // Text colors
  textColor: '#1a1a1a',
  textInverseColor: '#f9f9f9',

  // Toolbar default and active colors
  barTextColor: '#6C6C6C',
  barSelectedColor: '#1a1a1a',
  barBg: '#f9f9f9',
})
