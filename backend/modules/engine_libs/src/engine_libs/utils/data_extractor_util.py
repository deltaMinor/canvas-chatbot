"""
Utility functions for nested value extraction from complex structures.
"""

import logging
from collections.abc import Callable
from typing import Any

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class DataExtractorUtil:
    @staticmethod
    @raise_exception(
        "Failed to retrieve nested value from structure",
        exception_logger=logger,
    )
    def get_value_from_structure_recursive(
        structure: Any,
        nested_address: str,
        retrieve_fn: Callable[[Any], Any] | None = None,
        attr_fn: Callable[[Any, str], Any] | None = None,
    ) -> Any:
        if retrieve_fn is None:

            def retrieve_fn(x):
                return x

        if attr_fn is None:

            def attr_fn(x, y):
                return x[y] if y in x else None

        nested_attr = nested_address.split(".")
        structure = retrieve_fn(structure)
        main_object = structure

        for attr in nested_attr:
            if main_object is not None:
                main_object = DataExtractorUtil._process_attribute_traversal(
                    main_object,
                    attr,
                    retrieve_fn,
                    attr_fn,
                )
                if main_object is None:
                    return None
            else:
                return None

        return main_object

    @staticmethod
    @raise_exception(
        "Failed to process attribute traversal",
        exception_logger=logger,
    )
    def _process_attribute_traversal(
        main_object: Any,
        attr: str,
        retrieve_fn: Callable[[Any], Any],
        attr_fn: Callable[[Any, str], Any],
    ) -> Any:
        if isinstance(main_object, list):
            return DataExtractorUtil._process_list_traversal(
                main_object,
                attr,
                retrieve_fn,
                attr_fn,
            )
        return DataExtractorUtil._process_object_traversal(
            main_object,
            attr,
            retrieve_fn,
            attr_fn,
        )

    @staticmethod
    @raise_exception(
        "Failed to process list traversal",
        exception_logger=logger,
    )
    def _process_list_traversal(
        main_object: list,
        attr: str,
        retrieve_fn: Callable[[Any], Any],
        attr_fn: Callable[[Any, str], Any],
    ) -> list:
        list_obj = []
        for obj in main_object:
            processed_obj = DataExtractorUtil.get_value_from_structure_recursive(
                obj,
                attr,
                retrieve_fn,
                attr_fn,
            )
            list_obj.append(processed_obj)
        return list_obj

    @staticmethod
    @raise_exception(
        "Failed to process object traversal",
        exception_logger=logger,
    )
    def _process_object_traversal(
        main_object: Any,
        attr: str,
        retrieve_fn: Callable[[Any], Any],
        attr_fn: Callable[[Any, str], Any],
    ) -> Any:
        main_object = retrieve_fn(main_object)
        main_object = attr_fn(main_object, attr)
        if main_object is not None:
            main_object = retrieve_fn(main_object)
        return main_object
