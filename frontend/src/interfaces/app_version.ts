export interface ReleaseUpdateFields {
    feature_name: string;
    update_type: UpdateTypeEnum;
    remarks: string;
}

export interface AppVersionFields {
    version_number: string;
    release_updates: ReleaseUpdateFields[];
    tags: string[];
}

export enum UpdateTypeEnum {
    features = "Features",
    bug_fixes = "Bug Fixes",
}
