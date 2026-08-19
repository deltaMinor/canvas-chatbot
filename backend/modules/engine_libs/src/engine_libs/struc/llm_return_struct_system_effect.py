class SystemEffectStruc:
    effect_struc = """
         { "Privilege_obtained": list[
                {
                    "system_component": str,
                    "privilege_level": str
                }
            ],
             "Network_access_obtained": list[
                {
                    "system_component": str,
                    "access_level": str
                }
            ],
            "Process_obtained": list[
                {
                    "system_component": str,
                    "process_right_level": str
                }
            ]
        }
    """

    schema = {
        "type": "object",
        "properties": {
            "Privilege_obtained": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "system_component": {"type": "string"},
                        "privilege_level": {"type": "string"},
                    },
                },
            },
            "Network_access_obtained": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "system_component": {"type": "string"},
                        "access_level": {"type": "string"},
                    },
                },
            },
            "Process_obtained": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "system_component": {"type": "string"},
                        "process_right_level": {"type": "string"},
                    },
                },
            },
        },
        "required": [
            "Privilege_obtained",
            "Network_access_obtained",
            "Process_obtained",
        ],
    }
