import { DiagramNode } from "#root/interfaces/diagram";
import { ToscaMapping } from "#root/interfaces/tosca";

export const getToscaType = ({
    toscaMapping,
    node,
}: {
    toscaMapping: ToscaMapping;
    node: DiagramNode;
}) => {
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
