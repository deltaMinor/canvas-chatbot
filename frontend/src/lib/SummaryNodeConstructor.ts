import {
    DEFAULT_ICON_NODE_HEIGHT,
    DEFAULT_ICON_NODE_WIDTH,
    SUMMARY_INTERFACE_NODE_HEIGHT,
} from "#root/constants/diagram";
import {
    CanvasNodeType,
    CanvasType,
    DiagramNode,
    ProjectDiagram,
    UserStoryCardRefEnum,
} from "#root/interfaces/diagram";
import { UuidIdentifierKey } from "#root/interfaces/identifier";
import { UserStoryCardIconMapping } from "#root/interfaces/userstoryDrawer";
import { getInterfaceNodeId } from "#root/utils/diagram/diagramNodeUtil";
import { generateUUID } from "#root/utils/identifierUtil";

import { SummaryCanvasBoundaryResolver } from "./SummaryCanvasBoundaryResolver";
import { SummaryNodePositionOffsetInitializer } from "./SummaryNodePositionOffsetInitializer";
import { SummaryNodePositionResolver } from "./SummaryNodePositionResolver";

const getStableSummaryDeviceNodeId = ({
    originalNodeId,
    cardFieldOptionId,
}: {
    originalNodeId?: string;
    cardFieldOptionId?: string;
}) => {
    return `summary_device__${originalNodeId || cardFieldOptionId || "unknown"}`;
};

const getStableSummaryUserNodeId = ({
    originalNodeId,
    cardFieldOptionId,
}: {
    originalNodeId?: string;
    cardFieldOptionId?: string;
}) => {
    return `summary_user__${originalNodeId || cardFieldOptionId || "unknown"}`;
};

export class SummaryNodeConstructor {
    projectDiagram: ProjectDiagram;
    diagramNodes__dataflow: DiagramNode[];
    cardDeviceNodes: DiagramNode[];
    cardInterfaceNodes: DiagramNode[];
    cardUserNodes: DiagramNode[];

    constructor({
        projectDiagram, //
    }: {
        projectDiagram: ProjectDiagram;
    }) {
        this.projectDiagram = projectDiagram;
        //
        this.diagramNodes__dataflow = projectDiagram.canvas
            .filter((c) => {
                return c?.canvas_type === CanvasType.data_flow.toString();
            })
            .flatMap((c) => c?.nodes);

        if (!this.diagramNodes__dataflow.length) {
            this.diagramNodes__dataflow = this.buildFallbackDataFlowNodes();
        }

        this.cardDeviceNodes =
            this.diagramNodes__dataflow.filter((n) => {
                return (
                    n?.data?.cardRefKey === UserStoryCardRefEnum.card_devices.toString() &&
                    !n?.hidden
                );
            }) || [];
        this.cardInterfaceNodes = this.diagramNodes__dataflow.filter((n) => {
            return (
                n?.data?.cardRefKey === UserStoryCardRefEnum.card_interface.toString() && !n?.hidden
            );
        });
        this.cardUserNodes = this.diagramNodes__dataflow.filter((n) => {
            return n?.data?.cardRefKey === UserStoryCardRefEnum.card_users.toString() && !n?.hidden;
        });
    }

    private buildFallbackDataFlowNodes() {
        const cardNodes = this.projectDiagram?.card_nodes ?? [];
        const deviceCards = cardNodes.filter(
            (node) => node.ref_key === UserStoryCardRefEnum.card_devices
        );
        const interfaceCards = cardNodes.filter(
            (node) => node.ref_key === UserStoryCardRefEnum.card_interface
        );
        const userCards = cardNodes.filter(
            (node) => node.ref_key === UserStoryCardRefEnum.card_users
        );

        const deviceGroupMap = new Map<string, (typeof deviceCards)[number][]>();
        const getGroupKey = (affiliations?: string[]) =>
            (affiliations ?? []).slice().sort().join("|");

        deviceCards.forEach((device) => {
            const groupKey = getGroupKey(device.card_id_affliations);
            const group = deviceGroupMap.get(groupKey) ?? [];
            group.push(device);
            deviceGroupMap.set(groupKey, group);
        });

        const makeBaseNode = ({
            id,
            label,
            icon,
            cardRefKey,
            cardFieldOptionId,
            cardFieldOptionIdAssoc,
        }: {
            id: string;
            label: string;
            icon: string;
            cardRefKey: string;
            cardFieldOptionId?: string;
            cardFieldOptionIdAssoc?: string;
        }): DiagramNode => {
            const data: DiagramNode["data"] = {
                cardRefKey,
                icon,
                label,
                type: CanvasNodeType.data_flow.toString(),
            };

            if (cardFieldOptionId) {
                data.cardFieldOptionId = cardFieldOptionId;
            }

            if (cardFieldOptionIdAssoc) {
                data.cardFieldOptionIdAssoc = cardFieldOptionIdAssoc;
            }

            return {
                id,
                type: "infoNode",
                data,
                position: { x: 0, y: 0 },
                style: {
                    width: DEFAULT_ICON_NODE_WIDTH,
                    height: DEFAULT_ICON_NODE_HEIGHT,
                },
                width: DEFAULT_ICON_NODE_WIDTH,
                height: DEFAULT_ICON_NODE_HEIGHT,
                hidden: false,
                draggable: false,
                selectable: false,
            };
        };

        const devices = deviceCards.map((device) =>
            makeBaseNode({
                id: device.node_id || generateUUID(UuidIdentifierKey.diagramNode),
                label: String(device.label ?? ""),
                icon: String(UserStoryCardIconMapping[UserStoryCardRefEnum.card_devices]),
                cardRefKey: UserStoryCardRefEnum.card_devices.toString(),
                cardFieldOptionId: device.value,
            })
        );

        const interfaces = interfaceCards.map((iface) => {
            const groupKey = getGroupKey(iface.card_id_affliations);
            const matchedDevice = deviceGroupMap.get(groupKey)?.[0];
            const interfaceNodeArgs: Parameters<typeof makeBaseNode>[0] = {
                id: iface.node_id || generateUUID(UuidIdentifierKey.diagramNode),
                label: String(iface.label ?? ""),
                icon: String(UserStoryCardIconMapping[UserStoryCardRefEnum.card_interface]),
                cardRefKey: UserStoryCardRefEnum.card_interface.toString(),
                cardFieldOptionId: iface.value,
            };

            if (matchedDevice?.value) {
                interfaceNodeArgs.cardFieldOptionIdAssoc = matchedDevice.value;
            }

            return makeBaseNode(interfaceNodeArgs);
        });

        const users = userCards.map((user) =>
            makeBaseNode({
                id: user.node_id || generateUUID(UuidIdentifierKey.diagramNode),
                label: String(user.label ?? ""),
                icon: String(UserStoryCardIconMapping[UserStoryCardRefEnum.card_users]),
                cardRefKey: UserStoryCardRefEnum.card_users.toString(),
                cardFieldOptionId: user.value,
            })
        );

        return [...devices, ...interfaces, ...users];
    }
    getUniqueCardDeviceNodes() {
        const uniqueCardDeviceNodes = [] as DiagramNode[];
        this.cardDeviceNodes.forEach((deviceNode) => {
            const cardFieldOptionId = deviceNode?.data?.cardFieldOptionId || "";
            if (
                !cardFieldOptionId ||
                !!uniqueCardDeviceNodes
                    ?.map((n) => n?.data?.cardFieldOptionId)
                    ?.includes(cardFieldOptionId)
            ) {
                return;
            }
            uniqueCardDeviceNodes.push({
                ...deviceNode, //
                id: getStableSummaryDeviceNodeId({
                    originalNodeId: deviceNode.id,
                    cardFieldOptionId,
                }),
                data: {
                    ...(deviceNode.data || {}),
                    isSummaryContainer: true,
                    originalNodeId: deviceNode.id,
                    originalParentId: deviceNode.parentId || "",
                },
            });
        });
        return { uniqueCardDeviceNodes };
    }

    getUniqueCardInterfaceNodes({
        uniqueCardDeviceNodes,
    }: {
        uniqueCardDeviceNodes: DiagramNode[];
    }) {
        const uniqueCardInterfaceNodesPerDeviceMapping = {} as {
            [key: string]: DiagramNode[];
        };
        const uniqueCardInterfaceNodes = [] as DiagramNode[];
        uniqueCardDeviceNodes.forEach((deviceNode) => {
            const uniqueCardInterfaceNodesPerDevice = [] as DiagramNode[];
            this.cardInterfaceNodes.forEach((interfaceNode) => {
                const cardFieldOptionId = interfaceNode?.data?.cardFieldOptionId || "";
                const cardFieldOptionIdAssoc = interfaceNode?.data?.cardFieldOptionIdAssoc || "";
                if (
                    !cardFieldOptionId ||
                    !cardFieldOptionIdAssoc ||
                    !!uniqueCardInterfaceNodesPerDevice
                        ?.map((n) => n?.data?.cardFieldOptionId)
                        ?.includes(cardFieldOptionId) ||
                    cardFieldOptionIdAssoc != deviceNode?.data?.cardFieldOptionId
                ) {
                    return;
                }
                uniqueCardInterfaceNodesPerDevice.push({
                    ...interfaceNode,
                    style: {
                        ...(interfaceNode.style || {}),
                    },
                    position: {
                        ...(interfaceNode.position || { x: 0, y: 0 }),
                    },
                    data: interfaceNode.data
                        ? {
                              ...interfaceNode.data,
                              originalNodeId: interfaceNode.id,
                              originalParentId: interfaceNode.parentId || "",
                          }
                        : interfaceNode.data,
                    id: getInterfaceNodeId(
                        deviceNode.id,
                        cardFieldOptionId || interfaceNode.id || "unknown"
                    ),
                });
            });

            uniqueCardInterfaceNodesPerDevice.forEach((n) => {
                n.style = n.style || {};

                n.width = DEFAULT_ICON_NODE_WIDTH;
                n.style["width"] = DEFAULT_ICON_NODE_WIDTH;

                n.height = SUMMARY_INTERFACE_NODE_HEIGHT;
                n.style["height"] = SUMMARY_INTERFACE_NODE_HEIGHT;
                n.position = {
                    x: 0, //
                    y: 0,
                };
                n.parentId = deviceNode.id;
            });

            uniqueCardInterfaceNodesPerDeviceMapping[deviceNode.id] =
                uniqueCardInterfaceNodesPerDevice;
            uniqueCardInterfaceNodes.push(...uniqueCardInterfaceNodesPerDevice);
        });

        return {
            uniqueCardInterfaceNodesPerDeviceMapping,
            uniqueCardInterfaceNodes,
        };
    }

    getUniqueCardUserNodes() {
        const uniqueCardUserNodes = [] as DiagramNode[];
        this.cardUserNodes.forEach((n) => {
            const cardFieldOptionId = n?.data?.cardFieldOptionId || "";
            if (
                !cardFieldOptionId ||
                !!uniqueCardUserNodes
                    ?.map((n) => n?.data?.cardFieldOptionId)
                    ?.includes(cardFieldOptionId)
            ) {
                return;
            }
            uniqueCardUserNodes.push({
                ...n, //
                id: getStableSummaryUserNodeId({
                    originalNodeId: n.id,
                    cardFieldOptionId,
                }),
                data: {
                    ...(n.data || {}),
                    originalNodeId: n.id,
                    originalParentId: n.parentId || "",
                },
            });
        });
        return { uniqueCardUserNodes };
    }

    getUniqueCardNodes() {
        // ############################################################
        // UNIQUE DEVICE NODES
        // ############################################################
        const { uniqueCardDeviceNodes } = this.getUniqueCardDeviceNodes();

        // ############################################################
        // UNIQUE INTERFACE NODES
        // ############################################################
        const { uniqueCardInterfaceNodesPerDeviceMapping, uniqueCardInterfaceNodes } =
            this.getUniqueCardInterfaceNodes({ uniqueCardDeviceNodes });

        // ############################################################
        // UNIQUE USER NODES
        // ############################################################
        const { uniqueCardUserNodes } = this.getUniqueCardUserNodes();

        return {
            uniqueCardDeviceNodes,
            uniqueCardInterfaceNodesPerDeviceMapping,
            uniqueCardInterfaceNodes,
            uniqueCardUserNodes,
        };
    }

    getUniqueDataFlowNodes() {
        // ############################################################
        // RESOLVE ARCHITECTURE NODES BOUNDARY
        // ############################################################
        const boundaryResolver = new SummaryCanvasBoundaryResolver({
            projectDiagram: this.projectDiagram,
        });
        const { extremePositions, extremeTopY, extremeBottomY, extremeLeftX, extremeRightX } =
            boundaryResolver.getExtremePositions();

        // ############################################################
        // INIT POSITION OFFSET
        // ############################################################
        const positionOffsetInitializer = new SummaryNodePositionOffsetInitializer({
            extremeBottomY,
            extremeLeftX, //
            extremeRightX,
            extremeTopY,
        });
        const positionOffset = positionOffsetInitializer.getInitPositionOffset();

        // ############################################################
        // UNIQUE CARD NODES
        // ############################################################
        const {
            uniqueCardDeviceNodes,
            uniqueCardInterfaceNodesPerDeviceMapping,
            uniqueCardInterfaceNodes,
            uniqueCardUserNodes,
        } = this.getUniqueCardNodes();

        // ############################################################
        // DEVICE NODE COLUMN CLASSIFICATION
        // ############################################################
        const positionResolver = new SummaryNodePositionResolver({
            projectDiagram: this.projectDiagram, //
            uniqueCardDeviceNodes,
            uniqueCardInterfaceNodes,
            uniqueCardUserNodes,
            uniqueCardInterfaceNodesPerDeviceMapping,
            positionOffset,
            extremePositions,
        });
        positionResolver.updatePosition();

        return {
            nodes: [
                ...positionResolver.uniqueCardUserNodes,
                ...positionResolver.uniqueCardDeviceNodes,
                ...positionResolver.uniqueCardInterfaceNodes,
            ],
            nodeColumnMapping: {
                ...positionResolver.deviceNodeColumnMapping,
                ...positionResolver.interfaceNodeColumnMapping,
                ...positionResolver.userNodeColumnMapping,
            },
            positionOffset,
        };
    }
}
