/**
 * Formats identifier keys from snake_case to Title Case.
 * Example: "project_id" -> "Project ID"
 */
export const formatIdentifierKey = (key: string): string => {
    return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};
