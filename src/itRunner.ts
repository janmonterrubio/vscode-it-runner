import * as vscode from "vscode";
import * as path from "path";

import { ItRunnerConfig } from "./itRunnerConfig";

// heavily copies the vscode-jest-runner extension

interface DebugCommand {
  documentUri: vscode.Uri;
  config: vscode.DebugConfiguration;
}

export class ItRunner {
  private terminal: vscode.Terminal | null;

  constructor(private readonly config: ItRunnerConfig) {
    this.setup();
    this.terminal = null;
  }

  public async runCurrentFile(options?: string[]): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();

    const filePath = editor.document.fileName;
    const command = this.buildItCommand(filePath, undefined);

    await this.goToCwd();
    await this.setEnv();
    await this.runTerminalCommand(command);
  }

  public async debugCurrentFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();

    const filePath = editor.document.fileName;
    const debugConfig = this.getDebugConfig(filePath, undefined);

    await this.goToCwd();
    await this.executeDebugCommand({
      config: debugConfig,
      documentUri: editor.document.uri,
    });
  }

  public async runCurrentTest(
    argument?: Record<string, unknown> | string,
    options?: string[]
  ): Promise<void> {
    const currentTestName = typeof argument === "string" ? argument : undefined;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();

    const filePath = editor.document.fileName;

    const testName = currentTestName;
    const command = this.buildItCommand(filePath, testName);

    await this.goToCwd();
    await this.setEnv();
    await this.runTerminalCommand(command);
  }

  public async debugCurrentTest(
    argument?: Record<string, unknown> | string,
    options?: string[]
  ): Promise<void> {
    const currentTestName = typeof argument === "string" ? argument : undefined;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();

    const filePath = editor.document.fileName;
    const debugConfig = this.getDebugConfig(filePath, currentTestName);

    await this.goToCwd();
    await this.executeDebugCommand({
      config: debugConfig,
      documentUri: editor.document.uri,
    });
  }

  private async setEnv() {
    // things like NODE_ENV need to be overridden this way
    if (this.config.env) {
      for (const [key, value] of Object.entries(this.config.env)) {
        await this.runTerminalCommand(`export ${key}=${value}`);
      }
    }
  }

  private async runTerminalCommand(command: string) {
    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal({
        name: "Run it",
      });
    }

    this.terminal.show(true);
    await vscode.commands.executeCommand("workbench.action.terminal.clear");
    this.terminal.sendText(command);
  }

  private buildItCommand(filePath: string, testName?: string): string {
    const args = this.buildItArgs(filePath, testName, true);

    const itCommand = "./node_modules/it/bin/it";

    return `${itCommand} ${args.join(" ")}`;
  }

  private getDebugConfig(
    filePath: string,
    currentTestName?: string
  ): vscode.DebugConfiguration {
    const config: vscode.DebugConfiguration = {
      console: "integratedTerminal",
      internalConsoleOptions: "neverOpen",
      name: "Debug it",
      program: "./node_modules/it/bin/it",
      request: "launch",
      type: "node",
      cwd: this.config.cwd,
      env: this.config.env ?? {},
    };

    const standardArgs = this.buildItArgs(filePath, currentTestName, false);
    config.args = standardArgs;

    return config;
  }

  private async executeDebugCommand(debugCommand: DebugCommand) {
    vscode.debug.startDebugging(undefined, debugCommand.config);
  }

  /**
   * Builds the array of arguments to pass to the it process
   * @param filePath the full path for the file
   * @param testName the name of the test to run (or null to run all)
   * @param quoted whether to put the test args in quotes or not, applicable between debug and run
   * @returns an array of arguments to pass to a terminal command
   */
  private buildItArgs(
    filePath: string,
    testName?: string,
    quoted?: boolean
  ): string[] {
    const args: string[] = [];

    const relativeFilePath = path.relative(this.config.cwd, filePath);
    args.push(relativeFilePath);

    if (testName) {
      args.push("-f");
      // TODO revisit if we can always quote things
      if (quoted) {
        args.push(`"${testName}"`);
      } else {
        args.push(testName);
      }
    }

    // TODO support for reporter options

    return args;
  }

  private async goToCwd() {
    const cwd = this.config.cwd;
    const command = `cd ${cwd}`;
    await this.runTerminalCommand(command);
  }

  private setup() {
    vscode.window.onDidCloseTerminal((closedTerminal: vscode.Terminal) => {
      if (this.terminal === closedTerminal) {
        this.terminal = null;
      }
    });
  }
}
