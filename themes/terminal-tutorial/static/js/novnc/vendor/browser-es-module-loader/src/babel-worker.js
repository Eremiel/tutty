/* import { transform as babelTransform } from 'babel-core';
import babelTransformDynamicImport from 'babel-plugin-syntax-dynamic-import';
import babelTransformES2015ModulesSystemJS from 'babel-plugin-transform-es2015-modules-systemjs'; */

// sadly, due to how rollup works, we can't use es6 imports here
const babelTransform = require('babel-core').transform;
const babelTransformDynamicImport = require('babel-plugin-syntax-dynamic-import');
const babelTransformES2015ModulesSystemJS = require('babel-plugin-transform-es2015-modules-systemjs');

self.onmessage = function (evt) {
    // transform source with Babel
  const output = babelTransform(evt.data.source, {
    compact       : false,
    filename      : `${evt.data.key}!transpiled`,
    sourceFileName: evt.data.key,
    moduleIds     : false,
    sourceMaps    : 'inline',
    babelrc       : false,
    plugins       : [babelTransformDynamicImport, babelTransformES2015ModulesSystemJS],
  });

  self.postMessage({ key: evt.data.key, code: output.code, source: evt.data.source });
};
