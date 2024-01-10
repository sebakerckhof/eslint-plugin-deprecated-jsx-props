import { ParserServices, ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';
import ts from 'typescript';

// TYPE GUARDS
const isJSXOpeningElement = (node: TSESTree.Node): node is TSESTree.JSXOpeningElement => node.type ===  'JSXOpeningElement';
const isPropertyAssignment = (node: ts.Node): node is ts.PropertyAssignment => node.kind === ts.SyntaxKind.PropertyAssignment;
const isShorthandPropertyAssignment = (node: ts.Node): node is ts.ShorthandPropertyAssignment => node.kind === ts.SyntaxKind.ShorthandPropertyAssignment;
// const isVariableDefinition = (def: TSESLint.Definition): node is VariableDef => def.isVariableDefinition
const isJsxSpreadAttribute = (node: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute): node is TSESTree.JSXSpreadAttribute =>
  node.type === 'JSXSpreadAttribute';
const isJsxAttribute = (node: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute): node is TSESTree.JSXAttribute =>
  node.type === 'JSXAttribute';
const isIdentifier = (node: TSESTree.Node): node is TSESTree.Identifier => node.type === 'Identifier';

// UTILITIES
const getSymbol = (id: TSESTree.JSXIdentifier, services: ParserServices, tc: ts.TypeChecker) => {
  let symbol: ts.Symbol | undefined;
  const tsId = services.esTreeNodeToTSNodeMap.get(id as TSESTree.Node) as ts.Identifier;
  const parent = services.esTreeNodeToTSNodeMap.get(id.parent as TSESTree.Node) as ts.Node;
  if (parent.kind === ts.SyntaxKind.BindingElement) {
    symbol = tc.getTypeAtLocation(parent.parent).getProperty(tsId.text);
  } else if (
    (isPropertyAssignment(parent) && parent.name === tsId) ||
    (isShorthandPropertyAssignment(parent) && parent.name === tsId)
  ) {
    try {
      symbol = tc.getPropertySymbolOfDestructuringAssignment(tsId);
    } catch (e) {
      // do nothing, we are in object literal, not destructuring
      // no obvious easy way to check that in advance
    }
  } else {
    symbol = tc.getSymbolAtLocation(tsId);
  }

  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    return tc.getAliasedSymbol(symbol);
  }
  return symbol;
}

const getOpeningElement = (
  nodes: Array<TSESTree.Node>,
  name: string,
) => nodes
    .filter(isJSXOpeningElement)
    .find((node) => (node.name as TSESTree.JSXIdentifier).name === name);

const getPropsType = (node: TSESTree.JSXIdentifier, services: ParserServices, tc: ts.TypeChecker) => {
  const tsId = services.esTreeNodeToTSNodeMap.get(node);
  const symbol = getSymbol(node, services, tc);
  if (!symbol) return;
  const type = tc.getTypeOfSymbolAtLocation(symbol, tsId);
  // TODO: add support for components with multiple call signatures
  const callSignatures = type.getCallSignatures();
  if (callSignatures.length === 0) return;
  const parameterSymbol = callSignatures[0].getParameters()[0];
  if (!parameterSymbol) return;
  return tc.getTypeOfSymbol(parameterSymbol);
};

// RULE DEFINITION
type TOptions = [{ checkSpreadArguments?: boolean }];

const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/sebakerckhof/eslint-plugin-deprecated-jsx-props',
);

const defaultOptions = { checkSpreadArguments: true };
const rule = createRule<TOptions, 'avoidDeprecated' | 'avoidDeprecatedSpread'>({
  name: 'deprecated-jsx-props',
  meta: {
    type: 'problem',
    docs: {
      description: 'Do not use deprecated jsx props.',
      requiresTypeChecking: true,
    },
    messages: {
      avoidDeprecated: `Prop '{{ name }}' is deprecated. {{ reason }}`,
      avoidDeprecatedSpread: `Spread object '{{ name }}' may contain deprecated prop '{{ propName }}'. {{ reason }}`,
    },
    schema: [
      {
        type: "object",
        properties: {
            checkSpreadArguments: { type: "boolean" }
        },
        additionalProperties: false
      }
    ],
  },
  defaultOptions: [defaultOptions],
  create: function (context) {
    const { checkSpreadArguments } = { ...defaultOptions, ...context.options[0] };
    const services = context.sourceCode.parserServices;
    if (!services?.program) {
      return {};
    }
  
    return {
      JSXIdentifier(node) {
     
        const tc = services.program.getTypeChecker();
        const symbol = getSymbol(node, services, tc);
        const declaration = symbol?.valueDeclaration;

        // If it's not a VariableDeclaration, stop looking
        if (declaration == null || declaration.kind !== ts.SyntaxKind.VariableDeclaration) {
          return false;
        }

        // Find the opening element which can give us the defined attributes
        const ancestors = context.sourceCode.getAncestors?.(node) ?? [];
        const openingJsxElement = getOpeningElement(
          ancestors,
          node.name,
        );
        const attributeElements =
          openingJsxElement?.attributes.filter(isJsxAttribute) ??
          [];
        
        const attributeSpreads = checkSpreadArguments ?
          openingJsxElement?.attributes.filter(isJsxSpreadAttribute) ?? []
          : [];
        
        // No attributes -> stop looking
        if (attributeElements.length === 0 && attributeSpreads?.length === 0) {
          return false;
        }

        // Find the deprecated properties of the jsx component
        const propsType = getPropsType(node, services, tc);
        if (!propsType) return false;
        const symbols = propsType.getProperties();
        const deprecatedProperties = symbols
          .map((symbol) => ({
            name: symbol.getName(),
            annotation: symbol.getJsDocTags().find((tag) => tag.name === 'deprecated'),
          }))
          .filter((property) => property.annotation !== undefined);


        // Spread attributes can't be statically analyzed, so we have to look at the type of the object being spread
        // However, for optional properties, we can't be sure that the property is actually on the object
        // So our messages should reflect this
        attributeSpreads.forEach((spread) => {
          const argument = spread.argument;
          const spreadId = services.esTreeNodeToTSNodeMap.get(argument);
          const spreadSymbol = tc.getSymbolAtLocation(spreadId);
          if (!spreadSymbol || !isIdentifier(argument)) return;
          const spreadType = tc.getTypeOfSymbol(spreadSymbol);
          const properties = spreadType.getProperties();
   
          properties.forEach((property) => {
            const deprecatedProperty = deprecatedProperties.find((p) => property.name === p.name);
            if (deprecatedProperty) {
              context.report({
                node: argument,
                messageId: 'avoidDeprecatedSpread',
                data: {
                  name: argument.name,
                  propName: deprecatedProperty.name,
                  reason: deprecatedProperty.annotation?.text?.[0]?.text ?? ''
                },
              });
            }
          });

          // We could also try to find the actual properties on the object, but that can't be determined with certainty
          // Here's an early attempt at it:
          // const variable = context.sourceCode.getScope?.().variables.find((variable) => variable.name === spread.argument.name);
          // const variableDefinition = variable?.defs.find((def) => def.isVariableDefinition);
          // const VariableDeclaration = variableDefinition?.node as VariableDeclarator;
          // const properties = VariableDeclaration.init?.properties ?? [];
        });

        attributeElements
        .forEach((attribute) => {
          const deprecatedProperty = deprecatedProperties.find((property) => property.name === attribute.name.name);
          if (deprecatedProperty) {
            context.report({
              node: attribute.name,
              messageId: 'avoidDeprecated',
              data: {
                name: deprecatedProperty.name,
                reason: ts.displayPartsToString(deprecatedProperty.annotation?.text)
              },
            });
          }
        });
      }
    };
  },
});

export default rule;
