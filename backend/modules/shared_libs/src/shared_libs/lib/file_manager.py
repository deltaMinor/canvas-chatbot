import base64
import io

from django.core.files.uploadedfile import UploadedFile


class FileManager:
    @staticmethod
    def get_file_bytes(decoded_file: str) -> io.BytesIO:
        """Converts a decoded string to a BytesIO object."""
        encoded_file = decoded_file.encode("utf-8")
        return io.BytesIO(encoded_file)

    @staticmethod
    def get_decoded_file(file: UploadedFile) -> str:
        """Converts an uploaded file to a base64 encoded string."""
        bytestring = b""
        for chunk in file.chunks(chunk_size=1024):
            bytestring += chunk
        return base64.b64encode(bytestring).decode("utf-8")
