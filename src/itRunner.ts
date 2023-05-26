import * as vscode from "vscode";

// heavily copies the jest-runner extension

interface DebugCommand {
  documentUri: vscode.Uri;
  config: vscode.DebugConfiguration;
}

export class ItRunner {
  private terminal: vscode.Terminal | null;

  // TODO figure out why it closes the editor (maybe it the save part)?

  // support for running in a native external terminal
  // force runTerminalCommand to push to a queue and run in a native external
  // terminal after all commands been pushed
  private openNativeTerminal: boolean;
  private commands: string[] = [];

  constructor() {
    this.setup();
    // TODO
    this.openNativeTerminal = false;
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

    //   this.previousCommand = command;

    const cwdPath = vscode.workspace.getWorkspaceFolder(editor.document.uri)
      ?.uri.fsPath;

    // TODO fix cwdPath retrieval
    await this.goToCwd(cwdPath ?? "");
    await this.runTerminalCommand(command);

    // TODO what is this for
    //await this.runExternalNativeTerminalCommand(this.commands);
  }

  public async debugCurrentFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    await editor.document.save();

    const filePath = editor.document.fileName;

    //   this.previousCommand = command;

    const cwdPath = vscode.workspace.getWorkspaceFolder(editor.document.uri)
      ?.uri.fsPath;

    const debugConfig = this.getDebugConfig(cwdPath ?? "", filePath, undefined);

    // TODO fix cwdPath retrieval
    await this.goToCwd(cwdPath ?? "");
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

    //   this.previousCommand = command;

    const cwdPath = vscode.workspace.getWorkspaceFolder(editor.document.uri)
      ?.uri.fsPath;

    await this.goToCwd(cwdPath ?? "");
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
    const cwdPath = vscode.workspace.getWorkspaceFolder(editor.document.uri)
      ?.uri.fsPath;
    const debugConfig = this.getDebugConfig(
      cwdPath ?? "",
      filePath,
      currentTestName
    );

    // TODO fix cwdPath retrieval
    await this.goToCwd(cwdPath ?? "");
    await this.executeDebugCommand({
      config: debugConfig,
      documentUri: editor.document.uri,
    });
  }

  private async runTerminalCommand(command: string) {
    if (this.openNativeTerminal) {
      this.commands.push(command);
      return;
    }

    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal("it");
    }

    // TODO figure out focus
    this.terminal.show(true);
    await vscode.commands.executeCommand("workbench.action.terminal.clear");
    this.terminal.sendText(command);
  }

  private buildItCommand(filePath: string, testName?: string): string {
    // TODO support options for grunt blah:file -F lah
    const args = this.buildItArgs(filePath, testName, true);

    return `./node_modules/it/bin/it ${args.join(" ")}`;
  }

  private getDebugConfig(
    cwd: string,
    filePath: string,
    currentTestName?: string
  ): vscode.DebugConfiguration {
    const config: vscode.DebugConfiguration = {
      console: "integratedTerminal",
      internalConsoleOptions: "neverOpen",
      name: "Debug IT Tests",
      // TODO config
      program: "./node_modules/it/bin/it",
      request: "launch",
      type: "node",
      // TODO config
      cwd,
    };

    const standardArgs = this.buildItArgs(filePath, currentTestName, false);
    config.args = standardArgs;

    return config;
  }

  private async executeDebugCommand(debugCommand: DebugCommand) {
    // prevent open of external terminal when debug command is executed
    this.openNativeTerminal = false;

    for (const command of this.commands) {
      await this.runTerminalCommand(command);
    }
    this.commands = [];

    vscode.debug.startDebugging(undefined, debugCommand.config);

    // this.previousCommand = debugCommand;
  }

  /**
   *
   * @param filePath
   * @param testName
   * @param quoted whether to put the test args in quotes or not, applicable between debug and run
   * @returns
   */
  private buildItArgs(
    filePath: string,
    testName?: string,
    quoted?: boolean
  ): string[] {
    const args: string[] = [];

    args.push(filePath);

    if (testName) {
      args.push("-f");
      if (quoted) {
        args.push(`"${testName}"`);
      } else {
        args.push(testName);
      }
    }

    // TODO support for reporter options

    return args;
  }

  private async goToCwd(dir: string) {
    const command = `cd ${dir}`;
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
