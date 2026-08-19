import { ChatbotState } from "#root/enums/diagram-chatbot";
import { HandleInputFnOutput } from "#root/interfaces/chatbot";
import { getDiagramDraftCanvasViewOnlyFromStore } from "#root/stores/projectDiagramFeatureStore";
import { stringsToHandleInputFnOutput } from "#root/utils/chatbot/formatOutput";

export const guardCanvasUnlocked = (
    instanceId: string,
    actionLabel: string
): [HandleInputFnOutput, ChatbotState] | null => {
    if (!getDiagramDraftCanvasViewOnlyFromStore(instanceId)) return null;
    return [
        stringsToHandleInputFnOutput(`Unable to ${actionLabel} as canvas is currently locked.`),
        ChatbotState.Neutral,
    ];
};
