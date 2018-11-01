// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {ExtensionContext, commands, window, workspace, TreeItem} from 'vscode'
import {GitlabCIProvider} from './views/ci-provider'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    if(checkConfReady()){
      const ciProvider = new GitlabCIProvider(workspace.rootPath)
      window.registerTreeDataProvider('gitlabCI', ciProvider)
      commands.registerCommand('gitlabCI.selectPipeline', (item:TreeItem)=>{
        console.log(item.label)
      })
      commands.registerCommand('gitlabNotice.ci.refresh', ()=> {
        ciProvider.refresh()
      })
      commands.registerCommand('gitlabNotice.ci.retry', async (pipeline) => {
        try {
          /**
           * 获取项目id 
           * pipeline.contextValue 结构可查看ci-provider.ts
           */
          const projectID = pipeline.contextValue.split('_')[1]
          await ciProvider.retry(projectID, pipeline.id)
          
          window.showInformationMessage(`流水线 #${pipeline.id} 进行中...`)
        } catch (error) {
          console.error(error)
        }
      })
      commands.registerCommand('gitlabNotice.ci.cancel', async (pipeline) => {
        try {
          /**
           * 获取项目id 
           * pipeline.contextValue 结构可查看ci-provider.ts
           */
          const projectID = pipeline.contextValue.split('_')[1]
          await ciProvider.cancel(projectID, pipeline.id)

          window.showInformationMessage(`流水线 #${pipeline.id} 停止中...`)
        } catch (error) {
          console.error(error)
        }
      })

      setInterval(()=>{
        ciProvider.refresh()
      }, 5000)

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