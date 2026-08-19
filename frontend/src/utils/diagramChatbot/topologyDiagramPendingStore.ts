let pendingTopologyDiagramAddress: string | null = null;

export const setPendingTopologyDiagramAddress = (address: string): void => {
    pendingTopologyDiagramAddress = address;
};

export const getPendingTopologyDiagramAddress = (): string | null => pendingTopologyDiagramAddress;

export const clearPendingTopologyDiagramAddress = (): void => {
    pendingTopologyDiagramAddress = null;
};
