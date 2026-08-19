class EdgeDescription:
    def __init__(self):
        pass

    @staticmethod
    def RDF_triple(edge, src_vertex, tgt_vertex, vertex_desc_fn):
        connection_name = ""

        if edge["type"] == "data_flow":
            connection_name = "dataflowTo"
        elif edge["type"] == "architecture":
            connection_name = "connectedTo"

        src_desc = vertex_desc_fn(src_vertex)
        tgt_desc = vertex_desc_fn(tgt_vertex)

        return f"({src_desc}, {connection_name}, {tgt_desc})"

    @staticmethod
    def arrow(edge, src_vertex, tgt_vertex, vertex_desc_fn):
        src_desc = vertex_desc_fn(src_vertex)
        tgt_desc = vertex_desc_fn(tgt_vertex)

        return f"{src_desc} -> {tgt_desc}"

    @staticmethod
    def get_dataflow_path(list_vertex, vertex_desc_fn):
        result = " -> ".join([vertex_desc_fn(v) for v in list_vertex])

        return result
