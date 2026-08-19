import { useRef, useState } from "react";

export const useDragDrop = (onFilesDropped: (files: FileList) => void) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const dragCounterRef = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current++;

        if (e.dataTransfer.types.includes("Files")) {
            setIsDraggingOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current--;

        if (dragCounterRef.current === 0) {
            setIsDraggingOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounterRef.current = 0;
        setIsDraggingOver(false);

        onFilesDropped(e.dataTransfer.files);
    };

    return {
        isDraggingOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
    };
};
