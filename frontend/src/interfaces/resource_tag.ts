import { Metadata } from ".";

export interface ResourceTagFields {
    tag_id: string;
    tag_name: string;
    parent_tag_id: string;
    parent_tag_name?: string;
    root_tag_name?: string;
    tier_level?: number;
    tag_id_list?: string[];
    metadata?: Metadata;
}

export enum ResourceTag {
    parent_tag_id = "parent_tag_id",
    parent_tag_name = "parent_tag_name",
    root_tag_name = "root_tag_name",
    tier_level = "tier_level",
    tag_id = "tag_id",
    tag_id_list = "tag_id_list",
    tag_name = "tag_name",
}

export enum ResourceTagTableField {
    tag_id = "tag_id",
    tag_name = "tag_name",
    parent_tag_id = "parent_tag_id",
    parent_tag_name = "parent_tag_name",
    root_tag_name = "root_tag_name",
    tier_level = "tier_level",
    //
    created_on = "created_on",
    modified_on = "modified_on",
    actionMenu = "actionMenu",
}
