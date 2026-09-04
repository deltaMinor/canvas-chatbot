import { RefObject } from "react";

import {
    INPUT_HELP,
    INPUT_LLM_INTENT,
    INPUT_LLM_ONTO,
    INPUT_LLM_TOPOLOGY,
    MSG_CONFIRM_CLEAR_ALL,
    MSG_CONFIRM_CLEAR_CHAT,
    MSG_CONFIRM_CLEAR_DIAGRAM,
    MSG_CONFIRM_CLEAR_RUNS,
    MSG_HELP,
    TOPOLOGY_CONTINUE_INPUT,
    TOPOLOGY_CONTINUE_TITLE,
    TOPOLOGY_CURRPROJ_INPUT,
    TOPOLOGY_DATABASE_INPUT,
    TOPOLOGY_DIRUPLOAD_INPUT,
} from "#root/constants/diagramChatbot";
import { ChatbotState } from "#root/enums/diagram-chatbot";
import { ChatMessage, ChatbotHandle, HandleInputFnOutput } from "#root/interfaces/chatbot";
import { getProjectDiagramFilePdfFromApi } from "#root/services/domain/diagram_pdf_file";
import { sendIntentRXMessage } from "#root/services/domain/intentrx";
import { stringsToHandleInputFnOutput } from "#root/utils/chatbot/formatOutput";
import { formatSetupTopologyPanels } from "#root/utils/diagramChatbot/formatIntentRX";
import {
    IntentRXContext,
    startIntentRXSession,
    withIntentRXProgress,
} from "#root/utils/diagramChatbot/intentRXSession";
import {
    applyTopologyFileFromAddress,
    checkAndApplyTopologyFile,
    resetTopologyFileTrackingState,
} from "#root/utils/diagramChatbot/topologyFileTracking";
import {
    clearTopologyRunContexts,
    fetchTopologyRunContexts,
    formatTopologyRunContexts,
    isValidTopologyRunId,
    topologyRunContextToSpecialInput,
} from "#root/utils/diagramChatbot/topologyRunContext";
import {
    extractLastDatabasePdfIndex,
    uploadTopologySetupPdf,
    validatePdf,
} from "#root/utils/diagramChatbot/topologySetupUpload";
import {
    fileToString,
    filesToList,
    getIndexWithPdf,
    getUploadedPdfs,
} from "#root/utils/diagramChatbot/uploadPdfs";

const UNUSED_RUN_ID = "intentrx-topo--aaaaaaaaa";

export const handleNeutralState = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const normalizedText = input.text?.trim().toLowerCase();

    switch (normalizedText) {
        case "/help": {
            return [
                {
                    messages: [
                        {
                            text: MSG_HELP,
                        },
                    ],
                    inputs: [INPUT_LLM_ONTO, INPUT_LLM_INTENT, INPUT_LLM_TOPOLOGY, INPUT_HELP],
                },
                ChatbotState.Neutral,
            ];
        }
        // Demo/test case for the waiting UI: counts down from 5 to 1,
        // updating the progress bar text once per second.
        case "/wait": {
            for (let secondsLeft = 5; secondsLeft >= 1; secondsLeft--) {
                intentContext.onProgress(`Waiting for ${secondsLeft} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            return [stringsToHandleInputFnOutput("Done waiting!"), ChatbotState.Neutral];
        }
        case "/runs": {
            const runs = await fetchTopologyRunContexts(
                intentContext.projectId,
                intentContext.conversationId
            );
            return [
                stringsToHandleInputFnOutput(formatTopologyRunContexts(runs)),
                ChatbotState.Neutral,
            ];
        }
        case "/project_id": {
            return [
                stringsToHandleInputFnOutput(
                    intentContext.projectId
                        ? `Current project ID: ${intentContext.projectId}`
                        : "No project is currently open."
                ),
                ChatbotState.Neutral,
            ];
        }
        case "/pdfs": {
            try {
                const projectDiagramFilePdf = await getProjectDiagramFilePdfFromApi(
                    intentContext.projectId
                );
                const files = getUploadedPdfs(projectDiagramFilePdf);

                if (files.length === 0) {
                    return [
                        stringsToHandleInputFnOutput("No uploaded PDF files found."),
                        ChatbotState.Neutral,
                    ];
                }

                const lines = filesToList(files);
                return [stringsToHandleInputFnOutput(lines), ChatbotState.Neutral];
            } catch (err) {
                return [
                    stringsToHandleInputFnOutput(
                        `Failed to list PDF files: ${err instanceof Error ? err.message : String(err)}`
                    ),
                    ChatbotState.Neutral,
                ];
            }
        }
        case "/start onto": {
            return startIntentRXSession("onto", ChatbotState.LlmOnto, intentContext);
        }
        case "/start intent": {
            return startIntentRXSession("intent", ChatbotState.LlmIntent, intentContext);
        }
        case "/start topodebug": {
            return startIntentRXSession("topology", ChatbotState.LlmTopology, intentContext);
        }
        case "/start topology": {
            const [response, state] = await startIntentRXSession(
                "topology",
                ChatbotState.LlmTopologySetup,
                intentContext
            );
            const formattedMessages = formatSetupTopologyPanels(response.messages);
            return [{ messages: formattedMessages }, state];
        }
        case "/clear chat":
            return [
                stringsToHandleInputFnOutput(MSG_CONFIRM_CLEAR_CHAT),
                ChatbotState.ConfirmClearChat,
            ];
        case "/clear diagram": {
            return [
                stringsToHandleInputFnOutput(MSG_CONFIRM_CLEAR_DIAGRAM),
                ChatbotState.ConfirmClearDiagram,
            ];
        }
        case "/clear runs":
            return [
                stringsToHandleInputFnOutput(MSG_CONFIRM_CLEAR_RUNS),
                ChatbotState.ConfirmClearRuns,
            ];
        case "/clear all": {
            return [
                stringsToHandleInputFnOutput(MSG_CONFIRM_CLEAR_ALL),
                ChatbotState.ConfirmClearAll,
            ];
        }
        case "/import": {
            const jsonFiles = input.files?.filter((f) => f.name.endsWith(".json")) ?? [];

            if (jsonFiles.length === 1) {
                const file = jsonFiles[0];
                if (file) {
                    try {
                        const message = await intentContext.performImportDiagramFromFile(file);
                        return [stringsToHandleInputFnOutput(message), ChatbotState.Neutral];
                    } catch (err) {
                        return [
                            stringsToHandleInputFnOutput(
                                `Import failed: ${err instanceof Error ? err.message : String(err)}`
                            ),
                            ChatbotState.Neutral,
                        ];
                    }
                }
            } else {
                return [
                    stringsToHandleInputFnOutput(
                        "Please attach a single JSON file to import a diagram."
                    ),
                    ChatbotState.Neutral,
                ];
            }
        }
    }

    const outputParts: string[] = [];
    if (input.text) outputParts.push(`Diagram response: ${input.text}`);
    if (input.files?.length === 1) outputParts.push(`(file attached: ${input.files[0]?.name})`);
    else if (input.files && input.files.length > 1)
        outputParts.push(
            `(${input.files.length} files attached: ${input.files.map((f) => f.name).join(", ")})`
        );

    return [
        {
            messages: [
                {
                    text: outputParts.join("\n") || "—",
                    ...(input.files !== undefined && { files: input.files }),
                },
            ],
        },
        ChatbotState.Neutral,
    ];
};

export const handleConfirmClearChatState = (
    input: ChatMessage,
    chatbotRef: RefObject<ChatbotHandle | null>
): [HandleInputFnOutput, ChatbotState] => {
    const normalizedText = input.text?.trim().toLowerCase();

    if (normalizedText === "yes") {
        chatbotRef.current?.clearChat();
        return [
            {
                messages: [
                    {
                        text: "Chat history successfully cleared.\nEnter /help for list of available commands.",
                    },
                ],
                inputs: [INPUT_HELP],
            },
            ChatbotState.Neutral,
        ];
    }
    return [
        stringsToHandleInputFnOutput("Operation to clear chat cancelled."),
        ChatbotState.Neutral,
    ];
};

export const handleConfirmClearDiagramState = async (
    input: ChatMessage,
    performClearDiagram: () => Promise<void>
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const normalizedText = input.text?.trim().toLowerCase();

    let chatOutput: string;
    if (normalizedText === "yes") {
        try {
            await performClearDiagram();
            chatOutput = "Diagram successfully cleared.";
        } catch (err) {
            chatOutput = err instanceof Error ? err.message : String(err);
            chatOutput += "\nClear diagram operation aborted.";
        }
    } else {
        chatOutput = "Operation to clear diagram cancelled.";
    }
    return [stringsToHandleInputFnOutput(chatOutput), ChatbotState.Neutral];
};

export const handleConfirmClearRunsState = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const normalizedText = input.text?.trim().toLowerCase();

    if (normalizedText === "yes") {
        try {
            await clearTopologyRunContexts(intentContext.projectId, intentContext.conversationId);
            return [
                stringsToHandleInputFnOutput("All run ids successfully cleared."),
                ChatbotState.Neutral,
            ];
        } catch (err) {
            const chatOutput =
                (err instanceof Error ? err.message : String(err)) +
                "\nClear run ids operation aborted.";
            return [stringsToHandleInputFnOutput(chatOutput), ChatbotState.Neutral];
        }
    }
    return [
        stringsToHandleInputFnOutput("Operation to clear run ids cancelled."),
        ChatbotState.Neutral,
    ];
};

export const handleConfirmClearAllState = async (
    input: ChatMessage,
    chatbotRef: RefObject<ChatbotHandle | null>,
    intentContext: IntentRXContext,
    performClearDiagram: () => Promise<void>
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const normalizedText = input.text?.trim().toLowerCase();

    if (normalizedText === "yes") {
        try {
            await performClearDiagram();
            await clearTopologyRunContexts(intentContext.projectId, intentContext.conversationId);
            chatbotRef.current?.clearChat();
            return [
                {
                    messages: [
                        {
                            text: "All content successfully cleared.\nEnter /help for list of available commands.",
                        },
                    ],
                    inputs: [INPUT_HELP],
                },
                ChatbotState.Neutral,
            ];
        } catch (err) {
            const chatOutput =
                (err instanceof Error ? err.message : String(err)) +
                "\nClear all operation aborted.";
            return [stringsToHandleInputFnOutput(chatOutput), ChatbotState.Neutral];
        }
    }
    return [
        stringsToHandleInputFnOutput("Operation to clear data cancelled."),
        ChatbotState.Neutral,
    ];
};

export const handleIntentRXState = async (
    input: ChatMessage,
    currChatbotState: ChatbotState,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const text = input.text ?? "";
    const intentRxResponse = await withIntentRXProgress(
        intentContext.sessionId,
        intentContext.onProgress,
        () =>
            sendIntentRXMessage(
                intentContext.sessionId,
                text,
                intentContext.projectId,
                intentContext.conversationId,
                currChatbotState
            )
    );
    const messages = await checkAndApplyTopologyFile(
        intentContext.sessionId,
        intentContext.projectId,
        intentContext.conversationId,
        intentRxResponse.panels,
        intentRxResponse.topology_diagram_address
    );
    if (intentRxResponse.ended) {
        resetTopologyFileTrackingState(intentContext.sessionId);
    }

    return [
        { messages: messages.length > 0 ? messages : [{ text: "" }] },
        intentRxResponse.ended ? ChatbotState.Neutral : currChatbotState,
    ];
};

export const handleTopologySetup = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const text = input.text ?? "";
    const runs = await fetchTopologyRunContexts(
        intentContext.projectId,
        intentContext.conversationId
    );
    switch (text) {
        case ":quit": {
            const intentRxResponse = await withIntentRXProgress(
                intentContext.sessionId,
                intentContext.onProgress,
                () =>
                    sendIntentRXMessage(
                        intentContext.sessionId,
                        ":quit",
                        intentContext.projectId,
                        intentContext.conversationId,
                        ChatbotState.LlmTopology
                    )
            );
            const messages = await checkAndApplyTopologyFile(
                intentContext.sessionId,
                intentContext.projectId,
                intentContext.conversationId,
                intentRxResponse.panels,
                intentRxResponse.topology_diagram_address
            );
            if (intentRxResponse.ended) {
                resetTopologyFileTrackingState(intentContext.sessionId);
            }

            return [
                {
                    messages: messages.length > 0 ? messages : [{ text: "" }],
                },
                ChatbotState.Neutral,
            ];
        }
        case TOPOLOGY_CONTINUE_INPUT:
            if (runs.length === 0) {
                return [
                    stringsToHandleInputFnOutput(
                        "No run-ids recorded for this conversation, please select a different setup option."
                    ),
                    ChatbotState.LlmTopologySetup,
                ];
            } else {
                const intentRxResponse = await withIntentRXProgress(
                    intentContext.sessionId,
                    intentContext.onProgress,
                    () =>
                        sendIntentRXMessage(
                            intentContext.sessionId,
                            "4",
                            intentContext.projectId,
                            intentContext.conversationId,
                            ChatbotState.LlmTopology
                        )
                );
                const messages = await checkAndApplyTopologyFile(
                    intentContext.sessionId,
                    intentContext.projectId,
                    intentContext.conversationId,
                    intentRxResponse.panels,
                    intentRxResponse.topology_diagram_address
                );
                if (intentRxResponse.ended) {
                    resetTopologyFileTrackingState(intentContext.sessionId);
                }

                return [
                    {
                        messages: messages.length > 0 ? messages : [{ text: "" }],
                        inputs: runs.map(topologyRunContextToSpecialInput),
                    },
                    intentRxResponse.ended
                        ? ChatbotState.Neutral
                        : ChatbotState.LlmTopologySetupContinue,
                ];
            }
        case TOPOLOGY_CURRPROJ_INPUT: {
            const projectDiagramFilePdf = await getProjectDiagramFilePdfFromApi(
                intentContext.projectId
            );
            const files = getUploadedPdfs(projectDiagramFilePdf);

            if (files.length === 0) {
                return [
                    stringsToHandleInputFnOutput(
                        "No uploaded PDF files found. Select a different option."
                    ),
                    ChatbotState.LlmTopologySetup,
                ];
            }

            return [
                stringsToHandleInputFnOutput(
                    "Choose an uploaded PDF to parse:\n" + filesToList(files)
                ),
                ChatbotState.LlmTopologySetupUploadedPdf,
            ];
        }
        case TOPOLOGY_DIRUPLOAD_INPUT:
            return [
                stringsToHandleInputFnOutput("Attach a PDF file to parse."),
                ChatbotState.LlmTopologySetupUpload,
            ];
        default:
            return [
                stringsToHandleInputFnOutput(
                    [
                        "Invalid input, please select an option from below.",
                        "[1] Continue from previous run",
                        "[2] Import from current project database",
                        "[3] Upload PDF file",
                    ].join("\n")
                ),
                ChatbotState.LlmTopologySetup,
            ];
    }
};

export const handleTopologySetupContinue = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    const text = input.text ?? "";
    const runs = await fetchTopologyRunContexts(
        intentContext.projectId,
        intentContext.conversationId
    );
    const isUnfoundValidId = isValidTopologyRunId(text) && !runs.some((run) => run.run_id === text);
    const intentRxResponse = await withIntentRXProgress(
        intentContext.sessionId,
        intentContext.onProgress,
        () =>
            sendIntentRXMessage(
                intentContext.sessionId,
                isUnfoundValidId ? UNUSED_RUN_ID : text,
                intentContext.projectId,
                intentContext.conversationId,
                ChatbotState.LlmTopology
            )
    );
    const messages = await checkAndApplyTopologyFile(
        intentContext.sessionId,
        intentContext.projectId,
        intentContext.conversationId,
        intentRxResponse.panels,
        intentRxResponse.topology_diagram_address
    );
    if (intentRxResponse.ended) {
        resetTopologyFileTrackingState(intentContext.sessionId);
    }
    if (intentRxResponse.panels.some((panel) => panel.title === TOPOLOGY_CONTINUE_TITLE)) {
        if (isUnfoundValidId) {
            for (const message of messages) {
                if (message.text) {
                    message.text = message.text.replace(UNUSED_RUN_ID, text);
                }
            }
        }
        return [
            {
                messages: messages.length > 0 ? messages : [{ text: "" }],
                inputs: runs.map(topologyRunContextToSpecialInput),
            },
            intentRxResponse.ended ? ChatbotState.Neutral : ChatbotState.LlmTopologySetupContinue,
        ];
    }

    if (
        !intentRxResponse.ended &&
        isValidTopologyRunId(text) &&
        runs.some((run) => run.run_id === text)
    ) {
        const run = runs.find((r) => r.run_id === text);
        if (run) {
            const importMessages = await applyTopologyFileFromAddress(
                intentContext.sessionId,
                intentContext.projectId,
                run.address
            );
            messages.push(...importMessages);
        }
    }

    return [
        {
            messages: messages.length > 0 ? messages : [{ text: "" }],
        },
        intentRxResponse.ended ? ChatbotState.Neutral : ChatbotState.LlmTopology,
    ];
};

export const handleLlmTopologySetupUploadedPdf = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    let text: string = input.text ?? "";
    if (input.text !== ":quit") {
        const projectDiagramFilePdf = await getProjectDiagramFilePdfFromApi(
            intentContext.projectId
        );
        const files = getUploadedPdfs(projectDiagramFilePdf);
        if (text === "") {
            return [
                stringsToHandleInputFnOutput("No input given.\n" + filesToList(files)),
                ChatbotState.LlmTopologySetupUploadedPdf,
            ];
        }
        const numInput = Number(text);
        if (!Number.isInteger(numInput)) {
            return [
                stringsToHandleInputFnOutput(
                    "Input a number for the desired PDF to parse.\n" + filesToList(files)
                ),
                ChatbotState.LlmTopologySetupUploadedPdf,
            ];
        }
        console.log(files.length);
        if (numInput < 1 || numInput > files.length) {
            return [
                stringsToHandleInputFnOutput(
                    "Number out of range, below are the available PDF to parse.\n" +
                        filesToList(files)
                ),
                ChatbotState.LlmTopologySetupUploadedPdf,
            ];
        }
        const targetFile = files[numInput - 1];
        if (targetFile === undefined) {
            return [
                stringsToHandleInputFnOutput(
                    "File cannot be accessed, select a different PDF to parse.\n" +
                        filesToList(files)
                ),
                ChatbotState.LlmTopologySetupUploadedPdf,
            ];
        } else {
            const targetFileString = fileToString(targetFile);

            await withIntentRXProgress(intentContext.sessionId, intentContext.onProgress, () =>
                sendIntentRXMessage(
                    intentContext.sessionId,
                    TOPOLOGY_DATABASE_INPUT,
                    intentContext.projectId,
                    intentContext.conversationId,
                    ChatbotState.LlmTopology
                )
            );
            const firstResponse = await withIntentRXProgress(
                intentContext.sessionId,
                intentContext.onProgress,
                () =>
                    sendIntentRXMessage(
                        intentContext.sessionId,
                        intentContext.projectId,
                        intentContext.projectId,
                        intentContext.conversationId,
                        ChatbotState.LlmTopology
                    )
            );
            console.log(firstResponse.panels[0]?.text);
            text = getIndexWithPdf(firstResponse.panels, targetFileString);
            console.log(text);
        }
    }
    const intentRxResponse = await withIntentRXProgress(
        intentContext.sessionId,
        intentContext.onProgress,
        () =>
            sendIntentRXMessage(
                intentContext.sessionId,
                text,
                intentContext.projectId,
                intentContext.conversationId,
                ChatbotState.LlmTopology
            )
    );
    const messages = await checkAndApplyTopologyFile(
        intentContext.sessionId,
        intentContext.projectId,
        intentContext.conversationId,
        intentRxResponse.panels,
        intentRxResponse.topology_diagram_address
    );
    if (intentRxResponse.ended) {
        resetTopologyFileTrackingState(intentContext.sessionId);
    }

    return [
        {
            messages: messages.length > 0 ? messages : [{ text: "" }],
        },
        intentRxResponse.ended ? ChatbotState.Neutral : ChatbotState.LlmTopology,
    ];
};

export const handleLlmTopologySetupUpload = async (
    input: ChatMessage,
    intentContext: IntentRXContext
): Promise<[HandleInputFnOutput, ChatbotState]> => {
    let text = "";
    if (input.text === ":quit") {
        text = input.text;
    } else {
        const files = input.files ?? [];
        if (files.length !== 1) {
            return [
                stringsToHandleInputFnOutput("Please attach a single PDF file to parse."),
                ChatbotState.LlmTopologySetupUpload,
            ];
        }

        const uploadResult = await validatePdf(files);
        if (!uploadResult.success) {
            return [
                stringsToHandleInputFnOutput(
                    uploadResult.message === undefined ? "" : uploadResult.message
                ),
                ChatbotState.LlmTopologySetupUpload,
            ];
        }

        const file = files[0];
        if (file === undefined) {
            return [
                stringsToHandleInputFnOutput(
                    "File cannot be accessed, please attach the PDF again."
                ),
                ChatbotState.LlmTopologySetupUpload,
            ];
        }
        const dbUploadResult = await uploadTopologySetupPdf(file, intentContext.projectId);
        if (!dbUploadResult.success) {
            return [
                stringsToHandleInputFnOutput(
                    dbUploadResult.message === undefined ? "" : dbUploadResult.message
                ),
                ChatbotState.LlmTopologySetupUpload,
            ];
        }

        await withIntentRXProgress(intentContext.sessionId, intentContext.onProgress, () =>
            sendIntentRXMessage(
                intentContext.sessionId,
                TOPOLOGY_DATABASE_INPUT,
                intentContext.projectId,
                intentContext.conversationId,
                ChatbotState.LlmTopology
            )
        );
        const firstResponse = await withIntentRXProgress(
            intentContext.sessionId,
            intentContext.onProgress,
            () =>
                sendIntentRXMessage(
                    intentContext.sessionId,
                    intentContext.projectId,
                    intentContext.projectId,
                    intentContext.conversationId,
                    ChatbotState.LlmTopology
                )
        );
        text = extractLastDatabasePdfIndex(firstResponse.panels) ?? "";
        console.log(text);
    }
    const intentRxResponse = await withIntentRXProgress(
        intentContext.sessionId,
        intentContext.onProgress,
        () =>
            sendIntentRXMessage(
                intentContext.sessionId,
                text,
                intentContext.projectId,
                intentContext.conversationId,
                ChatbotState.LlmTopology
            )
    );
    const messages = await checkAndApplyTopologyFile(
        intentContext.sessionId,
        intentContext.projectId,
        intentContext.conversationId,
        intentRxResponse.panels,
        intentRxResponse.topology_diagram_address
    );
    if (intentRxResponse.ended) {
        resetTopologyFileTrackingState(intentContext.sessionId);
    }

    return [
        {
            messages: messages.length > 0 ? messages : [{ text: "" }],
        },
        intentRxResponse.ended ? ChatbotState.Neutral : ChatbotState.LlmTopology,
    ];
};
