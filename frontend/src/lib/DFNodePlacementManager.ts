import {
    DATAFLOW_DEVICES_COL_OFFSET_VALUES,
    DATAFLOW_USERS_COL_OFFSET_VALUES,
    DEFAULT_CLUSTER_NODE_HEIGHT,
    DEFAULT_CLUSTER_NODE_WIDTH,
    DEFAULT_DATAFLOW_CANVAS_COLUMN,
    SUMMARY_INTERFACE_NODE_HEIGHT,
    SUMMARY_INTERFACE_NODE_SPACING_X,
    SUMMARY_INTERFACE_NODE_SPACING_Y,
    SUMMARY_INTERFACE_NODE_WIDTH,
} from "#root/constants/diagram";
import { CanvasAxis, CanvasColumn, UserStoryCardRefEnum } from "#root/enums/diagram";
import { DiagramNode } from "#root/interfaces/diagram";

type RefPositionMap = Record<CanvasColumn, readonly number[]>;

/**
 * Manager class for placing and positioning nodes in a dataflow diagram.
 * Handles node placement for users, devices, and interfaces across different
 * canvas columns (top, bottom, left, right) with proper spacing and layout calculations.
 */
export class DFNodePlacementManager {
    readonly nodes: ReadonlyArray<DiagramNode>;
    readonly refPositionMap: RefPositionMap;

    /**
     * Creates an instance of DFNodePlacementManager.
     *
     * @param nodes - Array of diagram nodes to manage placement for.
     * @param refPositionMap - Map of canvas columns to reference positions [x, y].
     */
    constructor(
        nodes: DiagramNode[], //
        refPositionMap: RefPositionMap
    ) {
        this.nodes = nodes;
        this.refPositionMap = refPositionMap;
    }

    /**
     * Sets positions for all dataflow nodes based on their canvas columns.
     * Separates interface nodes from other nodes, groups nodes by side,
     * and updates their canvas columns and positions.
     *
     * @param canvasColumn - Optional canvas column to override node column assignments.
     * @returns Array of nodes with updated positions and canvas columns.
     */
    setDFNodes(
        canvasColumn?: CanvasColumn //
    ): DiagramNode[] {
        const interface_nodes = this.nodes.filter(
            (n) => n.data.cardRefKey === UserStoryCardRefEnum.card_interface
        );
        const other_nodes = this.nodes.filter(
            (n) => n.data.cardRefKey !== UserStoryCardRefEnum.card_interface
        );
        const side_based_nodes = other_nodes.reduce(
            (acc, n) => {
                const n_side = n.data.canvasColumn
                    ? n.data.canvasColumn
                    : DEFAULT_DATAFLOW_CANVAS_COLUMN;
                const side = (canvasColumn ? canvasColumn : n_side) as CanvasColumn;
                if (!acc[side]) {
                    acc[side] = {
                        [UserStoryCardRefEnum.card_users]: [],
                        [UserStoryCardRefEnum.card_devices]: [],
                    };
                }
                const nodeType = n.data.cardRefKey as UserStoryCardRefEnum;
                acc[side]?.[nodeType]?.push(n);
                return acc;
            },
            {} as { [key in CanvasColumn]: Record<string, DiagramNode[]> }
        );

        const all_nodes: DiagramNode[] = Object.entries(side_based_nodes)
            .map(([columnkey, value]) => {
                const __nodes: DiagramNode[] = this.updateDFNodesCanvasColumn(
                    columnkey as CanvasColumn,
                    value[UserStoryCardRefEnum.card_users] || [],
                    interface_nodes,
                    value[UserStoryCardRefEnum.card_devices] || []
                );
                __nodes.forEach((n) => (n.data.canvasColumn = columnkey));

                return __nodes;
            })
            .flat();

        return all_nodes;
    }

    /**
     * Updates node positions and dimensions for nodes in a specific canvas column.
     * Handles user nodes, device nodes, and interface nodes with appropriate positioning.
     * Calculates positions based on horizontal or vertical axis orientation.
     *
     * @param columnkey - The canvas column key (top, bottom, left, right).
     * @param userNodes - Array of user nodes to position.
     * @param interfaceNodes - Array of interface nodes to attach to devices.
     * @param deviceNodes - Array of device nodes to position with their interfaces.
     * @returns Array of all nodes (users, devices, interfaces) with updated positions and dimensions.
     */
    updateDFNodesCanvasColumn(
        columnkey: CanvasColumn,
        userNodes: DiagramNode[],
        interfaceNodes: DiagramNode[],
        deviceNodes: DiagramNode[]
    ) {
        const isHorizontal = columnkey === CanvasColumn.top || columnkey === CanvasColumn.bottom;

        const axis = isHorizontal ? CanvasAxis.horizontal : CanvasAxis.vertical;
        const axis_refPosition = isHorizontal
            ? this.refPositionMap[columnkey][0]
            : this.refPositionMap[columnkey][1];

        // Users
        const usersPosSpread = this.getPositionSpread(userNodes, axis_refPosition || 0, axis);

        const hasDevices = deviceNodes.length > 0;
        const users = userNodes.map((n) => {
            n.position = this.calculateDFNodePosition(
                columnkey,
                usersPosSpread,
                n.id,
                UserStoryCardRefEnum.card_users,
                hasDevices
            ) || { x: 0, y: 0 };
            return n;
        });

        // Devices and Interfaces
        const interfaces: DiagramNode[] = [];

        const __devices = deviceNodes.map((n) => {
            // interfaces
            const _interface_list = interfaceNodes.filter(
                (t) => t.data.cardFieldOptionIdAssoc === n.data.cardFieldOptionId
            );

            let count: number = 0;
            _interface_list.map((i: DiagramNode) => {
                i.parentId = n.id;
                i.position = this.computeInterfaceNodePosition(count, axis);
                count += 1;
                return i;
            });
            interfaces.push(..._interface_list);

            // devices - set width and length
            if (axis === CanvasAxis.vertical) {
                n.width = DEFAULT_CLUSTER_NODE_WIDTH;
                n.height = this.calculateClusterNodeHeight(_interface_list.length);
            }
            if (axis === CanvasAxis.horizontal) {
                n.width = this.calculateClusterNodeWidth(_interface_list.length);
                n.height = DEFAULT_CLUSTER_NODE_HEIGHT;
            }
            n.style = {
                ...n.style,
                width: n.width,
                height: n.height,
            };
            return n;
        });

        const devicePosSpread = this.getPositionSpread(__devices, axis_refPosition || 0, axis);

        const devices = __devices.map((n) => {
            n.position = this.calculateDFNodePosition(
                columnkey,
                devicePosSpread,
                n.id,
                UserStoryCardRefEnum.card_devices,
                hasDevices
            ) || { x: 0, y: 0 };
            return n;
        });

        return [...users, ...devices, ...interfaces];
    }

    /**
     * Calculates position spread for nodes along an axis, centered around a midpoint.
     * Distributes nodes evenly with spacing between them.
     *
     * @param nodes - Array of nodes to calculate positions for.
     * @param midPosition - The midpoint position to center the nodes around.
     * @param axis - The axis (horizontal or vertical) to calculate positions along.
     * @param spacing - The spacing between nodes. Defaults to 75.
     * @returns Record mapping node IDs to their calculated positions, or empty object if no nodes.
     */
    getPositionSpread(
        nodes: DiagramNode[],
        midPosition: number,
        axis: CanvasAxis,
        spacing = 75
    ): Record<string, number> {
        if (nodes.length === 0) return {};

        const sizeKey = axis === CanvasAxis.vertical ? "height" : "width";

        const totalSize =
            nodes.reduce((sum, node) => sum + (node[sizeKey] || 0), 0) +
            spacing * (nodes.length - 1);

        let current = midPosition - totalSize / 2;

        const positions: Record<string, number> = {};

        nodes.forEach((node) => {
            positions[node.id] = current;
            current += (node[sizeKey] || 0) + spacing;
        });

        return positions;
    }

    /**
     * Calculates the absolute position for a dataflow node based on its column and spread position.
     * Applies appropriate offsets based on the node type (users vs devices) and column position.
     *
     * @param columnKey - The canvas column where the node is placed (top, bottom, left, right).
     * @param posSpread - Record mapping node IDs to their spread positions.
     * @param nodeId - The ID of the node to calculate position for.
     * @param cardRefKey - The card reference key (users or devices) determining offset values.
     * @param hasDevices - Optional flag indicating if devices exist, used for user node offset calculation.
     * @returns Object with x and y coordinates for the node position.
     */
    calculateDFNodePosition(
        columnKey: CanvasColumn,
        posSpread: Record<string, number>,
        nodeId: string,
        cardRefKey: UserStoryCardRefEnum,
        hasDevices?: boolean
    ) {
        const OFFSET: Record<string, number> =
            cardRefKey === UserStoryCardRefEnum.card_users && hasDevices
                ? DATAFLOW_USERS_COL_OFFSET_VALUES
                : DATAFLOW_DEVICES_COL_OFFSET_VALUES;

        if (columnKey === CanvasColumn.top) {
            return {
                x: posSpread[nodeId] || 0,
                y: (this.refPositionMap[columnKey]?.[1] || 0) + (OFFSET[CanvasColumn.top] || 0),
            };
        }
        if (columnKey === CanvasColumn.bottom) {
            return {
                x: posSpread[nodeId] || 0,
                y: (this.refPositionMap[columnKey]?.[1] || 0) + (OFFSET[CanvasColumn.bottom] || 0),
            };
        }
        if (columnKey === CanvasColumn.right) {
            return {
                x: (this.refPositionMap[columnKey]?.[0] || 0) + (OFFSET[CanvasColumn.right] || 0),
                y: posSpread[nodeId] || 0,
            };
        }
        return {
            x: (this.refPositionMap[columnKey]?.[0] || 0) + (OFFSET[CanvasColumn.left] || 0),
            y: posSpread[nodeId] || 0,
        };
    }

    /**
     * Computes the position for an interface node relative to its parent device node.
     * Calculates position based on the index and axis orientation.
     *
     * @param itemIdx - The index of the interface node in the list.
     * @param axis - The axis orientation (horizontal or vertical) for positioning.
     * @returns Object with x and y coordinates for the interface node position.
     */
    computeInterfaceNodePosition = (
        itemIdx: number, //
        axis: CanvasAxis
    ) => {
        if (axis === CanvasAxis.vertical) {
            return {
                x: SUMMARY_INTERFACE_NODE_SPACING_X,
                y:
                    SUMMARY_INTERFACE_NODE_SPACING_Y +
                    itemIdx * (SUMMARY_INTERFACE_NODE_HEIGHT + SUMMARY_INTERFACE_NODE_SPACING_Y),
            };
        } else {
            return {
                x:
                    SUMMARY_INTERFACE_NODE_SPACING_X +
                    itemIdx * (SUMMARY_INTERFACE_NODE_HEIGHT + SUMMARY_INTERFACE_NODE_SPACING_X),
                y: SUMMARY_INTERFACE_NODE_SPACING_Y,
            };
        }
    };

    /**
     * Calculates the height required for a cluster node based on the number of interface nodes.
     * Accounts for spacing between interface nodes.
     *
     * @param interfaceNodeCount - The number of interface nodes contained in the cluster.
     * @returns The calculated height for the cluster node.
     */
    calculateClusterNodeHeight(
        interfaceNodeCount: number //
    ) {
        return (
            SUMMARY_INTERFACE_NODE_SPACING_Y +
            (interfaceNodeCount || 1) *
                (SUMMARY_INTERFACE_NODE_SPACING_Y + SUMMARY_INTERFACE_NODE_HEIGHT)
        );
    }

    /**
     * Calculates the width required for a cluster node based on the number of interface nodes.
     * Accounts for spacing between interface nodes.
     *
     * @param interfaceNodeCount - The number of interface nodes contained in the cluster.
     * @returns The calculated width for the cluster node.
     */
    calculateClusterNodeWidth(
        interfaceNodeCount: number //
    ) {
        return (
            SUMMARY_INTERFACE_NODE_SPACING_X +
            (interfaceNodeCount || 1) *
                (SUMMARY_INTERFACE_NODE_SPACING_X + SUMMARY_INTERFACE_NODE_WIDTH)
        );
    }
}
