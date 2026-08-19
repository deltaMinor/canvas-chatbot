import { useCallback, useEffect, useRef, useState } from "react";

import { ChatBubbleProps, ChatFileAttachment, ChatMessage } from "#root/interfaces/chatbot";

const fromChatMessage = (msg: ChatMessage, id: number): ChatBubbleProps => ({
    id,
    type: "response",
    text: msg.text ?? "",
    timestamp: new Date().toISOString(),
    ...(msg.topology_diagram_address !== undefined && {
        topology_diagram_address: msg.topology_diagram_address,
    }),
});

const nextMsgId = (messages: ChatBubbleProps[]): number =>
    messages.length > 0 ? Math.max(...messages.map((m) => m.id)) + 1 : 1;

/**
 * Manages the chatbot message list with optional persistence.
 *
 * All coupling to a specific persistence mechanism is removed — the hook
 * accepts plain callbacks instead:
 *
 * - `persistedMessages` — whatever was previously saved for this chatbot,
 *   read synchronously by the caller. Used as-is for the very
 *   first render whenever it's non-empty, so a returning user sees their
 *   real history immediately with no async gap where only
 *   `initialMessages` is visible.
 * - `onSave` — function called (debounced) with the full messages array
 *   after every mutation. Omit to skip persistence entirely.
 *
 * @param initialMessages   - Default messages shown when there is no persisted history.
 * @param persistedMessages - Previously saved messages, read synchronously by the caller.
 * @param onSave             - Function called with the latest messages after changes.
 * @param debounceMs         - Milliseconds to debounce `onSave` calls (default 800).
 */
export const useChatBubbleProps = (
    initialMessages: ChatMessage[] = [],
    persistedMessages: ChatBubbleProps[] = [],
    onSave?: (messages: ChatBubbleProps[]) => void | Promise<void>,
    debounceMs = 800
) => {
    const [messages, setMessages] = useState<ChatBubbleProps[]>(() =>
        persistedMessages.length > 0
            ? persistedMessages
            : initialMessages.map((m, i) => fromChatMessage(m, i + 1))
    );
    const messagesRef = useRef<ChatBubbleProps[]>(messages);
    const msgIdRef = useRef(nextMsgId(messages));
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didMountRef = useRef(false);

    const newMessageIdsRef = useRef<Set<number>>(new Set());

    // ── Debounced save whenever messages change ───────────────────────────
    useEffect(() => {
        // Skip the save triggered by this hook's own initial seed.
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }
        if (!onSave) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(() => {
            void onSave(messages);
        }, debounceMs);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps
    // `onSave` and `debounceMs` are intentionally excluded — they are
    // constructor-time values and changing them mid-session is not supported.

    // Flush any pending debounced save immediately if the component is
    // unmounted (e.g. the user navigates away) instead of letting the
    // cleanup above silently drop it.
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                if (onSave) void onSave(messagesRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Mutation helpers ──────────────────────────────────────────────────

    const clearChat = useCallback(() => {
        messagesRef.current = [];
        setMessages([]);
    }, []);

    const pushMessage = useCallback(
        (
            type: "command" | "response",
            messageText: string,
            fileAttachments?: ChatFileAttachment[],
            topology_diagram_address?: string
        ): ChatBubbleProps[] => {
            const id = msgIdRef.current++;
            newMessageIdsRef.current.add(id);
            const next = [
                ...messagesRef.current,
                {
                    id,
                    type: type,
                    text: messageText,
                    timestamp: new Date().toISOString(),
                    ...(fileAttachments !== undefined && { files: fileAttachments }),
                    ...(topology_diagram_address !== undefined && { topology_diagram_address }),
                },
            ];
            messagesRef.current = next;
            setMessages(next);
            return next;
        },
        []
    );

    const isNewMessage = useCallback((id: number) => newMessageIdsRef.current.has(id), []);

    return { messages, clearChat, pushMessage, isNewMessage };
};
