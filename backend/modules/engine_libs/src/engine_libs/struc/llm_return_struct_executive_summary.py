class ExecutiveSummaryStruc:
    # Human-readable structure shown to the model in the repair prompt
    # (GeneralLLMBase.repair_json -> repair_prompt {json_struc}). Mirrors the
    # "Output:" contract of the executive_summary prompt template
    # (kb_llm_prompt.json). The three top-level sections are fixed; the inner
    # section headers are dynamically generated per scenario, hence "<header>".
    summary_struc = """
        {
            "attack_summary": {
                "<section header>": list[str]
            },
            "business_impact": {
                "<section header>": list[str]
            },
            "recommended_mitigations": {
                "<section header>": list[str]
            }
        }
    """

    # The prompt fixes the three top-level sections but leaves the inner section
    # names dynamic ("Inner section names should be dynamically generated"), so
    # each section is validated as an object mapping any header to an array of
    # short bullet strings rather than against a fixed set of inner keys.
    _section_schema = {
        "type": "object",
        "additionalProperties": {
            "type": "array",
            "items": {"type": "string"},
        },
    }

    schema = {
        "type": "object",
        "properties": {
            "attack_summary": _section_schema,
            "business_impact": _section_schema,
            "recommended_mitigations": _section_schema,
        },
        "required": [
            "attack_summary",
            "business_impact",
            "recommended_mitigations",
        ],
    }
