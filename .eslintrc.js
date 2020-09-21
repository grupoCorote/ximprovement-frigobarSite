module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
    'standard',
    'plugin:promise/recommended'
  ],
  // required to lint *.vue files
  plugins: [
    'html',
    'import',
    'promise'
  ],
  globals: {
    'cordova': true,
    'DEV': true,
    'PROD': true,
    '__THEME': true
  },
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 1,
    'one-var': 1,
    'import/first': 1,
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
    'brace-style': [2, 'stroustrup', { 'allowSingleLine': true }],
    'object-property-newline': 'warn',
    'space-before-function-paren': 'warn',
    'indent': 'warn',
    'no-multiple-empty-lines': 'warn',
    'camelcase': 'off',
    'no-unused-vars': 'warn',
    "promise/no-nesting": "off"
  }
}
