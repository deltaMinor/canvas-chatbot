class AttackStepStruc:
    step_struc = """
    {
        "steps": list[
            {
                "attack_id": str,
                "attack_name": str,
                "system_component": str
            }
        ]
    }
    """

    step_impact_struc = """
    {
        "steps": list[
            {
                "attack_id": str,
                "attack_name": str,
                "final_impact": str,
                "system_component": str
            }
        ]
    }
    """

    schema = {
        "type": "object",
        "properties": {
            "steps": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "attack_id": {"type": "string"},
                        "attack_name": {"type": "string"},
                        "system_component": {"type": "string"},
                        "final_impact": {"type": "string"},
                    },
                    "required": [
                        "attack_id",
                        "attack_name",
                        "system_component",
                    ],
                },
            },
        },
        "required": ["steps"],
    }
