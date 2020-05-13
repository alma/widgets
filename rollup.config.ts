import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import {uglify} from 'rollup-plugin-uglify';
import visualizer from 'rollup-plugin-visualizer';
import image from '@rollup/plugin-image';


const pkg = require('./package.json');
const libraryName = 'alma-widgets';

const baseConfig = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Allow image resolution
    image(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({jsnext: true, preferBuiltins: true, browser: true}),
    // Compile TypeScript files
    typescript(
      {
        useTsconfigDeclarationDir: true,
        // Since imported *.svg will be transformed to ES modules by the image plugin above, tell
        // TypeScript to process them
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '*.svg', '**/*.svg']
      }
    ),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Resolve source maps to the original source
    sourceMaps(),
    scss({
      outputStyle: 'compressed'
    }),
  ],
};

export default [
  {
    ...baseConfig,
    output: [
      {file: pkg.main, name: 'Alma', format: 'umd', sourcemap: true},
      {file: pkg.module, format: 'es', sourcemap: true},
    ],
  },
  {
    ...baseConfig,
    output: [
      {file: pkg.min, name: 'Alma', format: 'umd', sourcemap: true},
    ],
    plugins: [
      ...baseConfig.plugins,
      uglify(),
      visualizer()
    ]
  }
];
