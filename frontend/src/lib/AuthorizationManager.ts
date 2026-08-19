import { IsAuthorized, UserAuthorization } from "#root/interfaces/authorization";

interface AuthorizationManagerDataProps {
    user_id?: string;
    tag_id?: string;
}

/**
 * Manager class for handling authorization checks across different resource types.
 * Provides methods to check permissions for tags, projects, users, and individual fields
 * with support for hierarchical field authorization.
 */
export class AuthorizationManager {
    authorization = {} as UserAuthorization;
    user_id = "";
    tag_id = "";

    /**
     * Creates an instance of AuthorizationManager.
     *
     * @param authorization - The user authorization object containing permissions and mappings.
     * @param data - Optional data object containing user_id and/or tag_id.
     */
    constructor(
        authorization: UserAuthorization, //
        data?: AuthorizationManagerDataProps
    ) {
        this.authorization = authorization;
        this.user_id = data?.user_id || "";
        this.tag_id = data?.tag_id || "";
    }

    /**
     * Checks if the user is authorized for a specific permission on a tag resource.
     *
     * @param permission - The permission string to check (e.g., "read", "write", "delete").
     * @returns True if user is superuser or has the permission for the tag, false otherwise.
     */
    checkIfTagResourceAuthorized(permission: string) {
        if (!permission || !this.tag_id) return false;
        return (
            !!this.authorization?.is_superuser ||
            !!this.authorization?.tag_permissions_mapping?.[this.tag_id]?.includes(permission)
        );
    }

    /**
     * Checks if the user is authorized for a specific permission on a project resource.
     *
     * @param permission - The permission string to check (e.g., "read", "write", "delete").
     * @param project_id - The project id to check against the project permission mapping.
     * @returns True if user is superuser or has the permission for the project, false otherwise.
     */
    checkIfProjectResourceAuthorized(permission: string, project_id?: string | null) {
        if (!permission || !project_id) return false;
        return (
            !!this.authorization?.is_superuser ||
            !!this.authorization?.project_permissions_mapping?.[project_id]?.includes(permission)
        );
    }

    /**
     * Checks if the user is authorized for a specific permission on a user resource.
     *
     * @param permission - The permission string to check (e.g., "read", "write", "delete").
     * @returns True if user is superuser or has the permission for the user, false otherwise.
     */
    checkIfUserResourceAuthorized(permission: string) {
        if (!permission || !this.user_id) return false;
        return (
            !!this.authorization?.is_superuser ||
            !!this.authorization?.user_permissions_mapping?.[this.user_id]?.includes(permission)
        );
    }

    /**
     * Checks if the user is authorized for a specific general permission.
     *
     * @param permission - The permission string to check (e.g., "read", "write", "delete").
     * @returns True if user is superuser or has the permission in their general permissions, false otherwise.
     */
    checkIfAuthorized(permission: string) {
        if (!permission) return false;
        return (
            !!this.authorization?.is_superuser ||
            !!this.authorization?.permissions?.includes(permission)
        );
    }

    /**
     * Checks if the user is authorized for a field resource, considering parent field authorization.
     * Authorization is granted if the user is a superuser, has parent field authorization,
     * has the field permission, or has the permission in the project permissions mapping.
     *
     * @param parent_field_authorization - Boolean indicating if the parent field is authorized.
     * @param field_permission - The permission string to check for the field.
     * @returns True if authorized, false otherwise.
     */
    checkIfFieldResourceAuthorized(
        parent_field_authorization: boolean,
        field_permission: string,
        project_id?: string | null
    ) {
        return (
            !!this.authorization?.is_superuser ||
            !!parent_field_authorization ||
            !!this.authorization?.permissions?.includes(field_permission) ||
            !!this.authorization?.project_permissions_mapping?.[project_id ?? ""]?.includes(
                field_permission
            )
        );
    }

    /**
     * Recursively computes authorization status for all fields in an object.
     * Creates an authorization object with create, read, update, and delete permissions
     * for each field, and recursively processes nested fields.
     *
     * @param ref_obj - The reference object to compute authorization for.
     * @param ref_obj_authorization - The authorization object for the parent/root object.
     * @param field_permissions - Mapping of field names to their permission configurations.
     * @returns An object with authorization status for each field, including nested fields.
     */
    getIsAuthorizedFields<T>(
        ref_obj: T, //
        ref_obj_authorization: IsAuthorized,
        field_permissions: { [key: string]: IsAuthorized<string> },
        project_id?: string | null
    ) {
        const ref_dict = { ...ref_obj } as Record<string, unknown>;
        return Object.keys(ref_obj || {})?.reduce(
            (acc, key) => {
                const field_permission = field_permissions?.[key as keyof typeof field_permissions];
                acc[key] = {
                    create: this.checkIfFieldResourceAuthorized(
                        !!ref_obj_authorization?.create, //
                        field_permission?.create || "",
                        project_id
                    ),
                    read: this.checkIfFieldResourceAuthorized(
                        !!ref_obj_authorization?.read, //
                        field_permission?.read || "",
                        project_id
                    ),
                    update: this.checkIfFieldResourceAuthorized(
                        !!ref_obj_authorization?.update, //
                        field_permission?.update || "",
                        project_id
                    ),
                    delete: this.checkIfFieldResourceAuthorized(
                        !!ref_obj_authorization?.delete, //
                        field_permission?.delete || "",
                        project_id
                    ),
                };
                if (!!field_permission?.fields) {
                    const _ref_obj =
                        (Array.isArray(ref_dict?.[key]) ? ref_dict?.[key]?.[0] : ref_dict?.[key]) ||
                        {};
                    acc[key]["fields"] = this.getIsAuthorizedFields<T>(
                        _ref_obj,
                        acc[key],
                        field_permission?.fields,
                        project_id
                    );
                }
                return acc;
            },
            {} as { [key: string]: IsAuthorized }
        );
    }

    /**
     * Updates an authorization object with field-level authorizations computed recursively.
     * Modifies the provided isAuthorized object by adding a "fields" property with
     * nested field authorizations.
     *
     * @param ref_obj - The reference object to compute authorization for.
     * @param isAuthorized - The authorization object to update with field authorizations.
     * @param field_permissions - Mapping of field names to their permission configurations.
     */
    updateIsAuthorizedFields<T>(
        ref_obj: T, //
        isAuthorized: IsAuthorized,
        field_permissions: { [key: string]: IsAuthorized<string> },
        project_id?: string | null
    ) {
        isAuthorized["fields"] = this.getIsAuthorizedFields<T>(
            ref_obj, //
            isAuthorized,
            field_permissions,
            project_id
        );
    }
}
