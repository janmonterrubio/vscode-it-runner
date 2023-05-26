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
  // need a tree:
  // TestNode { name, loc, children: TestNode }

  // need to capture:
  // document position
  var testCollector = {
    children: [],
    parts: [],
  } as TestCollector;

  acornWalker.recursive(parseTree, testCollector, {
    ExpressionStatement(node, state, c) {
      // it.describe(LITERAL, functionExpression);

      console.log(
        "Recursed on ",
        node.type + "(" + node.start + "," + node.end + ")"
      );

      const expressionStatement: any = node;
      const expression = expressionStatement.expression;

      if (expression.type === "CallExpression") {
        const callee = expression.callee;
        const called = callee.property.name;

        if (called === "describe") {
          const describeLiteral = expression.arguments[0];
          const describeText = describeLiteral.raw;
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

// const vscode = require("vscode");
// const TestTypes = require("./testTypes");

// var collector = { steps: [], test: parentTest, parts: [] };

// // { children = [] }

// // from here return the graph => caller builds things
// walk.recursive(parseTree, collector, {
//   ExpressionStatement(node, state, c) {
//     // recurse on statements of type

//     // it.describe(LITERAL, functionExpression);

//     console.log(
//       "Recursed on ",
//       node.type + "(" + node.start + "," + node.end + ")"
//     );

//     const expression = node.expression;

//     if (expression.type === "CallExpression") {
//       const callee = expression.callee;
//       const called = callee.property.name;

//       if (called === "describe") {
//         const describeLiteral = expression.arguments[0];
//         const describeText = describeLiteral.raw;
//         const describeValue = describeLiteral.value;
//         const chainNode = {
//           describe: describeText,
//           location: node.loc,
//           parts: [...state.parts, describeValue],
//           chain: { steps: [], parts: [...state.parts, describeValue] },
//         };
//         state.steps.push(chainNode);
//         const describeTest = controller.createTestItem(
//           fileUri.toString() + "(" + node.start + "," + node.end + ")",
//           describeLiteral.value,
//           fileUri
//         );
//         describeTest.range = new vscode.Range(
//           new vscode.Position(node.loc.start.line - 1, node.loc.start.column),
//           new vscode.Position(node.loc.end.line - 1, node.loc.end.column)
//         );
//         state.test.children.add(describeTest);
//         chainNode.chain.test = describeTest;

//         testData.set(describeTest, {
//           type: TestTypes.DESCRIBE,
//           label: chainNode.parts.join(":"),
//           parts: chainNode.parts
//         });

//         c(expression.arguments[1], chainNode.chain);
//       }

//       if (called === "should") {
//         const shouldLiteral = expression.arguments[0];
//         const shouldText = shouldLiteral.raw;
//         const shouldValue = shouldLiteral.value;
//         const shouldPart = "should " + shouldValue;
//         const chainNode = {
//           should: shouldText,
//           location: node.loc,
//           parts: [...state.parts, shouldPart],
//         };
//         state.steps.push(chainNode);

//         const shouldTest = controller.createTestItem(
//           fileUri.toString() + "(" + node.start + "," + node.end + ")",
//           shouldPart,
//           fileUri
//         );
//         shouldTest.range = new vscode.Range(
//           new vscode.Position(node.loc.start.line - 1, node.loc.start.column),
//           new vscode.Position(node.loc.end.line - 1, node.loc.end.column)
//         );

//         testData.set(shouldTest, {
//           type: TestTypes.SHOULD,
//           label: chainNode.parts.join(":"),
//           parts: chainNode.parts
//         });

//         state.test.children.add(shouldTest);
//       }
//     }
//   },
// });

// console.log(JSON.stringify(collector, null, "  "));
// return collector;
