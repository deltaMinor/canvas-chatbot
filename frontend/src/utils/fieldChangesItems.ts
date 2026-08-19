import { AuditLog } from "#root/interfaces";
import { TreeViewItemChildrenValueSingle } from "#root/interfaces/treeView";
import { RichTreeViewItemContructor } from "#root/lib/RichTreeViewItemContructor";

export const getFieldChanges = (auditLog: AuditLog | null): TreeViewItemChildrenValueSingle => {
    const changes = auditLog?.fieldChanges || {};
    // Exclude identifiers as they are displayed in the metadata section
    const restChanges = { ...changes };
    if ("identifiers" in restChanges) {
        delete restChanges["identifiers"];
    }
    return restChanges as TreeViewItemChildrenValueSingle;
};

export const getFieldChangesItems = ({
    auditLog,
    excludedKeys,
}: {
    auditLog: AuditLog | null;
    excludedKeys: string[];
}) => {
    const treeViewItemConstructor = new RichTreeViewItemContructor(excludedKeys);
    return treeViewItemConstructor.getRichTreeViewItems(getFieldChanges(auditLog));
};
