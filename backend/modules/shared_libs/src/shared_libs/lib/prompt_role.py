def prompt_role_label(value: object) -> str:
    if isinstance(value, list):
        value = value[0] if value else None
    if isinstance(value, dict):
        for key in ("label", "value"):
            role = str(value.get(key) or "").strip()
            if role and not _is_invalid_role_label(role):
                return role
        raise ValueError("Prompt role must be a label.")

    role = str(value or "").strip()
    if _is_invalid_role_label(role):
        raise ValueError("Prompt role must be a label.")
    return role


def _is_invalid_role_label(value: str) -> bool:
    return value.startswith("option_") or ("_" in value and " " not in value)
