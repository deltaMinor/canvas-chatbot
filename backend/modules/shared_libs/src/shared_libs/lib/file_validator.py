import csv
import io
import json
import xml.etree.ElementTree as ET
import zipfile

from django.core.files.uploadedfile import UploadedFile

# ---------------------------------------------------------------------------
# Extension sets
# ---------------------------------------------------------------------------

IMAGE_EXTENSIONS: frozenset[str] = frozenset(
    {".bmp", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"}
)
MARKDOWN_EXTENSIONS: frozenset[str] = frozenset({".md", ".markdown"})
PDF_EXTENSIONS: frozenset[str] = frozenset({".pdf"})
CSV_EXTENSIONS: frozenset[str] = frozenset({".csv"})
TEXT_EXTENSIONS: frozenset[str] = frozenset({".txt", ".text"})
YAML_EXTENSIONS: frozenset[str] = frozenset({".yaml", ".yml"})

# ---------------------------------------------------------------------------
# MIME type sets
# ---------------------------------------------------------------------------

IMAGE_CONTENT_TYPES: frozenset[str] = frozenset(
    {
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
    }
)
MARKDOWN_CONTENT_TYPES: frozenset[str] = frozenset({"text/markdown", "text/x-markdown"})
CSV_CONTENT_TYPES: frozenset[str] = frozenset({"text/csv", "application/csv"})
YAML_CONTENT_TYPES: frozenset[str] = frozenset(
    {"application/yaml", "text/yaml", "application/x-yaml"}
)

# ---------------------------------------------------------------------------
# Magic bytes
# ---------------------------------------------------------------------------

_PNG_MAGIC = b"\x89PNG\r\n\x1a\n"  # 8 bytes
_JPEG_MAGIC = b"\xff\xd8\xff"  # 3 bytes
_GIF87_MAGIC = b"GIF87a"  # 6 bytes
_GIF89_MAGIC = b"GIF89a"  # 6 bytes
_BMP_MAGIC = b"BM"  # 2 bytes
_WEBP_RIFF = b"RIFF"  # bytes 0-3
_WEBP_TAG = b"WEBP"  # bytes 8-11
_PDF_MAGIC = b"%PDF-"  # 5 bytes


class FileValidator:
    # ------------------------------------------------------------------
    # Extension / MIME type checks
    # ------------------------------------------------------------------

    @staticmethod
    def has_allowed_extension(filename: str, allowed_extensions: list[str]) -> bool:
        """True when filename ends with one of the allowed extensions (case-insensitive)."""
        name = (filename or "").lower()
        return any(name.endswith(ext.lower()) for ext in allowed_extensions)

    @staticmethod
    def has_allowed_content_type(
        content_type: str, allowed_content_types: list[str]
    ) -> bool:
        """True when content_type matches one of the allowed MIME types (case-insensitive)."""
        ct = (content_type or "").lower()
        return ct in {t.lower() for t in allowed_content_types}

    @staticmethod
    def has_image_extension(filename: str) -> bool:
        """True when filename has a recognised raster or vector image extension."""
        name = (filename or "").lower()
        return any(name.endswith(ext) for ext in IMAGE_EXTENSIONS)

    @staticmethod
    def is_image_content_type(content_type: str) -> bool:
        """True when content_type starts with 'image/'."""
        return (content_type or "").lower().startswith("image/")

    @staticmethod
    def has_markdown_extension(filename: str) -> bool:
        """True when filename has a .md or .markdown extension."""
        name = (filename or "").lower()
        return any(name.endswith(ext) for ext in MARKDOWN_EXTENSIONS)

    # ------------------------------------------------------------------
    # Size / empty checks
    # ------------------------------------------------------------------

    @staticmethod
    def is_within_size_limit(size_bytes: int, max_size_bytes: int) -> bool:
        """True when size_bytes does not exceed max_size_bytes."""
        return size_bytes <= max_size_bytes

    @staticmethod
    def is_non_empty(data: bytes) -> bool:
        """True when the byte content is not empty."""
        return bool(data)

    # ------------------------------------------------------------------
    # Structured / text format validation (bytes-based)
    # ------------------------------------------------------------------

    @staticmethod
    def is_valid_json(data: bytes) -> bool:
        """True when data can be decoded and parsed as JSON."""
        try:
            json.loads(data)
            return True
        except (ValueError, UnicodeDecodeError):
            return False

    @staticmethod
    def parse_json(data: bytes) -> object | None:
        """Parse data as JSON and return the result, or None on failure."""
        try:
            return json.loads(data)
        except (ValueError, UnicodeDecodeError):
            return None

    @staticmethod
    def is_valid_zip(data: bytes) -> bool:
        """True when data is a valid ZIP archive."""
        try:
            with zipfile.ZipFile(io.BytesIO(data)):
                return True
        except zipfile.BadZipFile:
            return False

    @staticmethod
    def is_valid_xml(data: bytes) -> bool:
        """True when data is well-formed XML."""
        try:
            ET.fromstring(data)
            return True
        except ET.ParseError:
            return False

    @staticmethod
    def xml_root_tag(data: bytes) -> str | None:
        """Return the root element tag of well-formed XML, or None on parse failure."""
        try:
            return ET.fromstring(data).tag
        except ET.ParseError:
            return None

    @staticmethod
    def is_valid_csv(data: bytes) -> bool:
        """True when data decodes as UTF-8 (with optional BOM) and contains at least one row."""
        try:
            text = data.decode("utf-8-sig")
            reader = csv.reader(io.StringIO(text))
            next(reader)
            return True
        except (UnicodeDecodeError, StopIteration, csv.Error):
            return False

    @staticmethod
    def is_valid_text(data: bytes) -> bool:
        """True when data is non-empty and decodable as UTF-8."""
        if not data:
            return False
        try:
            data.decode("utf-8")
            return True
        except UnicodeDecodeError:
            return False

    # ------------------------------------------------------------------
    # Image format magic-byte checks
    # ------------------------------------------------------------------

    @staticmethod
    def is_valid_png(data: bytes) -> bool:
        """True when data starts with the 8-byte PNG magic signature."""
        return data[:8] == _PNG_MAGIC

    @staticmethod
    def is_valid_jpeg(data: bytes) -> bool:
        """True when data starts with the JPEG SOI + marker bytes (FF D8 FF)."""
        return data[:3] == _JPEG_MAGIC

    @staticmethod
    def is_valid_gif(data: bytes) -> bool:
        """True when data starts with a GIF87a or GIF89a header."""
        return data[:6] in (_GIF87_MAGIC, _GIF89_MAGIC)

    @staticmethod
    def is_valid_bmp(data: bytes) -> bool:
        """True when data starts with the BMP 'BM' file signature."""
        return data[:2] == _BMP_MAGIC

    @staticmethod
    def is_valid_webp(data: bytes) -> bool:
        """True when data carries the RIFF/WEBP container signature."""
        return len(data) >= 12 and data[:4] == _WEBP_RIFF and data[8:12] == _WEBP_TAG

    @staticmethod
    def is_valid_svg(data: bytes) -> bool:
        """True when data is well-formed XML whose root element is <svg ...>
        (handles both plain and namespace-qualified tags)."""
        try:
            tag = ET.fromstring(data).tag
            return tag == "svg" or tag.endswith("}svg")
        except ET.ParseError:
            return False

    # ------------------------------------------------------------------
    # PDF / Markdown / plain-text content checks
    # ------------------------------------------------------------------

    @staticmethod
    def is_valid_pdf(data: bytes) -> bool:
        """True when data begins with the %PDF- magic bytes."""
        return data[:5] == _PDF_MAGIC

    @staticmethod
    def is_valid_markdown(data: bytes) -> bool:
        """True when data is non-empty and decodable as UTF-8 text.
        Markdown has no binary signature; structural validity is not checked."""
        return FileValidator.is_valid_text(data)

    # ------------------------------------------------------------------
    # UploadedFile helpers
    # ------------------------------------------------------------------

    @staticmethod
    def read_uploaded_file(file: UploadedFile) -> bytes:
        """Read all bytes from an UploadedFile and seek back to the start."""
        data = b"".join(file.chunks())
        if hasattr(file, "seek"):
            file.seek(0)
        return data

    @classmethod
    def is_valid_json_upload(cls, file: UploadedFile) -> bool:
        """True when the file is identified as JSON by extension or content type
        and its content is non-empty valid JSON."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_allowed_extension(
            name, [".json"]
        ) and not cls.has_allowed_content_type(ct, ["application/json"]):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_json(data)

    @classmethod
    def is_valid_zip_upload(cls, file: UploadedFile) -> bool:
        """True when the file content is a non-empty, valid ZIP archive."""
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_zip(data)

    @classmethod
    def is_valid_xml_upload(cls, file: UploadedFile) -> bool:
        """True when the file content is non-empty, well-formed XML."""
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_xml(data)

    @classmethod
    def is_valid_image_upload(cls, file: UploadedFile) -> bool:
        """True when the file has a recognised image extension or image/* content type
        and is non-empty.  Use the format-specific methods (is_valid_png, etc.) to
        additionally verify the file signature."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_image_extension(name) and not cls.is_image_content_type(ct):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data)

    @classmethod
    def is_valid_svg_upload(cls, file: UploadedFile) -> bool:
        """True when the file is a non-empty, well-formed SVG document."""
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_svg(data)

    @classmethod
    def is_valid_pdf_upload(cls, file: UploadedFile) -> bool:
        """True when the file is identified as PDF by extension or content type
        and begins with the %PDF- magic bytes."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_allowed_extension(
            name, [".pdf"]
        ) and not cls.has_allowed_content_type(ct, ["application/pdf"]):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_pdf(data)

    @classmethod
    def is_valid_csv_upload(cls, file: UploadedFile) -> bool:
        """True when the file is identified as CSV by extension or content type
        and contains at least one parseable row."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_allowed_extension(
            name, list(CSV_EXTENSIONS)
        ) and not cls.has_allowed_content_type(ct, list(CSV_CONTENT_TYPES)):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_non_empty(data) and cls.is_valid_csv(data)

    @classmethod
    def is_valid_markdown_upload(cls, file: UploadedFile) -> bool:
        """True when the file has a Markdown extension or content type
        and is non-empty UTF-8 text."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_markdown_extension(name) and not cls.has_allowed_content_type(
            ct, list(MARKDOWN_CONTENT_TYPES)
        ):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_valid_markdown(data)

    @classmethod
    def is_valid_text_upload(cls, file: UploadedFile) -> bool:
        """True when the file is identified as plain text by extension or content type
        and is non-empty, UTF-8 decodable."""
        name = file.name or ""
        ct = file.content_type or ""
        if not cls.has_allowed_extension(
            name, list(TEXT_EXTENSIONS)
        ) and not cls.has_allowed_content_type(ct, ["text/plain"]):
            return False
        data = cls.read_uploaded_file(file)
        return cls.is_valid_text(data)
