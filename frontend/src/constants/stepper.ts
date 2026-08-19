import { ProjectStep } from "#root/interfaces/stepper";

export const projectStepEnumList = [
    ProjectStep.conception_questionnaire, //
    ProjectStep.review_questionnaire,
    ProjectStep.architecture_diagram,
    ProjectStep.run_assessment,
    ProjectStep.resolve_conflicts,
    ProjectStep.view_threat_scenarios,
    ProjectStep.resolve_issues,
];

export enum ProjectStepStatus {
    aborted = -1,
    new = 0,
    inProgress = 1,
    complete = 2,
}

export enum ProjectStepLabel {
    aborted = "Aborted",
    new = "New",
    inProgress = "In Progress",
    completed = "Completed",
}

export const ProjectStepStatusLabel: Record<ProjectStepStatus, string> = {
    [ProjectStepStatus.aborted]: ProjectStepLabel.aborted,
    [ProjectStepStatus.new]: ProjectStepLabel.new,
    [ProjectStepStatus.inProgress]: ProjectStepLabel.inProgress,
    [ProjectStepStatus.complete]: ProjectStepLabel.completed,
};

export const ProjectStepStatusColor: Record<ProjectStepStatus, string> = {
    [ProjectStepStatus.aborted]: "error",
    [ProjectStepStatus.new]: "default",
    [ProjectStepStatus.inProgress]: "warning",
    [ProjectStepStatus.complete]: "success",
};

export const resolveProjectStepStatus = (status: unknown): ProjectStepStatus => {
    return Object.values(ProjectStepStatus).includes(status as ProjectStepStatus)
        ? (status as ProjectStepStatus)
        : ProjectStepStatus.new;
};
