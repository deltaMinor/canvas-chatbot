import { AuditLog } from "#root/interfaces";

/**
 * Calculates and formats the time elapsed since a given timestamp
 */
export const getTimeAgo = (timestamp: string): string => {
    try {
        // Get current time and convert to UTC to match GMT timestamp
        const now = new Date();

        const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        const logTime = new Date(timestamp);

        const diffInMs = nowUTC.getTime() - logTime.getTime();
        // Convert to different units
        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365.25);

        if (years > 0) {
            return `${years} year${years > 1 ? "s" : ""} ago`;
        } else if (months > 0) {
            return `${months} month${months > 1 ? "s" : ""} ago`;
        } else if (weeks > 0) {
            return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        } else if (days > 0) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else {
            return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
        }
    } catch {
        return "unknown time ago";
    }
};

/**
 * Formats target key to be more readable
 */
export const formatTargetKey = (targetKey: string): string => {
    const targetMap: Record<string, string> = {
        // Risk Register section
        master_mitigation: "Master Mitigation",
        master_register: "Master Register",
        project_register: "Project Register",
        project_assessment: "Project Register History",
        master_mitigation_mapping: "Master Mitigation Mapping",

        // Application section
        feedback_form: "Feedback Form",
        master_cq: "Master Questionnaire",
        master_cq_template: "Master Questionnaire Template",
        project_cq: "Project Questionnaire",
        project_cq_template: "Project Questionnaire Template",
        projects: "Projects",
        resource_tag: "Resource Tag",

        // Architecture Diagram section
        kb_tosca: "Knowledge Base TOSCA",
        master_ad_template: "Master Diagram Template",
        project_ad: "Project Diagram",
        project_ad_canvas: "Diagram Canvas",
        project_ad_edge: "Diagram Edge",
        project_ad_node: "Diagram Node",
        project_cacti: "Project CACTI",
        project_diagram_file: "Diagram File",
        project_diagram_file_log: "Diagram File Log",

        // Authentication section
        tokens: "Tokens",
        users: "Users",

        // Field sections
        risk_scenarios: "Risk Scenarios",
        project_cacti_files: "Project CACTI Files",

        // Legacy/fallback entries
        project: "Project",
        threat: "Threat",
        mitigation: "Mitigation",
        scenario: "Scenario",
    };

    return targetMap[targetKey] || targetKey.replace(/_/g, " ");
};

/**
 * Extracts key-value pairs from identifiers as a string
 */
export const extractIdentifier = (auditLog: AuditLog): string => {
    // Check direct identifiers property first
    if (auditLog?.fieldChanges?.["identifiers"]) {
        const identifiers = auditLog?.fieldChanges?.["identifiers"];

        // Check if identifiers is an object
        if (identifiers) {
            // Extract just the values from identifiers
            return Object.values(identifiers)
                .map((value) => String(value))
                .join(", ");
        } else {
            // If identifiers is not an object, convert to string
            return String(identifiers);
        }
    }

    return "N/A";
};

/**
 * Formats action name to be more human-readable
 */
const formatAction = (action: string): string => {
    return action
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

/**
 * Creates a detailed human-readable summary for audit log display
 */
export const formatLogForHumanReadable = (auditLog: AuditLog) => {
    const { action, targetKey, fieldChanges, username } = auditLog;
    const target = formatTargetKey(targetKey);

    let changeCount = 0;
    let actionVerb = "";
    let suffix = "";

    if (
        fieldChanges?.["value"] &&
        typeof fieldChanges?.["value"] === "object" &&
        !Array.isArray(fieldChanges?.["value"])
    ) {
        // Helper function to calculate length of a field value
        const calculateFieldLength = (fieldValue: unknown) => {
            if (Array.isArray(fieldValue)) {
                return fieldValue.length;
            } else if (typeof fieldValue === "object" && fieldValue !== null) {
                return Object.keys(fieldValue).length;
            } else if (typeof fieldValue === "string") {
                return 1;
            } else {
                return 0; // Empty strings or other empty values don't count
            }
        };

        // Check if there's a nested 'values' object with field_uuid keys
        if (
            fieldChanges?.["value"]?.["values"]
            // &&
            // typeof fieldChanges?.["value"]?.["values"] === "object" &&
            // !Array.isArray(fieldChanges.value.values)
        ) {
            const valueObj = fieldChanges?.["value"] as Record<string, unknown> | undefined;
            const valuesObj = valueObj?.["values"] as Record<string, unknown> | undefined;
            if (valuesObj) {
                Object.keys(valuesObj).forEach((fieldKey) => {
                    if (fieldKey.startsWith("field_")) {
                        const fieldValue = valuesObj[fieldKey];
                        changeCount += calculateFieldLength(fieldValue);
                    }
                });
            }
        } else {
            // Look for direct values.field_uuid keys
            Object.keys(fieldChanges?.["value"]).forEach((key) => {
                if (key.startsWith("values.field_")) {
                    const fieldValue = (fieldChanges?.["value"] as Record<string, unknown>)[key];
                    changeCount += calculateFieldLength(fieldValue);
                }
            });
        }
    }

    switch (action.toLowerCase()) {
        case "create":
            actionVerb = "created";
            break;
        case "update":
        case "patch":
            actionVerb = "updated";
            if (changeCount > 0) {
                suffix = `${changeCount} field${changeCount > 1 ? "s" : ""} modified`;
            }
            break;
        case "delete":
            actionVerb = "deleted";
            break;
        default:
            actionVerb = `performed ${formatAction(action)} on`;
            if (changeCount > 0) {
                suffix = `${changeCount} field${changeCount > 1 ? "s" : ""} affected`;
            }
            break;
    }

    return {
        changeCount,
        fieldChanges,
        target,
        username,
        summary_parts: {
            username,
            action: actionVerb,
            target,
            suffix,
            changeCount,
            beforeTarget: `${username} ${actionVerb} `,
            afterTarget: "",
        },
    };
};
