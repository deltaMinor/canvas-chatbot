import { Metadata } from ".";

export interface FeedbackFormFields {
    email: string;
    feedback_content: string;
    feedback_id: string;
    feedback_type: string;
    user_id: string;
    username: string;
    //
    metadata: Metadata;
}

export enum FeedbackFormFieldsEnum {
    feedback_id = "feedback_id",
    feedback_content = "feedback_content",
    feedback_type = "feedback_type",
    user_id = "user_id",
    username = "username",
    email = "email",
    metadata = "metadata",
    //
    created_on = "created_on",
    modified_on = "modified_on",
}

export enum FeedbackFormTypeKey {
    suggestion = "suggestion",
    bug = "bug",
}
