PDF_DATA_URL_PREFIX = "data:application/pdf;base64,"
PNG_DATA_URL_PREFIX = "data:image/png;base64,"
MAX_LLM_DIAGRAM_IMAGE_FILE_COUNT = 5
FALLBACK_IMAGE_CONTENT_TYPE = "image/png"

PROJECT_AD_FILE_TYPE_CACTI = "cacti"
PROJECT_AD_FILE_TYPE_DIAGRAM = "diagram"
PROJECT_AD_FILE_TYPE_GENERATED_JSON = "generated_json"
PROJECT_AD_FILE_TYPE_IMAGE = "image"
PROJECT_AD_FILE_TYPE_MODULE = "module"
PROJECT_AD_FILE_TYPE_PDF = "pdf"
PROJECT_AD_FILE_TYPE_PDF_DOCUMENT = "pdf_document"
PROJECT_AD_FILE_TYPE_TERRAFORM = "terraform"
PROJECT_AD_FILE_TYPE_XML = "xml"

# Fallback filename for a JSON file automatically saved to the database when
# TopologyGenerator (via IntentRX) produces a new network diagram, used when
# no topology run context (with a `file_name`) is recorded for the current
# run_id -- see `intentrx_bridge/topology_file_tracking.py`. Every generation
# is stored as its own row, distinguished by file_id/timestamp.
GENERATED_JSON_FILENAME = "diagram.json"
PROJECT_AD_LLM_IMAGE_FILE_TYPES = [
    PROJECT_AD_FILE_TYPE_IMAGE,
    PROJECT_AD_FILE_TYPE_PDF,
]

PROJECT_AD_FILE_SOURCE_DIRECT = "direct"
PROJECT_AD_FILE_SOURCE_CHATBOT = "chatbot"
PROJECT_AD_FILE_SOURCES = [
    PROJECT_AD_FILE_SOURCE_DIRECT,
    PROJECT_AD_FILE_SOURCE_CHATBOT,
]
