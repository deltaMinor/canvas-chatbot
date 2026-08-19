from typing import Literal

from shared_libs.models.diagram_layout_hints import DiagramNodeAnchor, LayoutBbox


class DiagramAnchorUtil:
    @staticmethod
    def normalize_to_canvas_anchor(
        *,
        image_width: int,
        image_height: int,
        bbox: LayoutBbox,
        canvas_width: float,
        canvas_height: float,
        confidence: float,
    ) -> DiagramNodeAnchor:
        if image_width <= 0 or image_height <= 0:
            return DiagramNodeAnchor(
                x=0,
                y=0,
                width=max(80, bbox.w),
                height=max(80, bbox.h),
                confidence=confidence,
                layout_lock="none",
            )

        x = (bbox.x / image_width) * canvas_width
        y = (bbox.y / image_height) * canvas_height
        width = max(80, (bbox.w / image_width) * canvas_width)
        height = max(80, (bbox.h / image_height) * canvas_height)

        if confidence >= 0.85:
            lock: Literal["hard", "soft", "none"] = "hard"
        elif confidence >= 0.6:
            lock = "soft"
        else:
            lock = "none"

        return DiagramNodeAnchor(
            x=x,
            y=y,
            width=width,
            height=height,
            confidence=confidence,
            layout_lock=lock,
        )
