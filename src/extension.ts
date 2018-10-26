// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {ExtensionContext, commands, window, workspace} from 'vscode'
import {GitlabCIProvider} from './gitlab/ci-provider'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Hello World!');
    });

    const ciProvider = new GitlabCIProvider(workspace.rootPath)

    window.registerTreeDataProvider('gitlabCI', ciProvider)
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}