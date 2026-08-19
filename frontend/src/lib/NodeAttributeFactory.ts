import {
    defaultPhysicalLocationOptions,
    default_node_cacti_attributes,
    default_node_data_advanced_attributes,
    default_node_data_attributes,
    default_node_main_attributes,
    default_node_style_attributes,
} from "#root/constants/diagramAttributes";
import { CanvasNodeType, CanvasNodeVariantType } from "#root/enums/diagram";
import { SelectableValue } from "#root/interfaces";
import { DiagramNode, ProjectDiagram } from "#root/interfaces/diagram";
import { BaseFieldAttribute } from "#root/interfaces/diagramAttributes";
import { getDataStoredOptions } from "#root/utils/diagram/diagramAttributeUtil";

export interface NodeAttributeFactoryProps {
    draftNode: DiagramNode;
    projectDiagram: ProjectDiagram;
    allNodes: DiagramNode[];
}

export class NodeAttributeFactory {
    private static readonly DISABLED_KEYS_BY_NODE_TYPE: Record<string, Set<string>> = {
        [CanvasNodeVariantType.infoNode]: new Set(["height", "width"]),
    };

    private readonly draftNode: DiagramNode;
    private readonly projectDiagram: ProjectDiagram;
    private readonly allNodes: DiagramNode[];

    public readonly main: BaseFieldAttribute[];
    public readonly main_advanced: BaseFieldAttribute[];
    public readonly data: BaseFieldAttribute[];
    public readonly data_advanced: BaseFieldAttribute[];
    public readonly style: BaseFieldAttribute[];
    public readonly style_advanced: BaseFieldAttribute[];
    public readonly cacti: BaseFieldAttribute[];

    constructor({ draftNode, projectDiagram, allNodes }: NodeAttributeFactoryProps) {
        this.draftNode = draftNode;
        this.projectDiagram = projectDiagram;
        this.allNodes = allNodes;

        this.main = this.getMainAttributes();
        this.main_advanced = this.getMainAdvancedAttributes();
        this.data = this.getDataAttributes();
        this.data_advanced = this.getDataAdvancedAttributes();
        this.style = this.getStyleAttributes();
        this.style_advanced = this.getStyleAdvancedAttributes();
        this.cacti = this.getCactiAttributes();
    }

    /**
     * Gets physical location options for node attributes.
     * Combines default physical location options with cluster nodes from the current diagram.
     * Only includes cluster nodes of type architecture.
     *
     * @returns An array of SelectableValue objects representing available physical location options
     */
    private getPhysicalLocationOptions(): SelectableValue[] {
        const allClusterNodeOptions = this.allNodes
            ?.filter(
                (n) =>
                    n?.type === CanvasNodeVariantType.clusterNode &&
                    n?.data?.type === CanvasNodeType.architecture
            )
            ?.map((n) => {
                return {
                    label: n?.data?.label,
                    value: n?.id,
                } as SelectableValue;
            });
        return [...defaultPhysicalLocationOptions, ...allClusterNodeOptions];
    }

    /**
     * Gets node data attributes with dynamic modifications based on runtime state.
     *
     * This function cannot be a constant because:
     * 1. It depends on runtime parameters (draftNode, projectDiagram, allNodes) that vary per node instance
     * 2. It calls other functions (getPhysicalLocationOptions, getDataStoredOptions) that compute values
     *    based on current project/diagram state
     * 3. It dynamically modifies attribute properties (disabled, options, deletable) based on:
     *    - Node type (CanvasNodeVariantType.infoNode, etc.)
     *    - Node data type (data_flow, etc.)
     *    - Node state (cardRefKey presence, etc.)
     * 4. The returned attributes object is different for each node and changes based on the node's
     *    current state and the project's current configuration
     */
    private getDataAttributes(): BaseFieldAttribute[] {
        const isDataFlowNode = this.draftNode?.data?.type === CanvasNodeType.data_flow.toString();
        const isInfoNode = this.draftNode.type === CanvasNodeVariantType.infoNode;
        const hasCardRefKey = !!this.draftNode?.data?.cardRefKey;

        const physicalLocationOptions = this.getPhysicalLocationOptions();
        const dataStoredOptions = getDataStoredOptions(this.projectDiagram?.card_nodes || []);

        return default_node_data_attributes.map((attr) => {
            const updatedAttr = { ...attr };

            // Apply data_flow node restrictions
            if (isDataFlowNode && (updatedAttr.key === "icon" || updatedAttr.key === "label")) {
                updatedAttr.disabled = true;
            }

            // Configure data_stored attribute
            if (updatedAttr.key === "data_stored") {
                updatedAttr.options = dataStoredOptions;
                updatedAttr.disabled = !isInfoNode || hasCardRefKey;
                updatedAttr.deletable = isInfoNode;
            }

            // Configure physicalLocation attribute
            if (updatedAttr.key === "physicalLocation") {
                updatedAttr.options = physicalLocationOptions;
            }

            return updatedAttr;
        });
    }

    /**
     * Gets node data advanced attributes with dynamic modifications based on runtime state.
     *
     * This function cannot be a constant because:
     * 1. It depends on runtime parameters (draftNode, projectDiagram, allNodes) that vary per node instance
     * 2. It calls other functions (getPhysicalLocationOptions, getDataStoredOptions) that compute values
     *    based on current project/diagram state
     * 3. It dynamically modifies attribute properties (disabled, options, deletable) based on:
     *    - Node type (CanvasNodeVariantType.infoNode, etc.)
     *    - Node data type (data_flow, etc.)
     *    - Node state (cardRefKey presence, etc.)
     * 4. The returned attributes array is different for each node and changes based on the node's
     *    current state and the project's current configuration
     * 5. Unlike getNodeDataAttributes which returns an object, this function returns an array of
     *    BaseFieldAttribute objects, making it suitable for advanced attribute configurations
     */
    private getDataAdvancedAttributes(): BaseFieldAttribute[] {
        const isDataFlowNode = this.draftNode?.data?.type === CanvasNodeType.data_flow.toString();
        const isInfoNode = this.draftNode.type === CanvasNodeVariantType.infoNode;
        const hasCardRefKey = !!this.draftNode?.data?.cardRefKey;

        const physicalLocationOptions = this.getPhysicalLocationOptions();
        const dataStoredOptions = getDataStoredOptions(this.projectDiagram?.card_nodes || []);

        return default_node_data_advanced_attributes.map((attr) => {
            const updatedAttr = { ...attr };

            // Apply data_flow node restrictions
            if (isDataFlowNode && (updatedAttr.key === "icon" || updatedAttr.key === "label")) {
                updatedAttr.disabled = true;
            }

            // Configure data_stored attribute
            if (updatedAttr.key === "data_stored") {
                updatedAttr.options = dataStoredOptions;
                updatedAttr.disabled = !isInfoNode || hasCardRefKey;
                updatedAttr.deletable = isInfoNode;
            }

            // Configure physicalLocation attribute
            if (updatedAttr.key === "physicalLocation") {
                updatedAttr.options = physicalLocationOptions;
            }

            return updatedAttr;
        });
    }

    /**
     * Gets node style attributes with dynamic modifications based on runtime state.
     *
     * This function cannot be a constant because:
     * 1. It depends on runtime parameters (draftNode, projectDiagram, allNodes) that vary per node instance
     * 2. It dynamically modifies attribute properties (disabled) based on the node's current
     *    data type (e.g., data_flow nodes have all style attributes disabled)
     * 3. The returned attributes object is different for each node and changes based on the
     *    node's current state
     * 4. Unlike constants which are computed once at module load, this function must be
     *    called for each node to reflect its current state
     * 5. The function signature includes projectDiagram and allNodes parameters for consistency
     *    with getNodeDataAttributes and potential future enhancements that may require
     *    project/diagram context for style attribute calculations
     */
    private getStyleAttributes(): BaseFieldAttribute[] {
        const isDataFlowNode = this.draftNode?.data?.type === CanvasNodeType.data_flow.toString();

        const disabledKeys =
            NodeAttributeFactory.DISABLED_KEYS_BY_NODE_TYPE[this.draftNode?.type ?? ""] ??
            new Set();

        return default_node_style_attributes.map((attr) => {
            return {
                ...attr,
                disabled: attr.disabled || isDataFlowNode || disabledKeys.has(attr.key),
            };
        });
    }

    /**
     * Gets node advanced style attributes.
     * Returns an empty array as there are currently no advanced style attributes defined for nodes.
     * This method is provided for consistency and potential future use.
     *
     * @returns An empty array of BaseFieldAttribute objects
     */
    private getStyleAdvancedAttributes(): BaseFieldAttribute[] {
        return [];
    }

    /**
     * Gets node Cacti attributes.
     * Returns a copy of the default Cacti attributes for nodes.
     * These attributes are used for Cacti-specific node configurations.
     *
     * @returns An array of BaseFieldAttribute objects representing Cacti-specific node attributes
     */
    private getCactiAttributes(): BaseFieldAttribute[] {
        return [...default_node_cacti_attributes];
    }

    /**
     * Gets node main attributes.
     * Returns a copy of the default main attributes for nodes.
     * These attributes represent the core properties of a node (e.g., id, type, position).
     *
     * @returns An array of BaseFieldAttribute objects representing main node attributes
     */
    private getMainAttributes(): BaseFieldAttribute[] {
        return [...default_node_main_attributes];
    }

    /**
     * Gets node advanced main attributes.
     * Returns an empty array as there are currently no advanced main attributes defined for nodes.
     * This method is provided for consistency and potential future use.
     *
     * @returns An empty array of BaseFieldAttribute objects
     */
    private getMainAdvancedAttributes(): BaseFieldAttribute[] {
        return [];
    }

    /**
     * Returns all attributes as a dictionary/object
     */
    public toDictionary(): {
        main: BaseFieldAttribute[];
        main_advanced: BaseFieldAttribute[];
        data: BaseFieldAttribute[];
        data_advanced: BaseFieldAttribute[];
        style: BaseFieldAttribute[];
        style_advanced: BaseFieldAttribute[];
        cacti: BaseFieldAttribute[];
    } {
        return {
            main: this.main,
            main_advanced: this.main_advanced,
            data: this.data,
            data_advanced: this.data_advanced,
            style: this.style,
            style_advanced: this.style_advanced,
            cacti: this.cacti,
        };
    }
}
