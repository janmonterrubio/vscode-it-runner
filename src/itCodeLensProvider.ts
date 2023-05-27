import {
  CodeLens,
  CodeLensProvider,
  Command,
  Range,
  TextDocument,
} from "vscode";
import { TestCollector, TestNode, parse, walkTree } from "./itTestParser";

export type CodeLensOption = "run" | "debug";

export class ItRunnerCodeLensProvider implements CodeLensProvider {
  async provideCodeLenses(document: TextDocument): Promise<CodeLens[]> {
    let topOfDocument = new Range(0, 0, 0, 0);

    const foundTests = walkTree(parse(document.getText()));

    // no tests
    if (foundTests.children.length < 1) {
      return [];
    }

    let runFileCommand: Command = {
      command: "it-runner.runItFile",
      title: "Run IT",
    };
    let runFileCommandLens = new CodeLens(topOfDocument, runFileCommand);

    let debugFileCommand: Command = {
      command: "it-runner.debugItFile",
      title: "Debug IT",
    };
    let debugFileCommandLens = new CodeLens(topOfDocument, debugFileCommand);

    const testCommands = this.getTestCommands(foundTests);
    return [runFileCommandLens, debugFileCommandLens, ...testCommands];
  }

  private getTestCommands(collector: TestCollector) {
    const testCommands = [];

    const nodeQueue: TestNode[] = [];

    collector.children.forEach((t) => nodeQueue.push(t));

    while (nodeQueue.length > 0) {
      const testNode = nodeQueue.pop();

      if (testNode && testNode.location) {
        const testRange = new Range(
          testNode.location.start.line - 1,
          testNode.location.start.column,
          testNode.location.end.line - 1,
          testNode.location.end.column
        );

        const testName = testNode.parts.join(":");

        const testCommand: Command = {
          command: "it-runner.runIt",
          title: "Run it",
          arguments: [testName],
        };
        testCommands.push(new CodeLens(testRange, testCommand));

        const debugCommand: Command = {
          command: "it-runner.debugIt",
          title: "Debug it",
          arguments: [testName],
        };
        testCommands.push(new CodeLens(testRange, debugCommand));

        testNode.children.forEach((c) => nodeQueue.push(c));
      }
    }

    return testCommands;
  }
}
