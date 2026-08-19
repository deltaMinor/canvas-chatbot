import { AuditLogActionKey } from "#root/interfaces/logs";

export const AuditLogActionColorMapping = {
    [AuditLogActionKey.create]: "#fff",
    [AuditLogActionKey.delete]: "#fff",
    [AuditLogActionKey.init]: "",
    [AuditLogActionKey.update]: "#fff",
    [AuditLogActionKey.patch]: "",
};

export const AuditLogActionBackgroundColorMapping = {
    [AuditLogActionKey.create]: "#5925dc",
    [AuditLogActionKey.delete]: "#d7260f",
    [AuditLogActionKey.init]: "",
    [AuditLogActionKey.update]: "#1f69ff",
    [AuditLogActionKey.patch]: "",
};
