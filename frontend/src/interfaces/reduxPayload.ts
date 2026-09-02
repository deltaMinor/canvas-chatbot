import type { PayloadAction } from "@reduxjs/toolkit";
import type { HandleType } from "@xyflow/react";

import type { OptionLabel } from "#root/interfaces";
import type {
    CanvasColumn,
    CanvasType,
    DiagramCanvas,
    DiagramEdge,
    DiagramNode,
    LineSegment,
    NodeAttackStepCountMapping,
    NodeHandleEdgeMappingDict,
    SortDirection,
    WarningMessage,
    WarningMessageMapping,
    WarningReport,
} from "#root/interfaces/diagram";
import type { DiagramElementAttributes } from "#root/interfaces/diagramAttributes";
import type { DrawerState } from "#root/interfaces/diagramContent";
import type {
    DiagramEditToolbarState,
    DiagramInstanceState,
    DiagramPendingDrawerKey,
    DiagramRequestedThreatScenarioDrawerKey,
    LegacyBackendState,
    LogDialogInstanceState,
    MuiDataGridInstanceState,
    ProjectScopedState,
    ProjectStateKey,
} from "#root/interfaces/redux";
import type { AttackStep } from "#root/interfaces/register";

export type NonProjectStateKey = Exclude<keyof LegacyBackendState, ProjectStateKey>;

export type BackendReducerMap = {
    [K in NonProjectStateKey as `set${Capitalize<string & K>}`]: (
        state: import("#root/interfaces/redux").BackendState,
        action: PayloadAction<import("#root/interfaces/redux").BackendState[K]>
    ) => void;
} & {
    [K in ProjectStateKey as `set${Capitalize<string & K>}`]: {
        reducer: (
            state: import("#root/interfaces/redux").BackendState,
            action: PayloadAction<{ projectId: string; value: ProjectScopedState[K] }>
        ) => void;
        prepare: (
            value: ProjectScopedState[K],
            projectId?: string
        ) => { payload: { projectId: string; value: ProjectScopedState[K] } };
    };
};

export interface LogDialogInstancePayload<T> {
    instanceId?: string;
    value: T;
}

export interface InitializeLogDialogInstancePayload {
    initialState?: Partial<LogDialogInstanceState>;
    instanceId: string;
}

export interface MuiDataGridInstancePayload<T> {
    instanceId: string;
    value: T;
}

export interface UpdateMuiDataGridExternalStatePayload {
    externalState?: Partial<Pick<MuiDataGridInstanceState, "defaultVisibleFields" | "refRows">>;
    instanceId: string;
}

export interface DiagramInstancePayload<T> {
    instanceId?: string;
    value: T;
}

export interface InitializeDiagramInstancePayload {
    instanceId: string;
    initialState?: Partial<DiagramInstanceState>;
}

export type SetDiagramEdgesPayload = DiagramEdge[] | DiagramInstancePayload<DiagramEdge[]>;
export type SetDiagramNodesPayload = DiagramNode[] | DiagramInstancePayload<DiagramNode[]>;
export type SetDiagramNodeHandleEdgeMappingPayload =
    NodeHandleEdgeMappingDict | DiagramInstancePayload<NodeHandleEdgeMappingDict>;
export type SetDiagramLineSegmentsPayload =
    Record<string, LineSegment[]> | DiagramInstancePayload<Record<string, LineSegment[]>>;
export type SetDiagramEdgeSegmentedPathsPayload =
    Record<string, string> | DiagramInstancePayload<Record<string, string>>;
export type SetDiagramCanvasPayload =
    DiagramCanvas | undefined | DiagramInstancePayload<DiagramCanvas | undefined>;
export type SetDiagramNodePayload = DiagramNode | null | DiagramInstancePayload<DiagramNode | null>;
export type SetDiagramEdgePayload = DiagramEdge | null | DiagramInstancePayload<DiagramEdge | null>;
export type SetDiagramElementAttributesPayload =
    DiagramElementAttributes | null | DiagramInstancePayload<DiagramElementAttributes | null>;
export type SetDiagramCanvasHistoryPayload =
    DiagramCanvas[] | DiagramInstancePayload<DiagramCanvas[]>;
export type SetDiagramAttackStepPayload = AttackStep | DiagramInstancePayload<AttackStep>;
export type SetDiagramAttackStepCountMappingPayload =
    NodeAttackStepCountMapping | DiagramInstancePayload<NodeAttackStepCountMapping>;
export type SetDiagramWarningMessageMappingPayload =
    WarningMessageMapping | DiagramInstancePayload<WarningMessageMapping>;
export type SetDiagramToscaReportMappingPayload =
    Record<string, WarningReport[]> | DiagramInstancePayload<Record<string, WarningReport[]>>;
export type SetDiagramWarningMessageListPayload =
    WarningMessage[] | DiagramInstancePayload<WarningMessage[]>;
export type SetDiagramStringArrayPayload = string[] | DiagramInstancePayload<string[]>;
export type SetDiagramDrawerStatePayload = DrawerState | DiagramInstancePayload<DrawerState>;
export type SetDiagramOptionLabelPayload = OptionLabel | DiagramInstancePayload<OptionLabel>;
export type SetDiagramOptionLabelArrayMappingPayload =
    Record<string, OptionLabel[]> | DiagramInstancePayload<Record<string, OptionLabel[]>>;
export type SetDiagramCanvasColumnMappingPayload =
    | Record<string, CanvasColumn | undefined>
    | DiagramInstancePayload<Record<string, CanvasColumn | undefined>>;
export type SetDiagramBooleanPayload = boolean | DiagramInstancePayload<boolean>;
export type SetDiagramStringPayload = string | DiagramInstancePayload<string>;
export type SetDiagramNumberPayload = number | DiagramInstancePayload<number>;
export type SetDiagramEditToolbarStatePayload =
    DiagramEditToolbarState | DiagramInstancePayload<DiagramEditToolbarState>;
export type SetDiagramPendingDrawerKeyPayload =
    DiagramPendingDrawerKey | DiagramInstancePayload<DiagramPendingDrawerKey>;
export type SetDiagramRequestedThreatScenarioDrawerKeyPayload =
    | DiagramRequestedThreatScenarioDrawerKey
    | DiagramInstancePayload<DiagramRequestedThreatScenarioDrawerKey>;
export type SetDiagramPendingThreatOverviewScenarioScopePayload =
    ("top5" | "all" | null) | DiagramInstancePayload<"top5" | "all" | null>;
export type SetDiagramCanvasTypePayload = CanvasType | DiagramInstancePayload<CanvasType>;
export type SetDiagramSortDirectionPayload = SortDirection | DiagramInstancePayload<SortDirection>;
export type SetDiagramHandleTypePayload = HandleType | DiagramInstancePayload<HandleType>;
