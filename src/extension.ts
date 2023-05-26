// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ItRunner } from "./itRunner";
import { MyCodeLensProvider } from "./itCodeLensProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const itRunner = new ItRunner();

  const runFile = vscode.commands.registerCommand(
    "it-runner.runItFile",
    async () => itRunner.runCurrentFile()
  );

  const debugFile = vscode.commands.registerCommand(
    "it-runner.debugItFile",
    async () => itRunner.debugCurrentFile()
  );

  const runTest = vscode.commands.registerCommand(
    "it-runner.runIt",
    async (argument: Record<string, unknown> | string) => {
      return itRunner.runCurrentTest(argument);
    }
  );

  const debugTest = vscode.commands.registerCommand(
    "it-runner.debugIt",
    async (argument: Record<string, unknown> | string) => {
      return itRunner.debugCurrentTest(argument);
    }
  );

  // This line of code will only be executed once when your extension is activated
  console.log('"it-runner" is now active!');

  context.subscriptions.push(runFile);
  context.subscriptions.push(debugFile);
  context.subscriptions.push(runTest);
  context.subscriptions.push(debugTest);

  const docSelectors: vscode.DocumentFilter[] = [
    {
      // TODO config
      pattern: "**/*.{test,spec}.{js,jsx,ts,tsx}",
    },
  ];

  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelectors,
    new MyCodeLensProvider()
  );

  context.subscriptions.push(codeLensProviderDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
