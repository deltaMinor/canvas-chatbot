import {
    CanvasType,
    DiagramNode,
    ProjectDiagram,
    SortDirection,
    WarningFilterKey,
    WarningMessage,
    WarningMessageMapping,
    warningFilterKeys,
} from "#root/interfaces/diagram";

import { getDataFlowWarningMessages } from "./diagramContentUtil";

export const getWarningListMapping = ({
    projectDiagram,
    architectureNodes,
}: {
    projectDiagram?: ProjectDiagram | null;
    architectureNodes: DiagramNode[];
}): WarningMessageMapping => {
    if (!projectDiagram) return {} as WarningMessageMapping;

    return (projectDiagram.canvas ?? []).reduce((acc, canvas) => {
        if (canvas.canvas_type === CanvasType.data_flow) {
            acc[canvas.canvas_id] = getDataFlowWarningMessages(
                canvas.ref?.card_ref ?? {},
                canvas.nodes,
                canvas.edges,
                architectureNodes
            );
        }

        return acc;
    }, {} as WarningMessageMapping);
};

export const getWarningListFromMapping = ({
    canvas_id, //
    warningListMapping,
    warningFilterKey,
    warningSortDirection,
}: {
    canvas_id?: string;
    warningListMapping: WarningMessageMapping;
    warningFilterKey: string;
    warningSortDirection: string;
}): WarningMessage[] => {
    if (!canvas_id) return [];

    const specificWarningList = warningListMapping?.[canvas_id] || [];
    let _warningList = [...specificWarningList];

    if (warningFilterKey === WarningFilterKey.show_hidden.toString()) {
        _warningList = _warningList.filter((w) => {
            return !!w?.isHidden;
        });
    }

    _warningList.sort((a, b) => {
        return warningSortDirection === SortDirection.ascending.toString()
            ? a.priority - b.priority
            : b.priority - a.priority;
    });
    return _warningList;
};

export const getNextWarningFlterKey = (
    warningFilterKey: string //
) => {
    const keyIndex = warningFilterKeys?.indexOf(warningFilterKey);
    if (keyIndex === warningFilterKeys?.length - 1) {
        return warningFilterKeys[0] as WarningFilterKey;
    }
    return warningFilterKeys[keyIndex + 1] as WarningFilterKey;
};

export const getNextWarningSortDirection = (
    warningSortDirection: SortDirection //
) => {
    return warningSortDirection === SortDirection.ascending
        ? SortDirection.descending
        : SortDirection.ascending;
};
