from typing import Any


def _normalize_admin_key(value: Any) -> str:
    return str(value).strip().lower().replace("_", "").replace("-", "")


def has_admin_entitlement(entitlements: Any) -> bool:
    admin_keys = {
        "admin",
        "superadmin",
        "superuser",
        "adminpermissions",
        "superadminpermissions",
    }
    if not isinstance(entitlements, list):
        return False

    for entitlement in entitlements:
        if not isinstance(entitlement, dict):
            continue
        policies = entitlement.get("policies") or []
        roles = entitlement.get("roles") or []
        for key in [*policies, *roles]:
            if _normalize_admin_key(key) in admin_keys:
                return True
    return False


def derive_is_admin(
    *,
    is_superuser: bool | None,
    entitlements: Any,
    current_is_admin: bool | None,
) -> bool:
    if is_superuser is True:
        return True

    if has_admin_entitlement(entitlements):
        return True

    if isinstance(entitlements, list) and len(entitlements) == 0:
        return False

    return bool(current_is_admin)
