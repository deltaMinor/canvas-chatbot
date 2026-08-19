import { DiagramNode } from "#root/interfaces/diagram";
import { AttackNarrativeSteps, AttackStep, CVEListObject } from "#root/interfaces/register";

export interface PathSummaryCardProps {
    pathId?: string | undefined;
    totalSteps: number;
    stepNumber: number;
    startAttackPath: boolean;
    onChangeStep: (stepNumber: number) => void;
    handleClickToggleAttackPath: () => Promise<void>;
}

export interface RiskScenarioSectionProps {
    riskScenario?: string | undefined;
    stats?: {
        label: string;
        value: string | number;
    }[];
}

export interface AttackNarrativeSectionProps {
    attackNarrative: AttackNarrativeSteps;
    tacticLabels: string[];
    activeStepNumber?: number | null;
    disableCardWrapper?: boolean;
    collapsible?: boolean;
    sectionDefaultExpanded?: boolean;
}

export interface StepNarrativeDialSectionProps {
    steps: AttackStep[];
    tacticLabels: string[];
    activeStepNumber?: number | null;
    onChangeStep?: (stepNumber: number) => void;
}

export interface SecurityFrameworksSectionProps {
    visibleFrameworkGroups: [string, ThreatDrawerFrameworkGroup][];
}

export interface CVEInfoSectionProps {
    cveList: CVEListObject[];
}

export type ThreatDrawerFrameworkGroup = {
    key: string;
    label: string;
    color: string;
    link: string;
}[];

export interface MitreTechniquesSectionProps {
    techniques: string[];
    title?: string;
    disableCardWrapper?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export interface RankingCriteriaSectionProps {
    rankingCriteria: number[];
    disableCardWrapper?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export interface KeyRiskAnalysisSectionProps {
    defaultImpact?: number | undefined;
    defaultLikelihood?: number | undefined;
    disableCardWrapper?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export interface ThreatDrawerItemsSectionItem {
    id: string;
    label: string;
    secondaryLabel?: string | undefined;
    iconName?: string | undefined;
    tooltip?: string | undefined;
    onLocate?: (() => void) | undefined;
    kind?: "node" | "edge" | undefined;
    idTooltip?: string | undefined;
    sourceLabel?: string | undefined;
    sourceIconName?: string | undefined;
    targetLabel?: string | undefined;
    targetIconName?: string | undefined;
    isHidden?: boolean | undefined;
    onToggleVisibility?: (() => void) | undefined;
    toggleVisibilityLabel?: string | undefined;
    locateLabel?: string | undefined;
}

export interface ThreatDrawerItemsSectionProps {
    items: ThreatDrawerItemsSectionItem[];
    title?: string;
    disableCardWrapper?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export interface AssessmentSectionProps {
    stats: {
        label: string;
        value: string | number;
    }[];
}

export interface InfoPanelViewPathCardProps {
    selectedAttackStep?: AttackStep;
    pathId?: string | undefined;
}

export interface ThreatDrawerNodeListProps {
    sortedEntries: [string, number][];
    diagramNodes: DiagramNode[];
}

export interface ThreatDrawerNodeListItemProps {
    nodeId: string;
    occurrence: number;
    label: string;
    iconName: string;
    onOpenDetails: (nodeId: string) => void;
    onLocate: (nodeId: string) => void;
}

export interface ThreatDrawerEdgeListItemProps {
    edgeId: string;
    visibilityEdgeId: string;
    sourceLabel: string;
    targetLabel: string;
    sourceIconName?: string | undefined;
    targetIconName?: string | undefined;
    occurrence: number;
    isHidden: boolean;
    onOpenDetails: (edgeId: string) => void;
    onLocate: (edgeId: string) => void;
    onToggleVisibility: (edgeId: string) => void;
}

export interface ThreatDrawerEdgeListActionHandlers {
    edgeId: string;
    visibilityEdgeId: string;
    isHidden: boolean;
    onOpenDetails: (edgeId: string) => void;
    onLocate: (edgeId: string) => void;
    onToggleVisibility: (edgeId: string) => void;
}

export interface ThreatDrawerEdgeListEndpointProps {
    edgeId: string;
    label: string;
    iconName?: string | undefined;
    showInfoBadge?: boolean;
}

export interface ThreatDrawerEdgeListActionsProps extends ThreatDrawerEdgeListActionHandlers {
    showDetailsButton?: boolean;
    showFooterButtons?: boolean;
}

export interface ThreatDrawerEdgeListItemHeaderProps extends ThreatDrawerEdgeListActionHandlers {
    sourceLabel: string;
    targetLabel: string;
    sourceIconName?: string | undefined;
    targetIconName?: string | undefined;
}

export interface ThreatDrawerEdgeListItemFooterProps extends ThreatDrawerEdgeListActionHandlers {
    occurrence: number;
}
