import base64
import io
import logging

from shared_libs.models.diagram_layout_hints import (
    DiagramLayoutHintImage,
    DiagramLayoutHints,
)

logger = logging.getLogger(__name__)

PNG_DATA_URL_PREFIX = "data:image/png;base64,"
JPG_DATA_URL_PREFIX = "data:image/jpeg;base64,"
JPG_DATA_URL_PREFIX_ALT = "data:image/jpg;base64,"
WEBP_DATA_URL_PREFIX = "data:image/webp;base64,"


class DiagramLayoutUtil:
    @staticmethod
    def _decode_image_data_url(data_url: str) -> bytes:
        prefixes = (
            PNG_DATA_URL_PREFIX,
            JPG_DATA_URL_PREFIX,
            JPG_DATA_URL_PREFIX_ALT,
            WEBP_DATA_URL_PREFIX,
        )
        for prefix in prefixes:
            if data_url.startswith(prefix):
                return base64.b64decode(data_url[len(prefix) :])
        return b""

    @staticmethod
    def build_layout_hints_from_data_url(data_url: str) -> DiagramLayoutHints:
        """
        Build a minimal layout-hints envelope from an image data URL.

        This intentionally provides only image dimensions right now.
        Full node/container detection can populate nodes/containers later
        without changing the downstream contract.
        """
        hints = DiagramLayoutHints()
        image_bytes = DiagramLayoutUtil._decode_image_data_url(data_url)
        if not image_bytes:
            return hints

        try:
            from PIL import Image

            with Image.open(io.BytesIO(image_bytes)) as image:
                hints.image = DiagramLayoutHintImage(
                    width=image.width, height=image.height
                )
        except Exception:
            logger.exception(
                "[ RR-LLM ] Failed to parse image dimensions for layout hints."
            )

        return hints
