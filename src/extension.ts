import * as vscode from "vscode";
import { ItRunner } from "./itRunner";
import { ItRunnerCodeLensProvider } from "./itCodeLensProvider";
import { ItRunnerConfig } from "./itRunnerConfig";

export function activate(context: vscode.ExtensionContext) {
  const itConfig = new ItRunnerConfig();
  const itRunner = new ItRunner(itConfig);

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

  console.log('"it-runner" is now active!');

  context.subscriptions.push(runFile);
  context.subscriptions.push(debugFile);
  context.subscriptions.push(runTest);
  context.subscriptions.push(debugTest);

  const docSelectors: vscode.DocumentFilter[] = [
    {
      // TODO config
      pattern: "**/*.{test,spec}.{js,ts}",
    },
  ];

  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    docSelectors,
    new ItRunnerCodeLensProvider()
  );

  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}
