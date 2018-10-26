import { TreeItem, Uri } from 'vscode';

export class CITreeItem extends TreeItem {
  constructor(
    public readonly label: string
  ) {
    super(label)
  }

  iconPath = Uri.parse('https://gitlab.myzaker.com/uploads/-/system/user/avatar/111/avatar.png')
   
}