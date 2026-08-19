import { TreeViewItem, TreeViewItemChildrenValueSingle } from "#root/interfaces/treeView";

/**
 * Constructor class for building rich tree view items from nested data structures.
 * Converts objects, arrays, and primitive values into a hierarchical tree view structure
 * with proper labeling, IDs, and type information.
 */
export class RichTreeViewItemContructor {
    EXCLUDED_KEYS: string[];
    ID_LIST: string[];

    /**
     * Creates an instance of RichTreeViewItemContructor.
     *
     * @param EXCLUDED_KEYS - Array of keys to exclude from the tree view when processing objects.
     */
    constructor(EXCLUDED_KEYS: string[]) {
        this.EXCLUDED_KEYS = EXCLUDED_KEYS;
        this.ID_LIST = [];
    }

    /**
     * Converts a data structure into an array of tree view items.
     * Starts the recursive process from the root level.
     *
     * @param fieldChanges - The data structure to convert into tree view items.
     * @returns Array of tree view items representing the hierarchical structure.
     */
    getRichTreeViewItems(
        fieldChanges: TreeViewItemChildrenValueSingle //
    ): TreeViewItem[] {
        const items = this.getRichTreeViewItemChildren(
            "root", //
            0,
            "root",
            fieldChanges
        );
        return items;
    }

    /**
     * Recursively converts a value into tree view items based on its type.
     * Handles primitives, arrays, and objects, generating appropriate labels and IDs.
     * Filters out excluded keys when processing objects.
     *
     * @param prefix - The prefix string used to generate unique IDs for children.
     * @param child_index - The index of the child in its parent, used for ID generation.
     * @param key - The key name (used for object properties).
     * @param value - The value to convert into tree view items (can be any type).
     * @returns Array of tree view items representing the value and its nested structure.
     */
    getRichTreeViewItemChildren(
        prefix: string,
        child_index: number,
        key: string,
        value: TreeViewItemChildrenValueSingle //
    ): TreeViewItem[] {
        if (!value && value !== false) return [];
        if (!Array.isArray(value) && typeof value !== "object") {
            const suffix = `${child_index}`;
            const id = `${prefix}--${suffix}`;
            this.ID_LIST.push(id);
            return [
                {
                    id, //
                    label: `${value}`,
                    children: [],
                },
            ];
        }

        if (!!Array.isArray(value)) {
            return (
                value?.map((v, arr_idx) => {
                    const suffix = `${child_index}-arr-${arr_idx}`;
                    const id = `${prefix}--${suffix}`;
                    this.ID_LIST.push(id);
                    return {
                        id,
                        label: `${arr_idx} (${this.getType(v)})`,
                        children: this.getRichTreeViewItemChildren(
                            id, //
                            child_index + 1,
                            key,
                            v
                        ),
                    };
                }) || []
            );
        }
        return (
            Object.entries(value)
                ?.filter(([k, _v]) => {
                    return !this.EXCLUDED_KEYS?.includes(k);
                })
                ?.map(([k, v], dict_idx) => {
                    const suffix = `${child_index}-dict-${dict_idx}`;
                    const id = `${prefix}--${suffix}`;
                    this.ID_LIST.push(id);
                    return {
                        id, //
                        label: `${k} (${this.getType(v)})`,
                        children: this.getRichTreeViewItemChildren(
                            id, //
                            child_index + 1,
                            k,
                            v as TreeViewItemChildrenValueSingle
                        ),
                    };
                }) || []
        );
    }

    /**
     * Determines the type string representation of a value.
     * Returns special strings for arrays, null, and dates, otherwise returns the typeof value.
     *
     * @param value - The value to determine the type of.
     * @returns String representing the type: "array", "null", "date", or the typeof value.
     */
    getType(value: unknown): string {
        if (Array.isArray(value)) {
            return "array";
        }
        if (value === null) {
            return "null";
        }
        if (value instanceof Date) {
            return "date";
        }
        return typeof value;
    }
}
