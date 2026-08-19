export enum DisplayTableCellAvatarVariant {
    default = "default",
    outlined = "outlined",
}

export enum DisplayChipVariant {
    default = "default",
    outlined = "outlined",
}

export enum ActiveNavKey {
    home = "home",
    resources = "resources",
    feedback = "feedback",
    admin = "admin",
    user = "user",
}

export enum PolicyFieldsEnum {
    text = "text",
    category = "category",
    domain = "domain",
    subdomain = "subdomain",
    //
    actions = "actions",
    id = "id",
    policy_ref = "policy_ref",
    std_ref = "std_ref",
    guideline_ref = "guideline_ref",
    annex_ref = "annex_ref",
    footnote_ref = "footnote_ref",
    tags = "tags",
    image_name = "image_name",
    image_url = "image_url",
    mitigations = "mitigations",
    in_scope = "in_scope",
    is_auto_compliant = "is_auto_compliant",
}

export enum PolicyTableActionLabel {
    view = "View",
    add = "Add",
    remove = "Remove",
}

export enum GenericFieldsEnum {
    __check__ = "__check__",
    actions = "actions",
}

export enum MuiDataGridAction {
    accept = "accept",
    delete = "delete",
    edit = "edit",
    hide = "hide",
    markDone = "markDone",
    markUndone = "markUndone",
    unhide = "unhide",
    view = "view",
}

export enum MuiDataGridActionItemVariant {
    icon = "icon",
    text = "text",
}

export enum MuiFilterButtonKey {
    category = "category",
    groupLocation = "groupLocation",
    location = "location",
    source = "source",
    accepted = "accepted",
    completed = "completed",
    hidden = "hidden",
    obsolete = "obsolete",
    resolved = "resolved",
    showAll = "showAll",
    xMitreDomains = "xMitreDomains",
    projectStatus = "projectStatus",
}

export enum ProgressChartTypeKey {
    total_mitigation = "total_mitigation",
    domain_mitigation = "domain_mitigation",
    im8_compliance = "im8_compliance",
}

export enum StatsChartType {
    donut = "donut",
    radial = "radial",
    trendCard = "trendCard",
    bar = "bar",
}
