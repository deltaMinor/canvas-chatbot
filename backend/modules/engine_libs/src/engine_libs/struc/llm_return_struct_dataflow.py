class LLMReturnStructDataflow:
    dataflow_struc = """
    {
       "nodes": list[
           {
                "id": str,
               "data": {
                   "card_id": str,
                   "data_stored": list[str],
                   "icon": str,
                   "label": str,
                   "tosca_type": str
               }
           }
       ],
       "edges": list[
           {
               "id": str,
               "data": {
                   "card_id": str,
                   "source": str,
                   "target": str
               }
           }
       ]
    }
    """

    schema = {
        "type": "object",
        "properties": {
            "nodes": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "data": {
                            "type": "object",
                            "properties": {
                                "card_id": {"type": "string"},
                                "data_stored": {
                                    "type": "array",
                                    "minItems": 0,
                                    "items": {"type": "string"},
                                },
                                "icon": {"type": "string"},
                                "label": {"type": "string"},
                                "tosca_type": {"type": "string"},
                            },
                        },
                    },
                },
            },
            "edges": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "data": {
                            "type": "object",
                            "properties": {
                                "card_id": {"type": "string"},
                                "source": {"type": "string"},
                                "target": {"type": "string"},
                            },
                        },
                    },
                },
            },
        },
        "required": ["nodes", "edges"],
    }
