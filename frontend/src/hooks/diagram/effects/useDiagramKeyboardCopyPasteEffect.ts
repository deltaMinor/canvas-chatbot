import React from "react";

import {
    useDiagramClipboardCopyAction,
    useDiagramClipboardPasteAction,
    useSelectAllNodes,
} from "#root/hooks/diagram";

export const useDiagramKeyboardCopyPasteEffect = () => {
    const handleCopy = useDiagramClipboardCopyAction();
    const handlePaste = useDiagramClipboardPasteAction();
    const selectAllNodes = useSelectAllNodes();

    const handleKeyDown = React.useCallback(
        (event: KeyboardEvent) => {
            if (window.getSelection()?.toString()) {
                return;
            }

            const activeElement = document.activeElement;
            const isTextField =
                activeElement?.tagName === "INPUT" ||
                activeElement?.tagName === "TEXTAREA" ||
                (activeElement instanceof HTMLElement && activeElement.isContentEditable);

            if (isTextField) {
                return;
            }

            const hasModifierKey = event.metaKey || event.ctrlKey;
            if (!hasModifierKey) {
                return;
            }

            if (event.key === "a" || event.key === "A") {
                event.preventDefault();
                selectAllNodes();
                return;
            }

            if (event.key === "c" || event.key === "C") {
                event.preventDefault();
                void handleCopy();
                return;
            }

            if (event.key === "v" || event.key === "V") {
                event.preventDefault();
                void handlePaste();
            }
        },
        [handleCopy, handlePaste, selectAllNodes]
    );

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);
};
