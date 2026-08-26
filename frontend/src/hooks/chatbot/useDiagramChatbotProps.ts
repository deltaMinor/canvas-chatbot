import React, { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { useReactFlow } from "@xyflow/react";

import { MSG_ABORTED } from "#root/constants/chatbot";
import { INPUT_HELP, MSG_INTENTRX_ABORTED } from "#root/constants/diagramChatbot";
import { useDiagramInstanceId } from "#root/contexts/DiagramInstanceContext";
import { ChatbotState } from "#root/enums/diagram-chatbot";
import { DialogConfirmStateEnum } from "#root/enums/dialog";
import { processConfirmClearDiagram } from "#root/features/DiagramContent/DiagramBody/DiagramHeader/dialogs/helper";
import { useDraggableEdgeActions, useHandleSetProcessedNodesAndEdges } from "#root/hooks/diagram";
import {
    AbortInputFn,
    ChatBubbleProps,
    ChatFileAttachment,
    ChatMessage,
    ChatbotHandle,
    ConversationListItem,
    ConversationsPanelProps,
    HandleInputFn,
    HandleInputFnOutput,
    PersistedChatState,
    ProgressReporter,
    ReconcileResult,
    SpecialInput,
} from "#root/interfaces/chatbot";
import { DiagramEdge, DiagramNode } from "#root/interfaces/diagram";
import CallApiWithTransition from "#root/services/CallApiWithTransition";
import {
    createConversation,
    deleteConversation,
    downloadChatFile,
    fetchChatData,
    renameConversation,
    updateChatHistory,
    uploadChatFiles,
} from "#root/services/domain/chatbot";
import {
    checkIntentRXStatus,
    pollIntentRXProgress,
    stopIntentRX,
} from "#root/services/domain/intentrx";
import { handleOpenDialogConfirm } from "#root/stores/dialogStore";
import {
    getBackendProjectIdFromStore,
    getChatHistoryFromStore,
    getChatPendingFromStore,
    getChatSpecialInputsFromStore,
    getChatStateFromStore,
    getConversationsFromStore,
    getDiagramBackendSaveEnabledFromStore,
    removeConversationFromStore,
    setChatHistoryInStore,
    setChatPendingInStore,
    setChatSpecialInputsInStore,
    setChatStateInStore,
    setConversationNameInStore,
    upsertConversationInStore,
} from "#root/stores/projectDiagramFeatureStore";
import { runWithHeavyExecutionGuard } from "#root/utils/animationFrameUtil";
import { setActiveConversationId } from "#root/utils/chatbot/activeConversation";
import { stringsToHandleInputFnOutput } from "#root/utils/chatbot/formatOutput";
import {
    handleConfirmClearAllState,
    handleConfirmClearChatState,
    handleConfirmClearDiagramState,
    handleConfirmClearRunsState,
    handleIntentRXState,
    handleLlmTopologySetupUpload,
    handleLlmTopologySetupUploadedPdf,
    handleNeutralState,
    handleTopologySetup,
    handleTopologySetupContinue,
} from "#root/utils/diagramChatbot/commands";
import { resolveInitialConversationId } from "#root/utils/diagramChatbot/conversation";
import {
    INTENTRX_PROGRESS_POLL_MS,
    IntentRXContext,
    getIntentRXSessionId,
    isIntentRXState,
} from "#root/utils/diagramChatbot/intentRXSession";
import { importDiagramFromFile } from "#root/utils/diagramChatbot/topologyDiagramImport";
import { setPendingTopologyDiagramAddress } from "#root/utils/diagramChatbot/topologyDiagramPendingStore";
import { resetTopologyFileTrackingState } from "#root/utils/diagramChatbot/topologyFileTracking";

export const useDiagramChatbotProps = (chatbotRef: RefObject<ChatbotHandle | null>) => {
    const instanceId = useDiagramInstanceId();
    useReactFlow<DiagramNode, DiagramEdge>();
    const { resetOverlappingLineSegments } = useDraggableEdgeActions();
    const handleSetProcessedNodesAndEdges = useHandleSetProcessedNodesAndEdges();

    const ownProjectIdRef = useRef(getBackendProjectIdFromStore() ?? "");

    const [activeConversationId, setActiveConversationIdState] = useState<string>(() =>
        resolveInitialConversationId(ownProjectIdRef.current)
    );
    const [conversationsVersion, setConversationsVersion] = useState(0);
    const [isConversationActionPending, setIsConversationActionPending] = useState(false);

    const chatbotStatesRef = useRef<Record<string, ChatbotState>>({});

    const requestGenerationRef = useRef<Record<string, number>>({});

    const getChatbotState = useCallback((conversationId: string): ChatbotState => {
        if (!conversationId) return ChatbotState.Neutral;
        const existing = chatbotStatesRef.current[conversationId];
        if (existing !== undefined) return existing;
        const seeded = getChatStateFromStore(conversationId);
        chatbotStatesRef.current[conversationId] = seeded;
        return seeded;
    }, []);

    const setChatbotStateFor = useCallback((conversationId: string, next: ChatbotState) => {
        if (!conversationId) return;
        chatbotStatesRef.current[conversationId] = next;
    }, []);

    useEffect(() => {
        if (activeConversationId) return;
        const projectId = ownProjectIdRef.current;
        if (!projectId) return;

        let cancelled = false;
        void (async () => {
            try {
                const created = await createConversation(projectId);
                if (cancelled || !created) return;
                upsertConversationInStore({
                    conversation_id: created.conversation_id,
                    conversation_name: created.conversation_name ?? "",
                    created_at: created.created_at,
                    chat_history: created.chat_history ?? [],
                    chat_state: created.chat_state ?? 0,
                    chat_pending: created.chat_pending ?? false,
                    chat_special_inputs: created.chat_special_inputs ?? [],
                });
                setActiveConversationId(projectId, created.conversation_id);
                setActiveConversationIdState(created.conversation_id);
                setConversationsVersion((v) => v + 1);
            } catch {
                // Errors are surfaced as snackbars by the domain layer.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [activeConversationId]);

    const initialMessages: ChatMessage[] = [
        {
            text: "Welcome to Threat Mirror.\nEnter /help for list of available commands.",
        },
    ];

    const initialSpecialInputs: SpecialInput[] = [INPUT_HELP];

    const performClearDiagram = React.useCallback(async () => {
        await runWithHeavyExecutionGuard(async () => {
            await CallApiWithTransition({
                async_func: async () => {
                    await processConfirmClearDiagram({
                        instanceId,
                        handleSetProcessedNodesAndEdges,
                        resetOverlappingLineSegments,
                    });
                },
                eyebrowText: "Diagram Workspace",
                titleText: "Clearing diagram",
                descriptionText:
                    "Removing the current canvas nodes and edges, updating diagram state, and saving the change.",
            });
        });
    }, [handleSetProcessedNodesAndEdges, instanceId, resetOverlappingLineSegments]);

    const performImportDiagramFromFile = React.useCallback(
        async (file: File): Promise<string> =>
            importDiagramFromFile({ instanceId, handleSetProcessedNodesAndEdges, file }),
        [handleSetProcessedNodesAndEdges, instanceId]
    );

    const handleImportTopologyDiagram = React.useCallback((address: string) => {
        setPendingTopologyDiagramAddress(address);
        handleOpenDialogConfirm(DialogConfirmStateEnum.confirmGenerateDiagramFromTopologyGenerator);
    }, []);

    const setChatbotState = (next: ChatbotState) => {
        setChatbotStateFor(activeConversationId, next);
        if (getBackendProjectIdFromStore() === ownProjectIdRef.current && activeConversationId) {
            setChatStateInStore(activeConversationId, next);
        }
    };

    const diagramHandleInput: HandleInputFn = useCallback(
        async (input: ChatMessage, onProgress: ProgressReporter): Promise<HandleInputFnOutput> => {
            let resultOutput: HandleInputFnOutput;
            let resultState: ChatbotState;
            const conversationId = activeConversationId;
            const myGeneration = (requestGenerationRef.current[conversationId] ?? 0) + 1;
            requestGenerationRef.current[conversationId] = myGeneration;

            const intentContext: IntentRXContext = {
                sessionId: getIntentRXSessionId(ownProjectIdRef.current, activeConversationId),
                projectId: ownProjectIdRef.current,
                conversationId: activeConversationId,
                instanceId,
                onProgress,
                performImportDiagramFromFile,
            };

            const currentState = getChatbotState(activeConversationId);
            switch (currentState) {
                case ChatbotState.Neutral:
                    [resultOutput, resultState] = await handleNeutralState(input, intentContext);
                    break;
                case ChatbotState.ConfirmClearChat:
                    [resultOutput, resultState] = handleConfirmClearChatState(input, chatbotRef);
                    break;
                case ChatbotState.ConfirmClearDiagram:
                    [resultOutput, resultState] = await handleConfirmClearDiagramState(
                        input,
                        performClearDiagram
                    );
                    break;
                case ChatbotState.ConfirmClearRuns:
                    [resultOutput, resultState] = await handleConfirmClearRunsState(
                        input,
                        intentContext
                    );
                    break;
                case ChatbotState.ConfirmClearAll:
                    [resultOutput, resultState] = await handleConfirmClearAllState(
                        input,
                        chatbotRef,
                        intentContext,
                        performClearDiagram
                    );
                    break;
                case ChatbotState.LlmOnto:
                case ChatbotState.LlmIntent:
                case ChatbotState.LlmTopology:
                    [resultOutput, resultState] = await handleIntentRXState(
                        input,
                        currentState,
                        intentContext
                    );
                    break;
                case ChatbotState.LlmTopologySetup:
                    [resultOutput, resultState] = await handleTopologySetup(input, intentContext);
                    break;
                case ChatbotState.LlmTopologySetupContinue:
                    [resultOutput, resultState] = await handleTopologySetupContinue(
                        input,
                        intentContext
                    );
                    break;
                case ChatbotState.LlmTopologySetupUploadedPdf:
                    [resultOutput, resultState] = await handleLlmTopologySetupUploadedPdf(
                        input,
                        intentContext
                    );
                    break;
                case ChatbotState.LlmTopologySetupUpload:
                    [resultOutput, resultState] = await handleLlmTopologySetupUpload(
                        input,
                        intentContext
                    );
                    break;
                default:
                    resultOutput = stringsToHandleInputFnOutput("Error when parsing input.");
                    resultState = ChatbotState.Neutral;
                    break;
            }

            if (requestGenerationRef.current[conversationId] === myGeneration) {
                setChatbotState(resultState);
            }
            return resultOutput;
        },
        [chatbotRef, instanceId, activeConversationId, getChatbotState]
    );

    const diagramOnAbort: AbortInputFn = useCallback((): string => {
        const projectId = ownProjectIdRef.current;
        const conversationId = activeConversationId;
        const currentState = getChatbotState(conversationId);

        if (!isIntentRXState(currentState)) {
            return MSG_ABORTED;
        }

        requestGenerationRef.current[conversationId] =
            (requestGenerationRef.current[conversationId] ?? 0) + 1;

        const sessionId = getIntentRXSessionId(projectId, conversationId);
        void stopIntentRX(sessionId);
        resetTopologyFileTrackingState(sessionId);

        setChatbotStateFor(conversationId, ChatbotState.Neutral);
        if (getBackendProjectIdFromStore() === projectId && conversationId) {
            setChatStateInStore(conversationId, ChatbotState.Neutral);
        }

        return MSG_INTENTRX_ABORTED;
    }, [instanceId, activeConversationId, getChatbotState, setChatbotStateFor]);

    const getPersistedState = useCallback((): PersistedChatState => {
        return {
            messages: getChatHistoryFromStore(activeConversationId),
            isWaiting: getChatPendingFromStore(activeConversationId),
            specialInputs: getChatSpecialInputsFromStore(activeConversationId),
        };
    }, [activeConversationId]);

    const onWaitingChange = useCallback(
        async (waiting: boolean, messages: ChatBubbleProps[], specialInputs?: SpecialInput[]) => {
            const projectId = ownProjectIdRef.current;
            const conversationId = activeConversationId;
            if (!conversationId) return;

            if (getBackendProjectIdFromStore() === projectId) {
                setChatHistoryInStore(conversationId, messages);
                setChatStateInStore(conversationId, getChatbotState(conversationId));
                setChatPendingInStore(conversationId, waiting);
                setChatSpecialInputsInStore(conversationId, specialInputs ?? []);
                setConversationsVersion((v) => v + 1);
            }

            if (!getDiagramBackendSaveEnabledFromStore(instanceId) || !projectId) return;

            try {
                await updateChatHistory({
                    project_id: projectId,
                    conversation_id: conversationId,
                    chat_history: messages,
                    chat_state: getChatbotState(conversationId),
                    chat_pending: waiting,
                    chat_special_inputs: specialInputs ?? [],
                });
            } catch {
                // Errors are surfaced as snackbars by the domain layer.
            }
        },
        [instanceId, activeConversationId, getChatbotState]
    );

    const onReconcile = useCallback(
        async (onProgress: ProgressReporter): Promise<ReconcileResult> => {
            const projectId = ownProjectIdRef.current;
            const conversationId = activeConversationId;

            const sessionId = getIntentRXSessionId(projectId, conversationId);
            const conversationState = getChatbotState(conversationId);
            if (!isIntentRXState(conversationState)) {
                setChatbotStateFor(conversationId, ChatbotState.Neutral);
                if (getBackendProjectIdFromStore() === projectId && conversationId)
                    setChatStateInStore(conversationId, ChatbotState.Neutral);
                return {
                    appendMessages: [{ text: "The previous response was interrupted." }],
                    isWaiting: false,
                };
            }

            const knownIds = new Set(
                getChatHistoryFromStore(conversationId).map((message) => message.id)
            );

            while (true) {
                const { running, busy } = await checkIntentRXStatus(sessionId);
                if (!busy) {
                    resetTopologyFileTrackingState(sessionId);

                    const recovered =
                        projectId && conversationId
                            ? await fetchChatData(projectId, conversationId)
                            : null;
                    const newMessages = (recovered?.chat_history ?? []).filter(
                        (message) => !knownIds.has(message.id)
                    );

                    const nextChatbotState = running
                        ? getChatbotState(conversationId)
                        : ChatbotState.Neutral;
                    setChatbotStateFor(conversationId, nextChatbotState);
                    if (getBackendProjectIdFromStore() === projectId && conversationId) {
                        if (newMessages.length > 0) {
                            setChatHistoryInStore(conversationId, recovered!.chat_history);
                            setConversationsVersion((v) => v + 1);
                        }
                        setChatStateInStore(conversationId, nextChatbotState);
                        setChatPendingInStore(conversationId, false);
                    }

                    if (newMessages.length > 0) {
                        return {
                            appendMessages: newMessages.map((message) => ({
                                text: message.text,
                                ...(message.topology_diagram_address !== undefined && {
                                    topology_diagram_address: message.topology_diagram_address,
                                }),
                            })),
                            isWaiting: false,
                        };
                    }

                    if (!running) {
                        return {
                            appendMessages: [{ text: "IntentRX session ended unexpectedly." }],
                            isWaiting: false,
                        };
                    }
                    return {
                        appendMessages: [
                            {
                                text:
                                    "Reconnected to the IntentRX session. The response to your last " +
                                    "message was interrupted, but you can continue the conversation below.",
                            },
                        ],
                        isWaiting: false,
                    };
                }
                onProgress((await pollIntentRXProgress(sessionId)) || "Waiting for IntentRX…");
                await new Promise((resolve) => setTimeout(resolve, INTENTRX_PROGRESS_POLL_MS));
            }
        },
        [instanceId, activeConversationId, getChatbotState, setChatbotStateFor]
    );

    // Debounced save for routine message-only mutations that fall outside
    // the immediate start/stop brackets above (e.g. `/clear chat`).
    const onDiagramSave = useCallback(
        async (messages: ChatBubbleProps[]) => {
            const projectId = ownProjectIdRef.current;
            const conversationId = activeConversationId;
            if (!conversationId) return;

            if (getBackendProjectIdFromStore() === projectId) {
                setChatHistoryInStore(conversationId, messages);
                setChatStateInStore(conversationId, getChatbotState(conversationId));
                setConversationsVersion((v) => v + 1);
            }

            if (!getDiagramBackendSaveEnabledFromStore(instanceId) || !projectId) return;

            try {
                await updateChatHistory({
                    project_id: projectId,
                    conversation_id: conversationId,
                    chat_history: messages,
                    chat_state: getChatbotState(conversationId),
                    chat_pending: getChatPendingFromStore(conversationId),
                    chat_special_inputs: getChatSpecialInputsFromStore(conversationId),
                });
            } catch {
                // Errors are surfaced as snackbars by the domain layer.
            }
        },
        [instanceId, activeConversationId, getChatbotState]
    );

    const onDiagramUploadFiles = useCallback(
        async (files: File[]): Promise<ChatFileAttachment[]> => {
            const projectId = ownProjectIdRef.current;
            if (!projectId) return [];
            try {
                return await uploadChatFiles(projectId, files);
            } catch {
                // Errors are surfaced as snackbars by the domain layer.
                return [];
            }
        },
        []
    );

    const onDiagramDownloadFile = useCallback((fileId: string, fileName: string) => {
        const projectId = ownProjectIdRef.current;
        if (!projectId) return;
        void downloadChatFile(projectId, fileId).catch(() => {
            // Errors are surfaced as snackbars by the domain layer.
        });
        void fileName;
    }, []);

    const getCommandDisabledCause = (): string => {
        switch (getChatbotState(activeConversationId)) {
            case ChatbotState.LlmOnto:
                return "Please wait for the current OntoPilot process to finish.";
            case ChatbotState.LlmIntent:
                return "Please wait for the current IntentRX process to finish.";
            case ChatbotState.LlmTopology:
                return "Please wait for the current TopologyGenerator process to finish.";
            default:
                return "Please wait for the current response to finish.";
        }
    };

    const handleSelectConversation = useCallback(
        (conversationId: string) => {
            const projectId = ownProjectIdRef.current;
            if (conversationId === activeConversationId) return;
            setActiveConversationId(projectId, conversationId);
            setActiveConversationIdState(conversationId);
        },
        [activeConversationId]
    );

    const handleCreateConversation = useCallback(async () => {
        const projectId = ownProjectIdRef.current;
        if (!projectId || isConversationActionPending) return;
        setIsConversationActionPending(true);
        try {
            const created = await createConversation(projectId);
            if (!created) return;
            upsertConversationInStore({
                conversation_id: created.conversation_id,
                conversation_name: created.conversation_name ?? "",
                created_at: created.created_at,
                chat_history: created.chat_history ?? [],
                chat_state: created.chat_state ?? 0,
                chat_pending: created.chat_pending ?? false,
                chat_special_inputs: created.chat_special_inputs ?? [],
            });
            setActiveConversationId(projectId, created.conversation_id);
            setActiveConversationIdState(created.conversation_id);
            setConversationsVersion((v) => v + 1);
        } catch {
            // Errors are surfaced as snackbars by the domain layer.
        } finally {
            setIsConversationActionPending(false);
        }
    }, [isConversationActionPending]);

    const handleRenameConversation = useCallback(async (conversationId: string, name: string) => {
        const projectId = ownProjectIdRef.current;
        if (!projectId) return;
        const trimmedName = name.trim();
        try {
            await renameConversation(projectId, conversationId, trimmedName);
        } catch {
            // Errors are surfaced as snackbars by the domain layer.
            return;
        }
        setConversationNameInStore(conversationId, trimmedName);
        setConversationsVersion((v) => v + 1);
    }, []);

    const handleDeleteConversation = useCallback(
        async (conversationId: string) => {
            const projectId = ownProjectIdRef.current;
            if (!projectId) return;
            try {
                await deleteConversation(projectId, conversationId);
            } catch {
                // Errors are surfaced as snackbars
                return;
            }

            removeConversationFromStore(conversationId);

            void stopIntentRX(getIntentRXSessionId(projectId, conversationId));

            if (conversationId === activeConversationId) {
                const remaining = getConversationsFromStore().filter(
                    (conv) => conv.conversation_id !== conversationId
                );
                const nextActiveId = remaining[0]?.conversation_id ?? "";
                setActiveConversationId(projectId, nextActiveId);
                setActiveConversationIdState(nextActiveId);
            }
            setConversationsVersion((v) => v + 1);
        },
        [activeConversationId]
    );

    const conversationListItems: ConversationListItem[] = getConversationsFromStore().map(
        (conversation, index) => {
            const history = conversation.chat_history ?? [];
            return {
                conversation_id: conversation.conversation_id,
                conversation_name: conversation.conversation_name ?? "",
                created_at: conversation.created_at,
                updated_at: history.at(-1)?.timestamp ?? conversation.created_at,
                message_count: history.length > 0 ? history.length : initialMessages.length,
                index: index + 1,
                isActive: conversation.conversation_id === activeConversationId,
            };
        }
    );

    void conversationsVersion; // triggers a re-render/re-read of the store above

    const conversationsPanel: ConversationsPanelProps = {
        conversations: conversationListItems,
        isBusy: isConversationActionPending,
        onSelect: handleSelectConversation,
        onCreate: handleCreateConversation,
        onDelete: handleDeleteConversation,
        onRename: handleRenameConversation,
    };

    return {
        diagramHandleInput,
        diagramOnAbort,
        initialMessages,
        initialSpecialInputs,
        getCommandDisabledCause,
        getPersistedState,
        onReconcile,
        onSave: onDiagramSave,
        onWaitingChange,
        onDiagramUploadFiles,
        onDiagramDownloadFile,
        onImportTopologyDiagram: handleImportTopologyDiagram,
        activeConversationId,
        conversationsPanel,
    };
};
