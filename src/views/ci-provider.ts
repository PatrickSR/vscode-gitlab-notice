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

  /**
   * 刷新CI/CD最新状态
   */
  public refresh() {
    this._onDidChangeTreeData.fire()
  }
  
  /**
   * 重新启动pipeline任务
   * @param projectID 项目id
   * @param pipelineID pipeline id
   */
  public retry(projectID: string | number, pipelineID: string | number) {
    return new Promise(async (resolve, reject) => {
      try {
        const retryResp = await this.retryPipelineJob(projectID, pipelineID)
        resolve(retryResp)
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * 取消pipeline任务
   * @param projectID 项目id
   * @param pipelineID pipeline id
   */
  public cancel(projectID: string | number, pipelineID: string | number) {
    return new Promise(async (resolve, reject) => {
      try {
        const retryResp = await this.cancelPipelineJob(projectID, pipelineID)
        resolve(retryResp)
      } catch (error) {
        reject(error)
      }
    })
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
        const weburl = new TreeItem(`Web_url：${data.web_url || ''}`)
        pipelineDetail.push(user, startTime, endTime, duration, weburl)
        resolve(pipelineDetail)
      } catch (error) {
        console.error(error)
      }
    })
  }

  /**
   * @param projectID
   * @param pipelineID
   */
  private retryPipelineJob (projectID: string | number, pipelineID: string | number) {
    return this.fetch.retryPipelineJob(projectID, pipelineID)
  }

  /**
   * @param projectID
   * @param pipelineID
   */
  private cancelPipelineJob (projectID: string | number, pipelineID: string | number) {
    return this.fetch.cancelPipelineJob(projectID, pipelineID)
  }
}