import logging

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class DotGraphGenerator:
    def __init__(self):
        pass

    @raise_exception(
        "Failed to assign random color to provider.",
        exception_logger=logger,
    )
    def _draw_subGrp(
        self,
        grping,
        fout,
        subGrp,
        subGrps,
        drawn,
        count,
    ):
        self._open_group(subGrp, fout)  # open subgraph
        if len(grping[subGrp]) != 0:
            for node in grping[subGrp]:
                if node in subGrps:
                    self._draw_subGrp(grping, fout, node, subGrps, drawn, count)
                else:
                    fout.write(f'"{node}" [shape = box];\n')
        else:
            fout.write(f"invis_node{len(count)} [style =invis]\n")
            count.append(1)
        self._close_group(fout)  # close subgraph
        drawn.append(subGrp)

    @raise_exception(
        "Failed to open group.",
        exception_logger=logger,
    )
    def _open_group(self, grp, fout):
        fout.write(f'subgraph "cluster_{grp}"')
        fout.write("{\n")
        fout.write(f'label = "{grp}";\n')

    @raise_exception(
        "Failed to close group.",
        exception_logger=logger,
    )
    def _close_group(self, fout):
        fout.write("}\n")

    @raise_exception(
        "Failed to draw from list.",
        exception_logger=logger,
    )
    def _draw_from_list(self, ls, fout):
        if len(ls) != 0:
            for element in ls:
                fout.write(f'"{element}" [shape = "box"];\n')

    @raise_exception(
        "Failed to draw non directed edges.",
        exception_logger=logger,
    )
    def _draw_nonDirectedEdges(self, fout, size, edges, element):
        updatedElement = element.split("(")[0]
        if size > 1:  # there's more than 1 link from the same node
            fout.write(f'"{updatedElement}"->')
            fout.write("{")
            for i in range(size):
                if i != size - 1:
                    fout.write(f'"{edges[element][i]}",')
                else:
                    fout.write(f'"{edges[element][i]}"[dir=none]')
                    fout.write("};\n")
        else:
            fout.write(f'"{updatedElement}"->"{edges[element][0]}"[dir=none];\n')

    @raise_exception(
        "Failed to draw directed edge.",
        exception_logger=logger,
    )
    def _draw_directedEdges(self, fout, size, edges, element):
        if size > 1:  # there's more than 1 link from the same node
            fout.write(f'"{element}"->')
            fout.write("{")
            for i in range(size):
                if i != size - 1:
                    fout.write(f'"{edges[element][i]}",')
                else:
                    fout.write(f'"{edges[element][i]}"')
                    fout.write("};\n")
        else:
            fout.write(f'"{element}"->"{edges[element][0]}";\n')

    @raise_exception(
        "Failed to draw dot graph.",
        exception_logger=logger,
    )
    def draw_dotGraph(
        self,
        outfile,
        outerResource,
        provider,
        edgeResource,
        indivResource,
        grping,
        subGroups,
        edges,
    ):
        # logger.log_variable("indivResource", indivResource)
        # logger.log_variable("edgeResource", edgeResource)
        # logger.log_variable("grpResource", outerResource)
        # logger.log_variable("subGroups", subGroups)
        drawn = []
        count = []
        with open(outfile, "w", encoding="utf-8") as fout:
            fout.write("digraph {\ncompound = true;\n")  # header
            # drawing outerNodes #
            self._draw_from_list(outerResource, fout)
            # draw connections #
            for element in edges:
                size = len(edges[element])
                if "none" not in element:
                    self._draw_directedEdges(fout, size, edges, element)
                else:
                    self._draw_nonDirectedEdges(fout, size, edges, element)

            # drawing provider #
            self._open_group(provider, fout)
            fout.write("labeljust=l;\n")

            # drawing edgeNode #
            self._draw_from_list(edgeResource, fout)

            # drawing nodes without grps
            self._draw_from_list(indivResource, fout)

            # drawing groupsNodes #
            for grp in grping:
                if grp not in drawn:
                    self._draw_subGrp(grping, fout, grp, subGroups, drawn, count)

            self._close_group(fout)
