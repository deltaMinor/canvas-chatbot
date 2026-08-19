class AttackPathStruc:
    attack_path_struc = """
    {
       "attack_paths": list[
           {
               "attack_path": list[
                   { "attack_id": str,
                     "attack_name": str,
                     "system_component": str
                   }
                ],
                "risk_scenario": str,
                "key_risk": str,
                "attack_narrative": {
                    "descriptions": list[str],
                    "techniques": list[str],
                    "remarks": list[str]
                }
            }
       ]
    }
    """

    example_json = """
    {
        "attack_paths": [
            {
                "attack_path": [
                    {
                        "attack_id":"T101",
                        "attack_name": "Weak Processes",
                        "system_component": "Web Server"
                    }
                ],
                "risk_scenario": "In the event that the attacker compromises weak processes on the web server, this may lead to exfiltration",
                "key_risk": "Weak Processes in System",
                "attack_narrative": {
                    "descriptions": [
                        "The adversary exploits weak processes on the web server."
                    ],
                    "techniques": [
                        "Weak Processes"
                    ],
                    "remarks": [
                        "The technique targets the web server component."
                    ]
                }
            }
        ]
    }
    """

    schema = {
        "type": "object",
        "properties": {
            "attack_paths": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "attack_path": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "attack_id": {"type": "string"},
                                    "attack_name": {"type": "string"},
                                    "system_component": {"type": "string"},
                                },
                                "required": [
                                    "attack_id",
                                    "attack_name",
                                    "system_component",
                                ],
                            },
                        },
                        "risk_scenario": {"type": "string"},
                        "key_risk": {"type": "string"},
                        "attack_narrative": {
                            "type": "object",
                            "properties": {
                                "descriptions": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                                "techniques": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                                "remarks": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": [
                                "descriptions",
                                "techniques",
                                "remarks",
                            ],
                        },
                    },
                    "required": [
                        "attack_path",
                        "risk_scenario",
                        "key_risk",
                        "attack_narrative",
                    ],
                },
            },
        },
        "required": ["attack_paths"],
    }
