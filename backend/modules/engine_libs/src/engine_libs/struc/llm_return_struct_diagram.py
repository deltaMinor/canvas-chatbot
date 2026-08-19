class LLMReturnStructDiagram:
    diagram_struc = """
    {
       "nodes": list[
           {
               "id": str,
               "parentId": str,
               "position": {
                   "x": int,
                   "y": int
               },
               "type": enum["clusterNode", "infoNode"],
               "zIndex": int,
               "width": int,
               "height": int,
               "data": {
                   "icon": str,
                   "label": str
               }
           }
       ],
       "edges": list[
           {
               "id": str,
               "source": str,
                "target": str
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
                        "parentId": {"type": "string"},
                        "position": {
                            "type": "object",
                            "properties": {
                                "x": {"type": "integer"},
                                "y": {"type": "integer"},
                            },
                        },
                        "type": {"type": "string"},
                        "zIndex": {"type": "integer"},
                        "width": {"type": "integer"},
                        "height": {"type": "integer"},
                        "data": {
                            "type": "object",
                            "properties": {
                                "icon": {"type": "string"},
                                "label": {"type": "string"},
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
                        "source": {"type": "string"},
                        "target": {"type": "string"},
                    },
                },
            },
        },
        "required": ["nodes", "edges"],
    }
