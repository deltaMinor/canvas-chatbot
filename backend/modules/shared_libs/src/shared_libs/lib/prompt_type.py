def canonical_prompt_type(value: object) -> str:
    if isinstance(value, list):
        value = value[0] if value else None
    if isinstance(value, dict):
        canonical_name = str(value.get("canonicalName") or "").strip()
        if canonical_name:
            return canonical_name
        tags = value.get("tags")
        # Legacy data may only have stored the canonical prompt type as the first tag.
        if isinstance(tags, list):
            for tag in tags:
                tag_value = str(tag or "").strip()
                if tag_value:
                    return tag_value
        for key in ("value", "optionId"):
            prompt_type = str(value.get(key) or "").strip()
            if _is_canonical_prompt_type(prompt_type):
                return prompt_type
        raise ValueError("Prompt type must be canonicalName.")

    prompt_type = str(value or "").strip()
    if not _is_canonical_prompt_type(prompt_type):
        raise ValueError("Prompt type must be canonicalName.")
    return prompt_type


def _is_canonical_prompt_type(value: str) -> bool:
    return (
        bool(value)
        and not value.startswith("option_")
        and value == value.lower()
        and " " not in value
    )
