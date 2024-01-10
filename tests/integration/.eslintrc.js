module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin-deprecated-jsx-props'],
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['off'],
    'deprecated-jsx-props/deprecated-props': ['warn', { checkSpreadArguments: true }],
  },
};
