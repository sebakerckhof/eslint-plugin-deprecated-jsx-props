# eslint-plugin-deprecated-jsx-props

Plugin to report usage of deprecated properties in React components props.

### Example
```tsx
interface ComponentProps {
  /**
   * Some prop that is going to be removed in the future
   * @deprecated Use someOtherProp instead
   */
  someProp?: string;

  someOtherProp: string;
}

/**
 * Note that the @deprecated prop is used in the implementation
 * since it should still work. This does not throw a warning per se.
 */
const Component = ({ someProp, someOtherProp }: ComponentProps) => {
  const usedValue = someOtherProp != null ? someOtherProp : someProp;
  return <div>{someProp}</div>;
};

export const Test = () => {
  return (
    <React.Fragment>
      {/* Eslint will complain */}
      <Component someProp="" someOtherProp="" /> 
      {/* Eslint will NOT complain */}
      <Component someOtherProp="" />
    </React.Fragment>
  );
};
```

## Installation
Make sure the project already has eslint installed. Note that this plugin works with `@typescript-eslint/parser`, so you need to have that installed as well.
```bash
$ npm install eslint-plugin-deprecated-props --save-dev
```

## Configuration
First, make sure the peer dependencies required are the same version (or lower) than the versions you have currently installed, otherwise the parser features won't work.
To configure this plugin to work properly, you need to set the following fields in your `.eslintrc.js`
```js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['deprecated-props'],
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json', // Path should point to tsconfig.json file, without leading `./` 
  },
  rules: {
    'deprecated-props/deprecated-props': ['warn'],  // Or 'error'
  },
};
```
Note that this is simply the most minimal config for the plugin to work, you would normally already have other settings and rules in place for your project, but this is the bare minimum.

By default the rule will also check the type of spread arguments. However, we can't statically determine the actual properties in the spread object. Therefore the spread arguments may trigger too much warnings. You can disable spread argument checks alltogether using the following config:
```js
 'deprecated-props/deprecated-props': ['warn', { checkSpreadArguments: false }],
```

## Testing
To run the integration tests simply run
```bash
$ npm run test
```

## Attribution

Inspired by https://github.com/Drawbotics/eslint-plugin-deprecated-props
