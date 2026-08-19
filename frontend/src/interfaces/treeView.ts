export interface TreeViewItem {
    id: string;
    label: string;
    children: TreeViewItem[];
}

export interface TreeViewItemChildrenValueSingle {
    [key: string]: TreeViewItemChildrenValueSingle | TreeViewItemChildrenValueSingle[];
}
