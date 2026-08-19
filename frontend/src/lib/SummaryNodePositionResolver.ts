import {
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    SUMMARY_DEVICE_NODE_HEIGHT,
    SUMMARY_DEVICE_NODE_SPACING_Y_TOP,
    SUMMARY_DEVICE_NODE_WIDTH,
    SUMMARY_INTERFACE_NODE_HEIGHT,
    SUMMARY_INTERFACE_NODE_SPACING_X,
    SUMMARY_INTERFACE_NODE_SPACING_Y,
    SUMMARY_INTERFACE_NODE_WIDTH,
} from "#root/constants/diagram";
import { CanvasType, UserStoryCardRefEnum } from "#root/enums/diagram";
import {
    ColumnOffsetType,
    DiagramEdge,
    DiagramNode,
    ProjectDiagram,
    SummaryCanvasColumn,
    SummaryCanvasColumnPositionAttr,
} from "#root/interfaces/diagram";
import { getNodePositionAbsolute } from "#root/utils/diagram/diagramNodePositionUtil";

const cloneDiagramNode = (node: DiagramNode): DiagramNode => {
    return {
        ...node,
        ...(node.data && {
            data: {
                ...node.data,
            },
        }),
        ...(node.style && {
            style: {
                ...node.style,
            },
        }),
        ...(node.position && {
            position: {
                ...node.position,
            },
        }),
    };
};

const getOriginalNodeId = (node: DiagramNode) => {
    return `${node?.data?.["originalNodeId"] || node.id || ""}`;
};

export class SummaryNodePositionResolver {
    projectDiagram: ProjectDiagram;
    uniqueCardDeviceNodes: DiagramNode[];
    uniqueCardInterfaceNodes: DiagramNode[];
    uniqueCardUserNodes: DiagramNode[];
    uniqueCardInterfaceNodesPerDeviceMapping: {
        [key: string]: DiagramNode[];
    };
    positionOffset: {
        [key in SummaryCanvasColumn]: SummaryCanvasColumnPositionAttr;
    };
    extremePositions: {
        x: number;
        y: number;
        positionKey: string;
    }[];
    //
    allNodes: DiagramNode[];
    diagramEdges__dataFlow: DiagramEdge[];
    //
    deviceNodeColumnMapping: {
        [key: string]: SummaryCanvasColumn;
    };
    interfaceNodeColumnMapping: {
        [key: string]: SummaryCanvasColumn;
    };
    userNodeColumnMapping: {
        [key: string]: SummaryCanvasColumn;
    };

    constructor({
        projectDiagram, //
        uniqueCardDeviceNodes,
        uniqueCardInterfaceNodes,
        uniqueCardUserNodes,
        uniqueCardInterfaceNodesPerDeviceMapping,
        positionOffset,
        extremePositions,
    }: {
        projectDiagram: ProjectDiagram;
        uniqueCardDeviceNodes: DiagramNode[];
        uniqueCardInterfaceNodes: DiagramNode[];
        uniqueCardUserNodes: DiagramNode[];
        uniqueCardInterfaceNodesPerDeviceMapping: {
            [key: string]: DiagramNode[];
        };
        positionOffset: {
            [key in SummaryCanvasColumn]: SummaryCanvasColumnPositionAttr;
        };
        extremePositions: {
            x: number;
            y: number;
            positionKey: string;
        }[];
    }) {
        this.projectDiagram = projectDiagram;
        this.uniqueCardDeviceNodes = uniqueCardDeviceNodes.map(cloneDiagramNode);
        this.uniqueCardInterfaceNodes = uniqueCardInterfaceNodes.map(cloneDiagramNode);
        this.uniqueCardUserNodes = uniqueCardUserNodes.map(cloneDiagramNode);
        this.uniqueCardInterfaceNodesPerDeviceMapping = Object.fromEntries(
            Object.entries(uniqueCardInterfaceNodesPerDeviceMapping).map(([key, nodes]) => {
                return [key, nodes.map(cloneDiagramNode)];
            })
        );
        this.positionOffset = positionOffset;
        this.extremePositions = extremePositions;
        //
        this.allNodes = projectDiagram.canvas.flatMap((c) => c.nodes) || [];
        this.diagramEdges__dataFlow = projectDiagram.canvas
            .filter((c) => {
                return c?.canvas_type === CanvasType.data_flow.toString();
            })
            .flatMap((c) => c?.edges);
        //
        this.deviceNodeColumnMapping = {};
        this.interfaceNodeColumnMapping = {};
        this.userNodeColumnMapping = {};
    }

    updateDeviceNodeColumnMapping() {
        // ############################################################
        // DEVICE NODE COLUMN CLASSIFICATION
        // ############################################################

        const diffY = Object.entries(this.positionOffset).reduce(
            (acc, [attrKey, attr]) => {
                acc[attrKey as SummaryCanvasColumn] = Math.abs(attr.defaultY - attr.y);
                return acc;
            },
            {} as { [key in SummaryCanvasColumn]: number }
        );
        const deviceNodeColumnMapping = {} as {
            [key: string]: SummaryCanvasColumn;
        };
        const interfaceNodeColumnMapping = {} as {
            [key: string]: SummaryCanvasColumn;
        };
        this.uniqueCardDeviceNodes.forEach((deviceNode) => {
            const uniqueCardInterfaceNodesPerDevice =
                this.uniqueCardInterfaceNodesPerDeviceMapping[deviceNode.id];

            const columnKeys = [] as SummaryCanvasColumn[];
            uniqueCardInterfaceNodesPerDevice?.forEach((interfaceNode) => {
                const interfaceNodeId = getOriginalNodeId(interfaceNode);
                const interfaceEdges =
                    this.diagramEdges__dataFlow.filter((e) => {
                        return e.source === interfaceNodeId || e.target === interfaceNodeId;
                    }) || [];

                const connectedNodes = [] as DiagramNode[];
                interfaceEdges.forEach((e) => {
                    let nodeId = "";
                    if (e.source === interfaceNodeId) {
                        nodeId = e.target;
                    } else if (e.target === interfaceNodeId) {
                        nodeId = e.source;
                    }
                    const _node = this.allNodes.find((n) => n.id === nodeId);
                    if (
                        !_node ||
                        _node?.data?.cardRefKey === UserStoryCardRefEnum.card_users.toString() ||
                        !!_node?.hidden
                    )
                        return;
                    connectedNodes.push(_node);
                });

                connectedNodes.forEach((n) => {
                    const positionAbsolute = getNodePositionAbsolute({
                        node: n,
                        allNodes: this.allNodes,
                    });

                    let smallestDisplacement = Infinity;
                    let smallestDisplacementPositionKey = "";
                    this.extremePositions.forEach((ext) => {
                        const displacement = Math.sqrt(
                            Math.pow(positionAbsolute.x - ext.x, 2) +
                                Math.pow(positionAbsolute.y - ext.y, 2)
                        );
                        if (displacement < smallestDisplacement) {
                            smallestDisplacement = displacement;
                            smallestDisplacementPositionKey = ext.positionKey;
                        }
                    });

                    if (
                        smallestDisplacementPositionKey === "top_left" ||
                        smallestDisplacementPositionKey === "bottom_left"
                    ) {
                        columnKeys.push("left");
                    } else if (
                        smallestDisplacementPositionKey === "top_right" ||
                        smallestDisplacementPositionKey === "bottom_right"
                    ) {
                        columnKeys.push("right");
                    } else {
                        throw new Error("Unexpected position key");
                    }
                });
                if (!connectedNodes?.length) {
                    columnKeys.push("left");
                }
            });

            if (uniqueCardInterfaceNodesPerDevice?.length && !columnKeys?.length)
                throw new Error("Column key not set");

            // TODO: Handle case where multiple column keys are present
            const columnKeyCountMapping = {} as {
                [key in SummaryCanvasColumn]: number;
            };
            columnKeys.forEach((k) => {
                columnKeyCountMapping[k] = columnKeyCountMapping[k]
                    ? columnKeyCountMapping[k] + 1
                    : 1;
            });

            let columnKey = "" as SummaryCanvasColumn;
            if (Object.keys(columnKeyCountMapping).length > 1) {
                columnKey = diffY.top > diffY.bottom ? "bottom" : "top";
                // columnKey = "top";
            } else {
                columnKey = columnKeys[0] || "left";
            }

            deviceNodeColumnMapping[deviceNode.id] = columnKey ?? deviceNode?.data?.canvasColumn;
            uniqueCardInterfaceNodesPerDevice?.forEach((interfaceNode) => {
                interfaceNodeColumnMapping[interfaceNode.id] = columnKey;
            });
        });

        this.deviceNodeColumnMapping = deviceNodeColumnMapping;
        this.interfaceNodeColumnMapping = interfaceNodeColumnMapping;
    }

    resetPositionOffsetForNewColumn({
        columnOffsetType,
        nodeColumnMapping,
    }: {
        columnOffsetType: ColumnOffsetType;
        nodeColumnMapping: {
            [key: string]: SummaryCanvasColumn;
        };
    }) {
        const positionOffset = this.positionOffset;
        const positionOffsetKeys = Object.keys(positionOffset) as SummaryCanvasColumn[];
        positionOffsetKeys.forEach((columnKey) => {
            const nodeCount = Object.values(nodeColumnMapping).reduce((acc, val) => {
                if (val !== columnKey) return acc;
                acc += 1;
                return acc;
            }, 0);
            if (!nodeCount) return;

            const columnOffsetRelativeX =
                positionOffset[columnKey].columnOffsetRelative[columnOffsetType].x;
            positionOffset[columnKey].x += columnOffsetRelativeX;

            const columnOffsetRelativeY =
                positionOffset[columnKey].columnOffsetRelative[columnOffsetType].y;
            positionOffset[columnKey].y += columnOffsetRelativeY;

            const columnOffsetAbsoluteX =
                positionOffset[columnKey].columnOffsetAbsolute[columnOffsetType]?.x;
            if (columnOffsetAbsoluteX !== undefined) {
                positionOffset[columnKey].x = columnOffsetAbsoluteX;
            }

            const columnOffsetAbsoluteY =
                positionOffset[columnKey].columnOffsetAbsolute[columnOffsetType]?.y;
            if (columnOffsetAbsoluteY !== undefined) {
                positionOffset[columnKey].y = columnOffsetAbsoluteY;
            }
        });
    }

    getDeviceNodeWidthAndHeight({
        columnKey,
        uniqueCardInterfaceNodesPerDevice,
    }: {
        columnKey: SummaryCanvasColumn;
        uniqueCardInterfaceNodesPerDevice: DiagramNode[];
    }) {
        let width = SUMMARY_DEVICE_NODE_WIDTH;
        let height = SUMMARY_DEVICE_NODE_HEIGHT;
        if (
            columnKey === "left" || //
            columnKey === "right"
        ) {
            width = SUMMARY_DEVICE_NODE_WIDTH;
            height =
                SUMMARY_INTERFACE_NODE_SPACING_Y +
                (SUMMARY_INTERFACE_NODE_SPACING_Y + SUMMARY_INTERFACE_NODE_HEIGHT) *
                    uniqueCardInterfaceNodesPerDevice.length;
        } else if (columnKey === "top" || columnKey === "bottom") {
            width =
                SUMMARY_INTERFACE_NODE_SPACING_X +
                (SUMMARY_INTERFACE_NODE_SPACING_X + SUMMARY_INTERFACE_NODE_WIDTH) *
                    uniqueCardInterfaceNodesPerDevice.length;
            height = SUMMARY_DEVICE_NODE_HEIGHT;
        }
        return { width, height };
    }

    updateDeviceNodePosition() {
        const positionOffset = this.positionOffset;
        this.uniqueCardDeviceNodes.forEach((deviceNode) => {
            const uniqueCardInterfaceNodesPerDevice =
                this.uniqueCardInterfaceNodesPerDeviceMapping[deviceNode.id];
            const columnKey = this.deviceNodeColumnMapping[deviceNode.id];

            if (!columnKey) return;

            deviceNode.position = {
                x: positionOffset[columnKey].x,
                y: positionOffset[columnKey].y,
            };

            deviceNode.style = deviceNode.style || {};

            const {
                width: deviceNode__width, //
                height: deviceNode__height,
            } = this.getDeviceNodeWidthAndHeight({
                columnKey,
                uniqueCardInterfaceNodesPerDevice: uniqueCardInterfaceNodesPerDevice || [],
            });
            deviceNode.width = deviceNode__width;
            deviceNode.style["width"] = deviceNode__width;
            deviceNode.height = deviceNode__height;
            deviceNode.style["height"] = deviceNode__height;

            const incrementOffsetRelative = positionOffset[
                columnKey
            ]?.incrementOffsetRelative?.device({
                width: deviceNode__width,
                height: deviceNode__height,
            });
            if (positionOffset[columnKey] && incrementOffsetRelative) {
                positionOffset[columnKey].x += incrementOffsetRelative.x;
                positionOffset[columnKey].y += incrementOffsetRelative.y;
            }
        });
    }

    updateInterfaceNodePosition() {
        this.uniqueCardDeviceNodes.forEach((deviceNode) => {
            const uniqueCardInterfaceNodesPerDevice =
                this.uniqueCardInterfaceNodesPerDeviceMapping[deviceNode.id] || [];
            const columnKey = this.deviceNodeColumnMapping[deviceNode.id];
            const deviceWidth = Number(deviceNode.width ?? deviceNode.style?.width ?? 0);
            const deviceHeight = Number(deviceNode.height ?? deviceNode.style?.height ?? 0);
            const contentInsetTop = SUMMARY_DEVICE_NODE_SPACING_Y_TOP;
            const contentInsetBottom = SUMMARY_DEVICE_NODE_SPACING_Y_TOP;
            const contentInsetX = SUMMARY_INTERFACE_NODE_SPACING_X / 2;
            const usableWidth = Math.max(0, deviceWidth - 2 * contentInsetX);
            const usableHeight = Math.max(0, deviceHeight - contentInsetTop - contentInsetBottom);

            if (!columnKey || !uniqueCardInterfaceNodesPerDevice.length) return;

            if (columnKey === "left" || columnKey === "right") {
                const groupHeight =
                    uniqueCardInterfaceNodesPerDevice.length * SUMMARY_INTERFACE_NODE_HEIGHT +
                    Math.max(0, uniqueCardInterfaceNodesPerDevice.length - 1) *
                        SUMMARY_INTERFACE_NODE_SPACING_Y;
                const startY = contentInsetTop + Math.max(0, (usableHeight - groupHeight) / 2);
                const centeredX =
                    contentInsetX + Math.max(0, (usableWidth - SUMMARY_INTERFACE_NODE_WIDTH) / 2);

                uniqueCardInterfaceNodesPerDevice.forEach((interfaceNode, nodeIdx) => {
                    interfaceNode.position = {
                        x: centeredX,
                        y:
                            startY +
                            nodeIdx *
                                (SUMMARY_INTERFACE_NODE_HEIGHT + SUMMARY_INTERFACE_NODE_SPACING_Y),
                    };
                });

                return;
            }

            const groupWidth =
                uniqueCardInterfaceNodesPerDevice.length * SUMMARY_INTERFACE_NODE_WIDTH +
                Math.max(0, uniqueCardInterfaceNodesPerDevice.length - 1) *
                    SUMMARY_INTERFACE_NODE_SPACING_X;
            const startX = contentInsetX + Math.max(0, (usableWidth - groupWidth) / 2);
            const centeredY =
                contentInsetTop + Math.max(0, (usableHeight - SUMMARY_INTERFACE_NODE_HEIGHT) / 2);

            uniqueCardInterfaceNodesPerDevice.forEach((interfaceNode, nodeIdx) => {
                interfaceNode.position = {
                    x:
                        startX +
                        nodeIdx * (SUMMARY_INTERFACE_NODE_WIDTH + SUMMARY_INTERFACE_NODE_SPACING_X),
                    y: centeredY,
                };
            });
        });

        const interfaceNodePositionById = new Map(
            Object.values(this.uniqueCardInterfaceNodesPerDeviceMapping)
                .flat()
                .map((interfaceNode) => [interfaceNode.id, interfaceNode.position] as const)
        );

        this.uniqueCardInterfaceNodes.forEach((interfaceNode) => {
            const resolvedPosition = interfaceNodePositionById.get(interfaceNode.id);
            if (!resolvedPosition) return;

            interfaceNode.position = {
                ...resolvedPosition,
            };
        });
    }

    getUserNodeColumnKey({
        columnKeyCountMapping,
        diffY,
        columnKeys,
    }: {
        columnKeyCountMapping: {
            [key in SummaryCanvasColumn]: number; //
        };
        diffY: { [key in SummaryCanvasColumn]: number };
        columnKeys: SummaryCanvasColumn[];
    }) {
        if (Object.keys(columnKeyCountMapping).length > 1) {
            if (
                !!columnKeys.includes("left") &&
                !!columnKeys.includes("right") &&
                !!columnKeys.includes("top") &&
                !!columnKeys.includes("bottom")
            ) {
                return diffY.top > diffY.bottom ? "bottom" : "top";
            } else if (
                !!columnKeys.includes("right") &&
                !!columnKeys.includes("top") &&
                !!columnKeys.includes("bottom")
            ) {
                return "right";
            } else if (
                !!columnKeys.includes("left") &&
                !!columnKeys.includes("top") &&
                !!columnKeys.includes("bottom")
            ) {
                return "left";
            } else if (
                !!columnKeys.includes("left") &&
                !!columnKeys.includes("right") &&
                !!columnKeys.includes("bottom")
            ) {
                return "bottom";
            } else if (
                !!columnKeys.includes("left") &&
                !!columnKeys.includes("right") &&
                !!columnKeys.includes("top")
            ) {
                return "top";
            } else if (!!columnKeys.includes("left") && !!columnKeys.includes("right")) {
                return diffY.top > diffY.bottom ? "bottom" : "top";
            } else if (!!columnKeys.includes("top") && !!columnKeys.includes("bottom")) {
                return diffY.top > diffY.bottom ? "bottom" : "top";
            } else if (
                !!columnKeys.includes("left") //
            ) {
                return "left";
            } else if (
                !!columnKeys.includes("right") //
            ) {
                return "right";
            } else {
                return diffY.top > diffY.bottom ? "bottom" : "top";
            }
        }

        return columnKeys[0] || "left";
    }

    updateUserNodeColumnMapping() {
        const userNodeColumnMapping = {} as {
            [key: string]: SummaryCanvasColumn;
        };
        const diffY = Object.entries(this.positionOffset).reduce(
            (acc, [attrKey, attr]) => {
                acc[attrKey as SummaryCanvasColumn] = Math.abs(attr.defaultY - attr.y);
                return acc;
            },
            {} as { [key in SummaryCanvasColumn]: number }
        );
        this.uniqueCardUserNodes.forEach((userNode) => {
            const userNodeId = getOriginalNodeId(userNode);
            const userEdges =
                this.diagramEdges__dataFlow.filter((e) => {
                    return e.source === userNodeId || e.target === userNodeId;
                }) || [];

            const connectedInterfaceNodes = [] as DiagramNode[];
            userEdges.forEach((e) => {
                let nodeId = "";
                if (e.source === userNodeId) {
                    nodeId = e.target;
                } else if (e.target === userNodeId) {
                    nodeId = e.source;
                }
                const _node = this.uniqueCardInterfaceNodes.find(
                    (n) => getOriginalNodeId(n) === nodeId
                );
                if (
                    !_node ||
                    _node?.data?.cardRefKey !== UserStoryCardRefEnum.card_interface.toString() ||
                    !!_node?.hidden
                )
                    return;
                connectedInterfaceNodes.push(_node);
            });

            const columnKeys = [] as SummaryCanvasColumn[];
            connectedInterfaceNodes.forEach((n) => {
                const _columnKey = this.interfaceNodeColumnMapping[n.id];
                if (_columnKey) {
                    columnKeys.push(_columnKey);
                }
            });
            if (!connectedInterfaceNodes?.length) {
                columnKeys.push("left");
            }

            if (!columnKeys?.length) throw new Error("Column key not set");

            // TODO: Handle case where multiple column keys are present
            const columnKeyCountMapping = {} as {
                [key in SummaryCanvasColumn]: number;
            };
            columnKeys.forEach((k) => {
                columnKeyCountMapping[k] = columnKeyCountMapping[k]
                    ? columnKeyCountMapping[k] + 1
                    : 1;
            });

            const columnKey = this.getUserNodeColumnKey({
                columnKeyCountMapping,
                diffY,
                columnKeys,
            });
            userNodeColumnMapping[userNode.id] = columnKey || "left";
        });

        this.userNodeColumnMapping = userNodeColumnMapping;
    }

    updateUserNodePosition() {
        const positionOffset = this.positionOffset;
        this.uniqueCardUserNodes.forEach((userNode) => {
            const columnKey = this.userNodeColumnMapping[userNode.id];

            if (!columnKey) return;

            userNode.style = userNode.style || {};

            userNode.width = DEFAULT_ICON_NODE_WIDTH;
            userNode.style["width"] = DEFAULT_ICON_NODE_WIDTH;

            userNode.height = DEFAULT_ICON_NODE_HEIGHT;
            userNode.style["height"] = DEFAULT_ICON_NODE_HEIGHT;
            userNode.position = {
                x: positionOffset[columnKey].x,
                y: positionOffset[columnKey].y,
            };

            const incrementOffsetRelative = positionOffset[
                columnKey
            ]?.incrementOffsetRelative?.user({
                width: DEFAULT_ICON_NODE_WIDTH,
                height: DEFAULT_ICON_NODE_HEIGHT,
            });
            if (positionOffset[columnKey] && incrementOffsetRelative) {
                positionOffset[columnKey].x += incrementOffsetRelative.x;
                positionOffset[columnKey].y += incrementOffsetRelative.y;
            }
        });
    }

    updatePosition() {
        // ############################################################
        // DEVICE NODE COLUMN CLASSIFICATION
        // ############################################################
        this.updateDeviceNodeColumnMapping();

        // ############################################################
        // RESET POSITION OFFSET FOR NEW COLUMN
        // ############################################################
        this.resetPositionOffsetForNewColumn({
            columnOffsetType: "device",
            nodeColumnMapping: this.deviceNodeColumnMapping,
        });

        // ############################################################
        // DEVICE NODE POSITIONING
        // ############################################################
        this.updateDeviceNodePosition();

        // ############################################################
        // INTERFACE NODE POSITIONING
        // ############################################################
        this.updateInterfaceNodePosition();

        // ############################################################
        // USER NODE COLUMN CLASSIFICATION
        // ############################################################
        this.updateUserNodeColumnMapping();

        // ############################################################
        // RESET POSITION OFFSET FOR NEW COLUMN
        // ############################################################
        this.resetPositionOffsetForNewColumn({
            columnOffsetType: "user",
            nodeColumnMapping: this.userNodeColumnMapping,
        });

        // ############################################################
        // USER NODE POSITIONING
        // ############################################################
        this.updateUserNodePosition();
    }
}
