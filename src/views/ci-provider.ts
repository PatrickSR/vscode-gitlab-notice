import { TreeDataProvider, TreeItem, EventEmitter, Event, TreeItemCollapsibleState, Uri } from 'vscode'
import { Fetch } from '../api/fetch';

enum STEP {
  PROJ = 'proj',
  PIPELINE = 'pipeline'
}

export class GitlabCIProvider implements TreeDataProvider<TreeItem> {
  _onDidChangeTreeData: EventEmitter<TreeItem> = new EventEmitter<TreeItem>()

  onDidChangeTreeData: Event<TreeItem | null | undefined> = this._onDidChangeTreeData.event
  
  fetch: Fetch

  constructor(private workspaceRoot: string| undefined) {
    this.fetch = new Fetch({
      baseURL: 'https://gitlab.myzaker.com',
      privateToken: '92rstCuMa58aMJy8jAQk'
    })

  }

  private updateTreeview(){
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: TreeItem): TreeItem {
    return element
  }

  getChildren(element: TreeItem): Thenable<TreeItem[]> {
    if(!element){
      return Promise.resolve(this.getProjectList())
    }else {
      if(element.contextValue === STEP.PROJ && element.id) {
        return Promise.resolve(this.getPipelines(element.id))
      }else if (element.contextValue && element.contextValue.match(STEP.PIPELINE) && element.id){
        const payload = element.contextValue.split('_')
        // 如果是读取pipeline 详情，contextValue的存储方式是 "pipeline_$PROJECTID"
        return Promise.resolve(this.getPipelineDetail(payload[1] ,element.id))
      } else {
        return Promise.resolve([])
      }
    }
  }

  private getProjectList () :  Thenable<TreeItem[]> {
    return new Promise(async resolve => {
      try {
        const {data} = await this.fetch.getProject()
        
        const projTreeItems:TreeItem[] = []
        data.map((proj:any) => {
          const item = new TreeItem(`${proj.name} - ${proj.description}`, TreeItemCollapsibleState.Collapsed)
          item.id = proj.id
          item.contextValue = STEP.PROJ
          if(proj.avatar_url){
            item.iconPath = Uri.parse(proj.avatar_url)
          }
          projTreeItems.push(item)
        })

        resolve(projTreeItems)
      } catch (error) {
        console.error(error)
      }
    })
  }

  /**
   * 
   * @param projectID 
   */
  private getPipelines (projectID: string | number) : Thenable<TreeItem[]> {
    return new Promise(async resolve => {
      try {
        const {data} = await this.fetch.getPipelines(projectID)

        const pipelinesItems:TreeItem[] = []

        data.map((pipeline: any)=>{
          const item = new TreeItem(`${pipeline.ref} - ${pipeline.status}`, TreeItemCollapsibleState.Collapsed)
          item.id = pipeline.id
          item.contextValue = `${STEP.PIPELINE}_${projectID}`
          pipelinesItems.push(item)
        })
        
        resolve(pipelinesItems)
      } catch (error) {
        console.error(error)
      }
    })
  }

  private getPipelineDetail (projectID: string | number, pipelineID: string | number): Thenable<TreeItem[]> {
    return new Promise(async resolve => {
      try {
        const {data} = await this.fetch.getSinglePipeline(projectID, pipelineID)
         
        const pipelineDetail:TreeItem[] = []

        const user = new TreeItem(`触发人： ${data.user.name}`)
        user.iconPath = Uri.parse(data.user.avatar_url)

        const startTime = new TreeItem(`触发时间： ${data.started_at}`)
        const endTime = new TreeItem(`结束时间： ${data.finished_at}`)
        const duration = new TreeItem(`时长： ${data.duration}秒`)
        pipelineDetail.push(user, startTime, endTime, duration)
        resolve(pipelineDetail)
      } catch (error) {
        console.error(error)
      }
    })
  }
}