import React from "react";

import { CancelOutlined, RadioButtonUnchecked, RotateLeft, TaskAlt } from "@mui/icons-material";

import { ProjectStepStatus, resolveProjectStepStatus } from "#root/constants/stepper";

interface ProjectStepStatusIconProps {
    status: ProjectStepStatus;
}

const ProjectStepStatusIconAborted = () => <CancelOutlined color="error" />;

const ProjectStepStatusIconNew = () => <RadioButtonUnchecked color="secondary" />;

const ProjectStepStatusIconInProgress = () => <RotateLeft color="warning" />;

const ProjectStepStatusIconComplete = () => <TaskAlt color="success" />;

const iconByStatus: Record<ProjectStepStatus, React.FC> = {
    [ProjectStepStatus.aborted]: ProjectStepStatusIconAborted,
    [ProjectStepStatus.new]: ProjectStepStatusIconNew,
    [ProjectStepStatus.inProgress]: ProjectStepStatusIconInProgress,
    [ProjectStepStatus.complete]: ProjectStepStatusIconComplete,
};

interface ProjectStepStatusIconCompound extends React.FC<ProjectStepStatusIconProps> {
    Aborted: React.FC;
    New: React.FC;
    InProgress: React.FC;
    Complete: React.FC;
}

const ProjectStepStatusIconComponent: React.FC<ProjectStepStatusIconProps> = ({ status }) => {
    const IconComponent = iconByStatus[resolveProjectStepStatus(status)];
    return <IconComponent />;
};

const ProjectStepStatusIcon = React.memo(
    ProjectStepStatusIconComponent
) as unknown as ProjectStepStatusIconCompound;

ProjectStepStatusIcon.Aborted = ProjectStepStatusIconAborted;
ProjectStepStatusIcon.New = ProjectStepStatusIconNew;
ProjectStepStatusIcon.InProgress = ProjectStepStatusIconInProgress;
ProjectStepStatusIcon.Complete = ProjectStepStatusIconComplete;

export default ProjectStepStatusIcon;
