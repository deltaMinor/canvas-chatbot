export enum ActiveNavKey {
    home = "home",
    resources = "resources",
    feedback = "feedback",
    admin = "admin",
    user = "user",
}

export const ACTIVE_NAV_KEY_BY_ROUTE: Record<string, ActiveNavKey> = {
    "/home": ActiveNavKey.home,
    "/knowledge_base/master_mitigation": ActiveNavKey.resources,
    "/knowledge_base/master_risk_register": ActiveNavKey.resources,
    "/knowledge_base/mitre_database": ActiveNavKey.resources,
    "/knowledge_base/im8": ActiveNavKey.resources,
    "/knowledge_base/csa_ccop": ActiveNavKey.resources,
    "/knowledge_base/nist_csf": ActiveNavKey.resources,
    "/knowledge_base/isoiec_27001": ActiveNavKey.resources,
    "/knowledge_base/owasp": ActiveNavKey.resources,
    "/knowledge_base/attack_flows": ActiveNavKey.resources,
    "/feedback_form": ActiveNavKey.feedback,
    "/admin_console": ActiveNavKey.admin,
    "/master_console": ActiveNavKey.admin,
    "/feedback_viewer": ActiveNavKey.admin,
    "/user/profile": ActiveNavKey.user,
};
