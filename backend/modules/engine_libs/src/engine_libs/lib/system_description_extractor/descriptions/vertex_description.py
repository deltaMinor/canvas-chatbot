class VertexDescription:
    def __init__(self):
        pass

    @staticmethod
    def name(vertex):
        return f"{vertex['name']}"

    @staticmethod
    def name_and_type(vertex):
        return f"{vertex['name']} ({vertex['tosca_type']})"

    @staticmethod
    def sentence_description(vertex):
        return f"{vertex['name']} has a TOSCA type of '{vertex['tosca_type']}'."
