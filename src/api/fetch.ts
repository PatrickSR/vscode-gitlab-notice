import Axios, { AxiosInstance } from 'axios'

export class Fetch {

  private axios: AxiosInstance

  constructor (config: {
    baseURL: string,
    privateToken: string
  }) {
    this.axios = Axios.create({
      baseURL: config.baseURL,
      headers: {
        'Private-token': config.privateToken
      }
    })
  }

  /**
   * 获取用户项目
   */
  public getProject () {
    return this.axios.get('/api/v4/projects')
  }

  /**
   * 获取全部pipeline
   * @param projectID 
   */
  public getPipelines (projectID: string | number) {
    return this.axios.get(`/api/v4/projects/${projectID}/pipelines`)
  }

  /**
   * 获取单个pipeline的状态
   * @param params 
   */
  public getSinglePipeline (projectID: string | number, pipelineID: string| number) {
    return this.axios.get(`/api/v4/projects/${projectID}/pipelines/${pipelineID}`)
  }

  /**
   * 重新启动选中pipeline的任务
   * @param projectID 项目id
   * @param pipelineID pipeline id
   */
  public retryPipelineJob (projectID: string | number, pipelineID: string | number) {
    return this.axios.post(`/api/v4/projects/${projectID}/pipelines/${pipelineID}/retry`)
  }

  /**
   * 取消选中pipeline的任务
   * @param projectID 
   * @param pipelineID 
   */
  public cancelPipelineJob (projectID: string | number, pipelineID: string | number) {
    return this.axios.post(`/api/v4/projects/${projectID}/pipelines/${pipelineID}/cancel`)
  }
} 