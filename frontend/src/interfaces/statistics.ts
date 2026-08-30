//////////////////////////////////////////////////
// ProgressChart
//////////////////////////////////////////////////
export enum ProgressChartTypeKey {
    total_mitigation = "total_mitigation",
    domain_mitigation = "domain_mitigation",
}

export interface ProgressChartStats {
    currentCount: number | Record<string, number>;
    totalCount: number | Record<string, number>;
}

export interface TrendCardStats {
    total: number;
    down: number;
    up: number;
    flat: number;
}

export interface BarChartSegment {
    label: string;
    value: number;
    color: string;
}

export interface BarChartStats {
    category: string;
    total: number;
    segments: BarChartSegment[];
    hideable: boolean;
    hidden: boolean;
}

export enum StatsChartType {
    donut = "donut",
    radial = "radial",
    trendCard = "trendCard",
    bar = "bar",
}

type HistoryStats<T extends Record<string, number[]>> = {
    timestamp: string[];
    sum: number[];
} & T;

export type ProjectHistoryStats = HistoryStats<Record<string, number[]>>;

export interface StatisticsCard {
    title: string;
    charts: StatisticsChartProps[];
    gridSize: number;
}

export interface StatisticsChartProps {
    title: string;
    type: string;
    stats: ProjectHistoryStats | ProgressChartStats | TrendCardStats | BarChartStats[];
    //
    helperText?: string;
    hidden?: boolean;
    keys?: string[];
    //
    labelDict?: Record<string, string>;
    colorDict?: Record<string, string>;
    abbrDict?: Record<string, string>;
}

export interface ProjectStatistics {
    project_id: string;
    riskLevelChanges: TrendCardStats;
}
