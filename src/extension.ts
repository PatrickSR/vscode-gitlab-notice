// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {ExtensionContext, commands, window, workspace, TreeItem} from 'vscode'
import {GitlabCIProvider} from './views/ci-provider'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = commands.registerCommand('extension.sayHello', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     window.showInformationMessage('Hello World!');
    // });


    if(checkConfReady()){
      const ciProvider = new GitlabCIProvider(workspace.rootPath)
      window.registerTreeDataProvider('gitlabCI', ciProvider)
      commands.registerCommand('gitlabCI.selectPipeline', (item:TreeItem)=>{
        console.log(item.label)
      })

    }else {
      window.showInformationMessage('请配置gitlab地址【gitlabNotice.gitlabUrl】');
    }

    // context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

/**
 * 检查是否提供gitlab notice需要的配置
 * TODO 考虑从项目根目录读取某个配置文件进行实现
 */
function checkConfReady (): boolean {
  return !!workspace.getConfiguration('gitlabNotice').get('gitlabUrl')
}