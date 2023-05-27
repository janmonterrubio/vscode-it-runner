import * as acorn from "acorn";
import { SourceLocation } from "acorn";
import * as acornWalker from "acorn-walk";

enum TestType {
  DESCRIBE,
  SHOULD,
}

export type TestNode = {
  /**
   * The literal string associated with this test
   */
  testLiteral: string;
  /**
   * The type of test
   */
  testType: TestType;

  location: SourceLocation | undefined;

  children: TestNode[];

  parts: string[];
};

export type TestCollector = {
  children: TestNode[];

  parts: string[];
};

export function parse(contents: string) {
  return acorn.parse(contents, {
    ecmaVersion: 2020,
    sourceType: "script",
    locations: true,
  });
}

export function walkTree(parseTree: acorn.Node) {
  // TODO use the variable expressions to find
  // const it = require('it') and filter the callee target to avoid flagging non-it tests.

  var testCollector = {
    children: [],
    parts: [],
  } as TestCollector;

  acornWalker.recursive(parseTree, testCollector, {
    ExpressionStatement(node, state, c) {
      // structure is
      // it.describe(LITERAL, functionExpression);

      const expressionStatement: any = node;
      const expression = expressionStatement.expression;

      if (expression.type === "CallExpression") {
        const callee = expression.callee;
        const called = callee.property.name;

        if (called === "describe") {
          const describeLiteral = expression.arguments[0];
          const describeValue = describeLiteral.value;

          const testNode: TestNode = {
            testLiteral: describeValue,
            testType: TestType.DESCRIBE,
            location: node.loc,
            children: [],
            parts: [...state.parts, describeValue],
          };
          state.children.push(testNode);

          c(expression.arguments[1], testNode);
        }

        if (called === "should") {
          const shouldLiteral = expression.arguments[0];
          const shouldValue = shouldLiteral.value;
          const shouldPart = "should " + shouldValue;

          const testNode: TestNode = {
            testLiteral: shouldValue,
            testType: TestType.SHOULD,
            location: node.loc,
            children: [],
            parts: [...state.parts, shouldPart],
          };
          state.children.push(testNode);
        }
      }
    },
  });

  return testCollector;
}
