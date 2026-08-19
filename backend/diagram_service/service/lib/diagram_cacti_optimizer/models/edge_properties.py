from shared_libs.types.enum import Handle

from .edge_style import EdgeStyle


class EdgeProperties(EdgeStyle):
    def __init__(
        self,
        source_handle=Handle.SOURCE_BOTTOM.value,
        target_handle=Handle.TARGET_TOP.value,
        z_index=0,
    ):
        super().__init__()
        self.source_handle = source_handle
        self.target_handle = target_handle
        self.zIndex = z_index
