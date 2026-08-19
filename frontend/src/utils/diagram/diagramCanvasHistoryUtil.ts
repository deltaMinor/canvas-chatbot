import { MAX_CANVAS_DATA_HISTORY_ITEMS } from "#root/constants/diagram";
import { DiagramCanvas } from "#root/interfaces/diagram";
import { getProjectIdFromStore } from "#root/stores/backendStore";
import {
    setDiagramCanvasHistory,
    setDiagramCanvasHistoryIndex,
} from "#root/stores/projectDiagram/canvasHistory";

import {
    appendToProjectCanvasLocalStorage,
    clearProjectCanvasHistoryLocalStorage,
    getFromProjectCanvasLocalStorage,
} from "../localStorage";

export const updateCanvasHistory = ({
    instanceId,
    canvas_id,
    canvas,
}: {
    instanceId: string;
    canvas_id: string;
    canvas: DiagramCanvas[];
}) => {
    const project_id = getProjectIdFromStore();

    setDiagramCanvasHistory(canvas, instanceId);
    appendToProjectCanvasLocalStorage(
        project_id, //
        canvas_id,
        "history",
        canvas
    );
};

export const updateCanvasHistoryIndex = ({
    instanceId,
    canvas_id,
    index,
}: {
    instanceId: string;
    canvas_id: string;
    index: number;
}) => {
    const project_id = getProjectIdFromStore();

    setDiagramCanvasHistoryIndex(index, instanceId);
    appendToProjectCanvasLocalStorage(
        project_id, //
        canvas_id,
        "historyIndex",
        index
    );
};

export const getCanvasHistory = (
    project_id: string, //
    canvas_id: string
) => {
    const canvas_data_history = getFromProjectCanvasLocalStorage<DiagramCanvas[]>(
        project_id,
        canvas_id,
        "history"
    );
    const canvas_data_history_index = getFromProjectCanvasLocalStorage<number>(
        project_id,
        canvas_id,
        "historyIndex"
    );
    return {
        canvas_data_history: canvas_data_history || [], //
        canvas_data_history_index: canvas_data_history_index ?? 0,
    };
};

export const getCanvasHistoryIndex = (project_id: string, canvas_id: string) => {
    const canvas_data_history_index = getFromProjectCanvasLocalStorage<number>(
        project_id,
        canvas_id,
        "historyIndex"
    );
    return canvas_data_history_index || 0;
};

export const clearProjectCanvasHistory = ({
    instanceId,
    project_id,
}: {
    instanceId: string;
    project_id: string;
}) => {
    setDiagramCanvasHistory([], instanceId);
    setDiagramCanvasHistoryIndex(0, instanceId);
    clearProjectCanvasHistoryLocalStorage(project_id);
};

export const appendCanvasHistory = ({
    instanceId,
    project_id,
    selectedCanvas,
}: {
    instanceId: string;
    project_id: string;
    selectedCanvas: DiagramCanvas;
}) => {
    const {
        canvas_data_history, //
        // canvas_data_history_index,
    } = getCanvasHistory(
        project_id, //
        selectedCanvas.canvas_id
    );
    if (!canvas_data_history) throw new Error("No existing history.");

    const canvas_data_index = getCanvasHistoryIndex(project_id, selectedCanvas.canvas_id);

    // Override history based on latest index if new action is taken
    const diff = canvas_data_history.length - 1 - canvas_data_index;
    const new_canvas_data_history =
        diff > 0
            ? canvas_data_history.slice(0, canvas_data_index + 1)
            : canvas_data_history.slice(MAX_CANVAS_DATA_HISTORY_ITEMS * -1);

    new_canvas_data_history.push(selectedCanvas);
    updateCanvasHistory({
        canvas_id: selectedCanvas.canvas_id,
        canvas: new_canvas_data_history,
        instanceId,
    });
    updateCanvasHistoryIndex({
        canvas_id: selectedCanvas.canvas_id,
        index: new_canvas_data_history?.length - 1,
        instanceId,
    });
};
