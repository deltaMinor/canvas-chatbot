import { userStoryStringMapping } from "#root/constants/questionnaire";
import { UserStoryCardRefEnum } from "#root/enums/diagram";
import { DiagramNode, UserStoryCardRef } from "#root/interfaces/diagram";

export const defaultUserStoryStatementValues: { [x: string]: string } = {
    user: "user",
    data: "data",
    feature: "feature",
    device: "device",
    interface: "interface",
    intent: "do something to achieve goal or objective",
    outcome: "get the desired outcome or result",
};

export const getStringMapping = (cardRef: UserStoryCardRef) => {
    const stringMapping = { ...userStoryStringMapping };

    if (stringMapping["data"]) stringMapping["data"].rawValue = cardRef?.card_data;
    if (stringMapping["device"]) stringMapping["device"].rawValue = cardRef?.card_devices;
    if (stringMapping["feature"]) stringMapping["feature"].rawValue = cardRef?.card_feature;
    if (stringMapping["intent"]) stringMapping["intent"].rawValue = cardRef?.card_intent;
    if (stringMapping["interface"]) stringMapping["interface"].rawValue = cardRef?.card_interface;
    if (stringMapping["outcome"]) stringMapping["outcome"].rawValue = cardRef?.card_outcome;
    if (stringMapping["user"]) stringMapping["user"].rawValue = cardRef?.card_users;

    return stringMapping;
};

export const getDataFlowNodesByType = (
    selectedCanvasNodes: DiagramNode[],
    type: string
): DiagramNode[] => selectedCanvasNodes.filter((n) => n.data.cardRefKey === type);

export const getParsedDFNodeList = (selectedCanvasNodes: DiagramNode[]) => {
    const users = getDataFlowNodesByType(selectedCanvasNodes, UserStoryCardRefEnum.card_users);
    const devices = getDataFlowNodesByType(selectedCanvasNodes, UserStoryCardRefEnum.card_devices);
    const interfaces = getDataFlowNodesByType(
        selectedCanvasNodes,
        UserStoryCardRefEnum.card_interface
    );

    const dataflow_nodes = {
        [UserStoryCardRefEnum.card_users]: users.map((cur) => ({
            node: cur,
            secondary: [],
        })),
        [UserStoryCardRefEnum.card_devices]: devices.map((cur) => ({
            node: cur,
            secondary: interfaces.filter(
                (i) => cur.data.cardFieldOptionId === i.data.cardFieldOptionIdAssoc
            ),
        })),
    };

    return dataflow_nodes;
};
