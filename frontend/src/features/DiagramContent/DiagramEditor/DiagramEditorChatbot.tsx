import React, { useRef } from "react";

import Chatbot from "#root/features/Chatbot";
import { useDiagramChatbotProps } from "#root/hooks/chatbot/useDiagramChatbotProps";
import { ChatbotHandle } from "#root/interfaces/chatbot";

import TopologyGeneratorDialogConfirm from "./TopologyGeneratorDialogConfirm";

const DiagramEditorChatbotComponent = () => {
    const chatbotRef = useRef<ChatbotHandle>(null);

    const {
        diagramHandleInput,
        diagramOnAbort,
        initialMessages,
        initialSpecialInputs,
        getCommandDisabledCause,
        getPersistedState,
        onReconcile,
        onSave,
        onWaitingChange,
        onDiagramUploadFiles,
        onDiagramDownloadFile,
        onImportTopologyDiagram,
        activeConversationId,
        conversationsPanel,
    } = useDiagramChatbotProps(chatbotRef);

    return (
        <>
            <Chatbot
                key={activeConversationId}
                ref={chatbotRef}
                initialMessages={initialMessages}
                initialSpecialInputs={initialSpecialInputs}
                emptyStateText="Ask me anything about this architecture diagram."
                getCommandDisabledCause={getCommandDisabledCause}
                handleInput={diagramHandleInput}
                onAbort={diagramOnAbort}
                getPersistedState={getPersistedState}
                onReconcile={onReconcile}
                onSave={onSave}
                onWaitingChange={onWaitingChange}
                onUploadFiles={onDiagramUploadFiles}
                onDownloadFile={onDiagramDownloadFile}
                onImportTopologyDiagram={onImportTopologyDiagram}
                conversationsPanel={conversationsPanel}
            />
            <TopologyGeneratorDialogConfirm />
        </>
    );
};

export default React.memo(DiagramEditorChatbotComponent);
