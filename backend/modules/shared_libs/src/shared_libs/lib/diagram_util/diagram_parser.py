import logging

from shared_libs.models.database_models import KbToscaModel

"""
.\\.venv\\Scripts\\python.exe -m service.lib.llm.main
"""

logger = logging.getLogger(__name__)


def setup_loggers() -> None:
    logger.setLevel(logging.DEBUG)


def get_tosca_mapping(kb_tosca) -> dict[str, str]:
    kb_tosca_model = KbToscaModel(**kb_tosca)
    tosca_mapping = kb_tosca_model.tosca_mapping

    enumerated_tosca_mapping = {}
    if tosca_mapping is None:
        return enumerated_tosca_mapping

    mapping_to_individual = (
        tosca_mapping.mapping_to_individual.model_dump()
        if tosca_mapping.mapping_to_individual is not None
        else {}
    )
    for v in mapping_to_individual.values():
        enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}
    mapping_to_class = (
        tosca_mapping.mapping_to_class.model_dump()
        if tosca_mapping.mapping_to_class is not None
        else {}
    )
    for v in mapping_to_class.values():
        enumerated_tosca_mapping = {**enumerated_tosca_mapping, **v}

    return enumerated_tosca_mapping


def main() -> None:
    setup_loggers()
    logger.warning(
        "diagram_parser main() is a local debug helper and requires explicit input paths."
    )
    return


if __name__ == "__main__":
    main()
