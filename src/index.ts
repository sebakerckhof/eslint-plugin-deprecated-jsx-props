import { TSESLint } from '@typescript-eslint/utils';
import { deprecatedProps } from './rules';

export const rules: Record<string, TSESLint.RuleModule<any, any>> = {
  'deprecated-props': deprecatedProps,
};
