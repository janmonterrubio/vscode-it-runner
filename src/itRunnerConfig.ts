import * as vscode from "vscode";

export class ItRunnerConfig {
  /**
   * Returns the current working directory
   */
  public get cwd(): string {
    return this.currentWorkspaceFolderPath;
  }

  public get env(): { [key: string]: string } | undefined {
    return vscode.workspace.getConfiguration().get("itrunner.testEnv");
  }

  public get currentWorkspaceFolderPath(): string {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      return (
        vscode.workspace.getWorkspaceFolder(editor.document.uri)?.uri.fsPath ??
        ""
      );
    }

    return "";
  }
}
