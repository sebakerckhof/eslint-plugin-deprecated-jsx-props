import path from 'path';

import { ESLint } from 'eslint';

const engineConfig: ESLint.Options = {
  useEslintrc: false,
  overrideConfigFile: path.resolve(__dirname, '../.eslintrc.js'),
};

const cli = new ESLint(engineConfig);

const stringPatternArgument = /Prop '\w+' is deprecated\. .*?$/;
const stringPatternSpreadArgument = /Spread object '\w+' may contain deprecated prop '\w+'/;

describe('avoidDeprecated', () => {
  describe('when the component type is in the same file', () => {
    let res: ESLint.LintResult[];
  
    beforeEach(async () => {
      const file = path.resolve(__dirname, '../local-type.tsx');
      debugger;
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(2);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(stringPatternArgument);

      const text2 = messages[1].message;
      expect(text2).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warnings', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(`Prop 'someProp' is deprecated. reason`);

      const text2 = messages[1].message;
      expect(text2).toMatch(`Prop 'someProp2' is deprecated. reason2`);
    });

    it('the warnings are at the right position', () => {
      const { messages } = res[0]!;

      expect(messages[0].line).toEqual(27);
      expect(messages[0].column).toEqual(18);
      expect(messages[0].endColumn).toEqual(26);

      expect(messages[1].line).toEqual(27);
      expect(messages[1].column).toEqual(30);
      expect(messages[1].endColumn).toEqual(39);
    });
  });

  describe('when the component interface is in the same file', () => {
    let res: ESLint.LintResult[];
  
    beforeEach(async () => {
      const file = path.resolve(__dirname, '../local-interface.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(2);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(stringPatternArgument);

      const text2 = messages[1].message;
      expect(text2).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warnings', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(`Prop 'someProp' is deprecated. reason`);

      const text2 = messages[1].message;
      expect(text2).toMatch(`Prop 'someProp2' is deprecated. reason2`);
    });

    it('the warnings are at the right position', () => {
      const { messages } = res[0]!;

      expect(messages[0].line).toEqual(27);
      expect(messages[0].column).toEqual(18);
      expect(messages[0].endColumn).toEqual(26);

      expect(messages[1].line).toEqual(27);
      expect(messages[1].column).toEqual(30);
      expect(messages[1].endColumn).toEqual(39);
    });
  });

  describe('when the component interface is from an external library', () => {
    let res: ESLint.LintResult[];

    beforeEach(async () => {
      const file = path.resolve(__dirname, '../external-interface.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;
      expect(warningCount).toEqual(2);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;
      const text = messages[0].message;

      expect(text).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warning', () => {
      const { messages } = res[0]!;
      const text = messages[0].message;

      expect(text).toMatch(`Prop 'someProp' is deprecated. `);
    });

    it('the warning is at the right position', () => {
      const { messages } = res[0]!;
      const { column, line, endColumn } = messages[0];

      expect(line).toEqual(7);
      expect(column).toEqual(31);
      expect(endColumn).toEqual(39);
    });
  });

  describe('when the component type is from an external library', () => {
    let res: ESLint.LintResult[];

    beforeEach(async () => {
      const file = path.resolve(__dirname, '../external-type.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(2);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;
      const text = messages[0].message;

      expect(text).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warning', () => {
      const { messages } = res[0]!;
      const text = messages[0].message;

      expect(text).toMatch(`Prop 'someProp' is deprecated. `);
    });

    it('the warning is at the right position', () => {
      const { messages } = res[0]!;
      const { column, line, endColumn } = messages[0];

      expect(line).toEqual(7);
      expect(column).toEqual(26);
      expect(endColumn).toEqual(34);
    });
  });

  describe('when the component interface extends from another interface', () => {
    let res: ESLint.LintResult[];

    beforeEach(async () => {
      const file = path.resolve(__dirname, '../local-interface-extends.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(1);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warning', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(`Prop 'deprecatedProp' is deprecated. `);
    });
  });

  describe('when the component props type is imported', () => {
    let res: ESLint.LintResult[];
  
    beforeEach(async () => {
      const file = path.resolve(__dirname, '../imported-type.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(2);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(stringPatternArgument);

      const text2 = messages[1].message;
      expect(text2).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warnings', () => {
      const { messages } = res[0]!;

      const text1 = messages[0].message;
      expect(text1).toMatch(`Prop 'someProp' is deprecated. reason`);

      const text2 = messages[1].message;
      expect(text2).toMatch(`Prop 'someProp2' is deprecated. reason2`);
    });

    it('the warnings are at the right position', () => {
      const { messages } = res[0]!;

      expect(messages[0].line).toEqual(17);
      expect(messages[0].column).toEqual(18);
      expect(messages[0].endColumn).toEqual(26);

      expect(messages[1].line).toEqual(17);
      expect(messages[1].column).toEqual(30);
      expect(messages[1].endColumn).toEqual(39);
    });
  });

  describe('when the component type extends from another type', () => {
    let res: ESLint.LintResult[];

    beforeEach(async () => {
      const file = path.resolve(__dirname, '../local-type-extends.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(1);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(stringPatternArgument);
    });

    it('generates exactly the right warning', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(`Prop 'deprecatedProp' is deprecated. `);
    });
  });

  describe('when the component props are spread', () => {
    let res: ESLint.LintResult[];

    beforeEach(async () => {
      const file = path.resolve(__dirname, '../local-type-spread.tsx');
      res = await cli.lintFiles([file]);
    });

    it('generates the right amount of warnings and errors', () => {
      const { warningCount, errorCount } = res[0]!;

      expect(warningCount).toEqual(9);
      expect(errorCount).toEqual(0);
    });

    it('matches the message pattern', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(stringPatternSpreadArgument);
    });

    it('generates exactly the right warning', () => {
      const { messages } = res[0]!;

      const text = messages[0].message;
      expect(text).toMatch(`Spread object 'props2' may contain deprecated prop 'someProp'. reason
More elaborate description...`);
    });
  });
});
