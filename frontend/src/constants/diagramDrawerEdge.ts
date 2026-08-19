import { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import { DialogConfirmStateEnum, DialogFieldStateEnum } from "#root/interfaces/dialog";

export const dialogFieldStateKeys = {
    addDataAttribute: DialogFieldStateEnum.addEdgeDataAttribute,
    addDataCactiAttribute: DialogFieldStateEnum.addEdgeDataCactiAttribute,
    addMarkerEndAttribute: DialogFieldStateEnum.addEdgeMarkerEndAttribute,
    addMarkerStartAttribute: DialogFieldStateEnum.addEdgeMarkerStartAttribute,
    addStyleAttribute: DialogFieldStateEnum.addEdgeStyleAttribute,
};

export const dialogConfirmStateKeys = {
    deleteEdge: DialogConfirmStateEnum.confirmDeleteDrawerEdge,
    closeDrawerEdge: DialogConfirmStateEnum.confirmCloseAttributeDrawerEdge,
};

export const initEdgeAttributes: DiagramElementAttributes = {
    main: [],
    main_advanced: [],
    data: [],
    data_advanced: [],
    style: [],
    style_advanced: [],
    cacti: [],
    markerStart: [],
    markerEnd: [],
};
