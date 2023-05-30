import * as acorn from "acorn";
import { SourceLocation } from "acorn";
import * as acornWalker from "acorn-walk";

export enum TestType {
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

  /**
   * name given to the it library in the source file associated to this test
   */
  itLibraryName: string | undefined;
};

export type TestCollector = {
  children: TestNode[];

  parts: string[];

  itLibraryName: string | undefined;
};

export function findTests(contents: string) {
  return walkTree(parse(contents));
}

function parse(contents: string) {
  return acorn.parse(contents, {
    ecmaVersion: 2020,
    sourceType: "script",
    locations: true,
  });
}

function walkTree(parseTree: acorn.Node) {
  // TODO use the variable expressions to find
  // const it = require('it') and filter the callee target to avoid flagging non-it tests.

  // VariableDeclaration
  const itFinder = { libraryName: undefined };
  acornWalker.simple(
    parseTree,
    {
      VariableDeclarator(node, state) {
        // handle const it = require('it')
        // id.name => itLibName
        const variableDeclarator: any = node;
        const initializer = variableDeclarator.init;

        // var declaration without init, skip
        if (!initializer) {
          return;
        }

        if (initializer.type === "CallExpression") {
          const callee = initializer.callee;
          const called = callee.name;

          if (called === "require") {
            const libLiteral = initializer.arguments[0];
            const libName = libLiteral.value;

            if (libName === "it") {
              state.libraryName = variableDeclarator.id.name;
            }
          }
        }
      },
    },
    undefined,
    itFinder
  );

  var testCollector = {
    children: [],
    parts: [],
    itLibraryName: itFinder.libraryName,
  } as TestCollector;

  const itLibraryName = itFinder.libraryName;

  acornWalker.recursive(parseTree, testCollector, {
    ExpressionStatement(node, state, c) {
      // structure is
      // it.describe(LITERAL, functionExpression);

      const expressionStatement: any = node;
      const expression = expressionStatement.expression;

      // todo update this to early returns cause theres 2 much nesting now

      if (expression.type === "CallExpression") {
        const callee = expression.callee;

        if (callee.property) {
          const called = callee.property.name;

          // it.describe
          const targetObjName = callee.object.name;
          // is it the it library
          if (targetObjName === state.itLibraryName) {
            if (called === "describe") {
              const describeLiteral = expression.arguments[0];
              const describeValue = describeLiteral.value;

              const testNode: TestNode = {
                testLiteral: describeValue,
                testType: TestType.DESCRIBE,
                location: node.loc,
                children: [],
                parts: [...state.parts, describeValue],
                itLibraryName: state.itLibraryName,
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
                itLibraryName: state.itLibraryName,
              };
              state.children.push(testNode);
            }
          }
        }
      }
    },
  });

  return testCollector;
}
