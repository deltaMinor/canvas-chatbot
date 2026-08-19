import { OptionLabel } from ".";

import { ProjectProps } from "./common";
import { UserNonSensitiveCoreFields } from "./user";

export interface Integration extends Pick<UserNonSensitiveCoreFields, "user_id"> {
    jira_configurations: JiraConfiguration[];
}

export interface JiraConfiguration extends ProjectProps {
    jiraApiToken: string;
    jiraUsername: string;
    status: string;
    timestamp: string;
}

export enum IntegrationJiraFieldKey {
    jiraApiToken = "jiraApiToken",
    jiraUsername = "jiraUsername",
}

export interface JiraDescriptionField {
    content: JiraDescriptionField[];
    text: string;
}

export interface JiraIssue {
    assignee: OptionLabel;
    description: JiraDescriptionField;
    duedate: string;
    issuetype: OptionLabel;
    status: OptionLabel;
    summary: string;
}

export interface JiraIssueOptions extends ProjectProps {
    assignee: OptionLabel[];
    issuetype: OptionLabel[];
    status: OptionLabel[];
}
