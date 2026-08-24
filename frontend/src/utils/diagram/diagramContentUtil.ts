import { defaultPhysicalLocationValues } from "#root/constants/diagramAttributes";
import { ProjectStepStatus } from "#root/constants/stepper";
import {
    CanvasNodeVariantType,
    CardNode,
    DiagramEdge,
    DiagramNode,
    UserStoryCardRef,
    UserStoryCardRefEnum,
    WarningMessage,
    WarningType,
} from "#root/interfaces/diagram";
import { ShortUuidIdentifierKey } from "#root/interfaces/identifier";
import { getLLMGenerationStatusFromApi } from "#root/services/domain/diagram";
import { getNodeToDataMapping } from "#root/utils/diagram/diagramUserStoryDrawerUtil";

import { generateShortUUID } from "../identifierUtil";

const generateWarningMessage = (errorMessage: string, nodeId: string, warningType: WarningType) => {
    return {
        description: errorMessage,
        isHidden: false,
        nodeId: nodeId,
        priority: 9,
        timestamp: new Date(Number(new Date())).toLocaleString(),
        title: errorMessage,
        warningId: generateShortUUID(ShortUuidIdentifierKey.diagramWarning),
        warningType: warningType,
    };
};

const checkMissingDataFlowNode = (
    card_title: string,
    nodes: DiagramNode[],
    nodeOnCanvas: Record<string, DiagramNode[]>,
    warningMessages: WarningMessage[]
) => {
    nodes?.forEach((n) => {
        const { cardRefKey, label } = n.data ?? {};
        if (!n.hidden) {
            if (!cardRefKey) return;
            nodeOnCanvas[cardRefKey]?.push(n);
            return;
        }

        if (cardRefKey === UserStoryCardRefEnum.card_users)
            warningMessages.push(
                generateWarningMessage(
                    `User [${label}] is missing from canvas in user story card [${card_title}].`,
                    n.id,
                    WarningType.dataFlow
                )
            );
        else if (cardRefKey === UserStoryCardRefEnum.card_interface) {
            const deviceNode = nodes.find((node) => node.id === n.parentId);
            if (!!deviceNode?.hidden) return;
            warningMessages.push(
                generateWarningMessage(
                    `Interface [${label}] is missing from the device
                                [${deviceNode?.data?.label}] in user story card [${card_title}].`,
                    n.id,
                    WarningType.dataFlow
                )
            );
        } else if (cardRefKey === UserStoryCardRefEnum.card_devices)
            warningMessages.push(
                generateWarningMessage(
                    `Device [${label}] is missing from canvas in user story card [${card_title}].`,
                    n.id,
                    WarningType.dataFlow
                )
            );
    });
};

const checkEdgeForEachNode = (
    card_title: string,
    edges: DiagramEdge[],
    nodeOnCanvas: Record<string, DiagramNode[]>,
    warningMessages: WarningMessage[]
) => {
    const dataFlowNodeIdSet = new Set<string>(
        Object.values(nodeOnCanvas)
            ?.flat()
            ?.map((n) => n.id)
    );
    const interfaceNodesConnectedToUser = new Set<string>();
    const interfaceNodesConnectedToArchitecture = new Set<string>();
    const userNodeWithEdge = new Set<string>();

    edges?.forEach((edge) => {
        const connectedInterfaceNode = nodeOnCanvas[UserStoryCardRefEnum.card_interface]?.find(
            (n) => n.id === edge.source || n.id === edge.target
        );
        const connectedUserNode = nodeOnCanvas[UserStoryCardRefEnum.card_users]?.find(
            (n) => n.id === edge.source || n.id === edge.target
        );
        const isConnectedToArchitectureNode =
            !dataFlowNodeIdSet.has(edge.source) || !dataFlowNodeIdSet.has(edge.target);

        if (connectedInterfaceNode) {
            if (connectedUserNode) interfaceNodesConnectedToUser.add(connectedInterfaceNode.id);
            if (isConnectedToArchitectureNode)
                interfaceNodesConnectedToArchitecture.add(connectedInterfaceNode.id);
        }

        if (connectedUserNode) {
            userNodeWithEdge.add(connectedUserNode.id);
        }
    });

    nodeOnCanvas[UserStoryCardRefEnum.card_interface]?.forEach((node) => {
        if (
            !interfaceNodesConnectedToUser.has(node.id) ||
            !interfaceNodesConnectedToArchitecture.has(node.id)
        ) {
            const deviceNode = nodeOnCanvas[UserStoryCardRefEnum.card_devices]?.find(
                (n) => n.id === node.parentId
            );
            warningMessages.push(
                generateWarningMessage(
                    `Interface [${node.data["label"]}] in device [${deviceNode?.data?.["label"]}] should be connected to at least one user and architecture node in user story card [${card_title}].`,
                    node.id,
                    WarningType.dataFlow
                )
            );
        }
    });
    nodeOnCanvas[UserStoryCardRefEnum.card_users]?.forEach((node) => {
        if (!userNodeWithEdge.has(node.id)) {
            warningMessages.push(
                generateWarningMessage(
                    `There is no edge connecting to User [${node.data["label"]}] in user story card [${card_title}].`,
                    node.id,
                    WarningType.dataFlow
                )
            );
        }
    });
};

const checkMissingDataItem = (
    card_data: CardNode[],
    architectureNodes: DiagramNode[],
    warningMessages: WarningMessage[]
) => {
    const nodeToDataMapping = getNodeToDataMapping(architectureNodes);
    const data_stored = nodeToDataMapping.flatMap((mapping) => mapping.data_stored);
    card_data?.forEach((data) => {
        if (!data_stored?.includes(data?.value))
            warningMessages.push(
                generateWarningMessage(
                    `Data [${data?.label}] should be stored in at least one node.`,
                    data?.node_id,
                    WarningType.dataFlow
                )
            );
    });
};

const checkMissingPhysicalLocation = (
    deviceNodes: DiagramNode[], //
    clusterNodes: DiagramNode[],
    warningMessages: WarningMessage[]
) => {
    deviceNodes?.forEach((n) => {
        const physicalLocation = n?.data?.physicalLocation ?? "";
        if (defaultPhysicalLocationValues.includes(physicalLocation)) return;
        const clusterNode = clusterNodes?.find((n) => n?.id === physicalLocation);
        if (!clusterNode)
            warningMessages.push(
                generateWarningMessage(
                    `Physical location of device [${n?.data?.label}] is missing.`,
                    n.id,
                    WarningType.dataFlow
                )
            );
    });
};

export const getDataFlowWarningMessages = (
    dataFlowViewCardRef: UserStoryCardRef,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    architectureNodes: DiagramNode[]
) => {
    const warningMessages = [] as WarningMessage[];
    const nodeOnCanvas = {
        [UserStoryCardRefEnum.card_users]: [],
        [UserStoryCardRefEnum.card_interface]: [],
        [UserStoryCardRefEnum.card_devices]: [],
    };

    checkMissingDataFlowNode(
        dataFlowViewCardRef?.card_title ?? "",
        nodes,
        nodeOnCanvas,
        warningMessages
    );
    checkMissingPhysicalLocation(
        nodeOnCanvas[UserStoryCardRefEnum.card_devices],
        architectureNodes?.filter((n) => n?.type === CanvasNodeVariantType.clusterNode),
        warningMessages
    );
    checkMissingDataItem(dataFlowViewCardRef?.card_data ?? [], architectureNodes, warningMessages);
    if (
        nodeOnCanvas[UserStoryCardRefEnum.card_users].length &&
        nodeOnCanvas[UserStoryCardRefEnum.card_interface].length
    )
        checkEdgeForEachNode(
            dataFlowViewCardRef?.card_title ?? "",
            edges,
            nodeOnCanvas,
            warningMessages
        );

    return warningMessages;
};

export const handleInitPolling = async ({
    project_id,
    canvas_id,
    polling_interval,
}: {
    project_id: string;
    canvas_id: string;
    polling_interval: number;
}) => {
    const { promise, stop } = initPolling({
        polling_interval,
        polling_func: async () => {
            const status = await getLLMGenerationStatusFromApi(
                project_id, //
                canvas_id,
                {},
                "data_flow"
            );
            return { ...status };
        },
    });
    void stop;
    return await promise;
};

export const initPolling = ({
    polling_interval,
    polling_func,
}: {
    polling_interval: number;
    snackbarKey?: string;
    polling_func: () => Promise<{
        status: number;
    }>;
}) => {
    let intervalId: NodeJS.Timeout;
    let rejectFn: (reason?: unknown) => void;
    let stopped = false;

    const promise = new Promise<{
        status: number;
    }>((resolve, reject) => {
        rejectFn = reject;
        intervalId = setInterval(async () => {
            if (stopped) return;
            try {
                const { status } = await polling_func();
                if (status === ProjectStepStatus.complete) {
                    clearInterval(intervalId);
                    resolve({
                        status,
                    });
                } else if (status !== ProjectStepStatus.inProgress) {
                    clearInterval(intervalId);
                    reject(new Error("Generation failed."));
                }
            } catch (err) {
                clearInterval(intervalId);
                reject(err);
            }
        }, polling_interval);
    });

    return {
        promise,
        stop: () => {
            stopped = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (rejectFn) {
                rejectFn(new Error("Generation aborted by user."));
            }
        },
    };
};
