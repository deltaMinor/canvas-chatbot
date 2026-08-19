import base64

from service.constants.llm_generation import PDF_DATA_URL_PREFIX, PNG_DATA_URL_PREFIX


def convert_pdf_data_url_to_png_data_url(pdf_data_url: str) -> str:
    import fitz

    encoded_pdf = pdf_data_url.removeprefix(PDF_DATA_URL_PREFIX)
    pdf_bytes = base64.b64decode(encoded_pdf)

    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        if doc.page_count == 0:
            return ""

        page = doc.load_page(0)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        png_bytes = pixmap.tobytes("png")

    return f"{PNG_DATA_URL_PREFIX}{base64.b64encode(png_bytes).decode('utf-8')}"
