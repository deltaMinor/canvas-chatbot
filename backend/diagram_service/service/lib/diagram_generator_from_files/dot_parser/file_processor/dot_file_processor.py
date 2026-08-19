import re

from service.lib.diagram_generator_from_files.dot_parser.dot_parser_util import (
    DotParserUtil,
)


class DotFileProcessor(DotParserUtil):
    def __init__(self, dot_filename, asset_directory):
        self.dot_file = f"{asset_directory}/{dot_filename}"
        self.asset_directory = asset_directory
        self.graphs = []
        DotParserUtil.__init__(self)

    def parse_dot_file(self):
        graph_rows = []
        graph_type = ""
        graph_id = ""
        scanning = False
        graphs = []
        with open(self.dot_file, encoding="utf-8") as fin:
            for dot_file_row in fin:
                # TO DO: regex match make robust
                if re.search(r'subgraph "[\S]+" \{', dot_file_row.strip()):
                    graph_type = dot_file_row.strip().replace('"', "").split()[0]
                    graph_id = dot_file_row.strip().replace('"', "").split()[1]
                    scanning = True
                    continue
                if not bool(scanning):
                    continue
                if scanning and dot_file_row.strip() == "}":
                    graphs.append(
                        {
                            "graph_type": graph_type,
                            "graph_id": graph_id,
                            "graph_rows": graph_rows,
                        }
                    )
                    graph_rows = []
                    graph_type = ""
                    graph_id = ""
                    scanning = False
                    continue
                graph_rows.append(
                    dot_file_row.replace('"', "").replace("\\", "").strip()
                )
        self.write_file(
            self.asset_directory,
            "graphs.json",
            graphs,
        )
        self.graphs = graphs
        return self
