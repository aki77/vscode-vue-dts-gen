import vscode from 'vscode';
import type { TextDocument } from 'vscode';
import path from 'path';
import execa from 'execa';
import stripAnsi = require('strip-ansi');

const TYPE_REGEX = /<script( lang="[jt]s")?>\n[\s//*]*@type/;
const SUCCESS_REGEX = /^Emitted/m;

const processes: WeakMap<TextDocument, execa.ExecaChildProcess> = new WeakMap();

const generate = async (document: TextDocument) => {
  const oldProcess = processes.get(document);
  if (oldProcess) {
    oldProcess.kill();
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (!workspaceFolder) {
    return;
  }

  const command = path.resolve(workspaceFolder.uri.fsPath, 'node_modules/.bin/vue-dts-gen');
  const args = vscode.workspace.asRelativePath(document.uri);
  const process = execa(command, [args], {
    cwd: workspaceFolder.uri.fsPath,
    reject: false,
  });

  processes.set(document, process);
  const { stderr, stdout } = await process;
  processes.delete(document);

  if (!SUCCESS_REGEX.test(stdout)) {
    vscode.window.showErrorMessage(stripAnsi(stderr + stdout));
  }
};

const processDocument = async (document: TextDocument, force = false): Promise<void> => {
  if (!document.fileName.endsWith('.vue')) {
    return;
  }

  const content = document.getText();

  if (!TYPE_REGEX.test(content)) {
    if (force) {
      vscode.window.showInformationMessage('vue-dts-gen require `// @type` or `/* @type */` ahead of script block');
    }

    return;
  }

  generate(document);
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      processDocument(document);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('vueDtsGen.generate', async (editor) => {
      await processDocument(editor.document);
      vscode.window.showInformationMessage('generated dts');
    })
  );
}

export function deactivate() {}
