import { TreeDataProvider, TreeItem } from 'vscode'
import { CITreeItem } from './ci-tree-item'

export class GitlabCIProvider implements TreeDataProvider<CITreeItem> {
  constructor(private workspaceRoot: string| undefined) {
    console.log(this.workspaceRoot)
  }
  
  getTreeItem(element: CITreeItem): TreeItem {
    return element
  }

  getChildren(element: CITreeItem): Thenable<CITreeItem[]> {
    const menus = [new CITreeItem('abcd'), new CITreeItem('ebcd')]
    
    return Promise.resolve(menus)
  }
}