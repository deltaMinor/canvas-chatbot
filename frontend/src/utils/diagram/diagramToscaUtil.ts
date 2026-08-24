import { CanvasNodeType, UserStoryCardRefEnum } from "#root/enums/diagram";
import { DiagramNode } from "#root/interfaces/diagram";
import { ToscaMapping } from "#root/interfaces/tosca";

export const getToscaType = ({
    toscaMapping,
    node,
}: {
    toscaMapping: ToscaMapping;
    node: DiagramNode;
}) => {
    if (
        node?.data?.type === CanvasNodeType.data_flow.toString() &&
        node?.data?.cardRefKey === UserStoryCardRefEnum.card_interface.toString()
    ) {
        return "arcs.nodes.Interface";
    }
    if (
        node?.data?.type === CanvasNodeType.data_flow.toString() &&
        node?.data?.cardRefKey === UserStoryCardRefEnum.card_users.toString()
    ) {
        return "arcs.nodes.User";
    }
    if (
        node?.data?.type === CanvasNodeType.data_flow.toString() &&
        node?.data?.cardRefKey === UserStoryCardRefEnum.card_devices.toString()
    ) {
        return "arcs.nodes.Compute";
    }

    const icon_key = node?.data?.icon || "";
    const tosca_type = toscaMapping?.[icon_key];
    return tosca_type || "";
};

export const updateNodeToscaType = ({
    node, //
    toscaMapping,
}: {
    node: DiagramNode;
    toscaMapping: ToscaMapping;
}) => {
    const tosca_type = getToscaType({ node, toscaMapping });
    node.data["tosca_type"] = tosca_type;
};
