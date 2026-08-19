import { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import { DialogConfirmStateEnum, DialogFieldStateEnum } from "#root/interfaces/dialog";

export const dialogFieldStateKeys = {
    addDataAttribute: DialogFieldStateEnum.addNodeDataAttribute,
    addDataCactiAttribute: DialogFieldStateEnum.addNodeDataCactiAttribute,
    addStyleAttribute: DialogFieldStateEnum.addNodeStyleAttribute,
};

export const dialogConfirmStateKeys = {
    deleteNode: DialogConfirmStateEnum.confirmDeleteDrawerNode,
    requestToFillRequiredFields: DialogConfirmStateEnum.requestToFillRequiredFields,
    closeDrawerNode: DialogConfirmStateEnum.confirmCloseAttributeDrawerNode,
};

export const initNodeAttributes: DiagramElementAttributes = {
    main: [],
    main_advanced: [],
    data: [],
    data_advanced: [],
    style: [],
    style_advanced: [],
    cacti: [],
};
