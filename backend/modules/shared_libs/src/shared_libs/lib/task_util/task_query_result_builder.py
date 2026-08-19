import logging
from typing import Any

from pydantic import BaseModel

from shared_libs.decorators import raise_exception
from shared_libs.models.base_models import ProducerDataModel

logger = logging.getLogger(__name__)


class TaskQueryResultBuilder:
    """
    A builder class for resolving and retrieving query results.

    Methods:
        resolve(res, producer_data_model, type="default", **kwargs):
            Resolves the query result based on the specified type.

        resolve_query_response(res, producer_data_model, task_key_single, task_key_multiple, **kwargs):
            Resolves the query result based on the type of the result.

        _get_query_retval_multi(res, query_key, DataModelCls=None, skip_data_validation=False):
            Retrieves multiple query result values.

        _get_query_retval_single(res, query_key, DataModelCls=None, skip_data_validation=False):
            Retrieves a single query result value.
    """

    def __init__(self):
        pass

    @classmethod
    @raise_exception(
        "Failed to resolve query retval.",
        exception_logger=logger,
    )
    def resolve(
        cls,
        res: dict | list[Any],
        producer_data_model: "ProducerDataModel",
        type="default",
        **kwargs,
    ) -> dict:
        """
        Resolves the query result based on the specified type.

        Args:
            res (dict | List[Any]): The result of the query, which can be a dictionary or a list.
            producer_data_model (ProducerDataModel): The data model containing task mappings.
            type (str, optional): The type of query to resolve. Defaults to "default".
            **kwargs: Additional keyword arguments for the query resolution methods.

        Returns:
            dict: A dictionary containing the resolved query result.

        Raises:
            Exception: If an error occurs during the query resolution process.
        """

        if type == "file":
            return cls.resolve_query_response(
                res,
                producer_data_model,
                task_key_single="find_single_file",
                task_key_multiple="find_multiple_files",
                **kwargs,
            )
        return cls.resolve_query_response(
            res,
            producer_data_model,
            task_key_single="find_single",
            task_key_multiple="find_multiple",
            **kwargs,
        )

    @classmethod
    @raise_exception(
        "Failed to resolve query response.",
        exception_logger=logger,
    )
    def resolve_query_response(
        cls,
        res: dict | list[Any],
        producer_data_model: "ProducerDataModel",
        task_key_single: str,
        task_key_multiple: str,
        **kwargs,
    ) -> dict:
        """
        Resolves the query result based on the type of the result.

        Args:
            res (dict | List[Any]): The result of the query, which can be a dictionary or a list.
            producer_data_model (ProducerDataModel): The data model containing task mappings.
            task_key_single (str): The task key for single result queries.
            task_key_multiple (str): The task key for multiple result queries.
            **kwargs: Additional keyword arguments for the query result retrieval methods.

        Returns:
            dict: A dictionary containing the resolved query result.

        Raises:
            Exception: If an error occurs during the query resolution process.
        """
        if isinstance(res, list):
            query_key = producer_data_model.task_mappings.task_key_dict[
                task_key_multiple
            ]
            return cls._get_query_retval_multi(
                res,
                query_key=query_key,
                **kwargs,
            )

        query_key = producer_data_model.task_mappings.task_key_dict[task_key_single]
        return cls._get_query_retval_single(
            res,
            query_key=query_key,
            **kwargs,
        )

    @classmethod
    @raise_exception(
        "Failed to retrieve multi query retval.",
        exception_logger=logger,
    )
    def _get_query_retval_multi(
        cls,
        res: list[dict],
        query_key: str,
        DataModelCls: BaseModel | None = None,
        skip_data_validation: bool = False,
    ) -> dict:
        """
        Retrieves multiple query result values.

        Args:
            res (List[dict]): The list of result dictionaries from the query.
            query_key (str): The key to use for the returned dictionary.
            DataModelCls (BaseModel, optional): The Pydantic model class to validate the data against. Defaults to None.
            skip_data_validation (bool, optional): Whether to skip data validation. Defaults to False.

        Returns:
            dict: A dictionary containing the query key and the list of result values.

        Raises:
            Exception: If an error occurs during the retrieval process.
        """
        if not res or not len(res):
            return {query_key: res}

        if not DataModelCls or skip_data_validation:
            return {query_key: res}

        data_models: list[BaseModel] = [DataModelCls(**_) for _ in res]
        return {query_key: [_.model_dump() for _ in data_models]}

    @classmethod
    @raise_exception(
        "Failed to retrieve single query retval.",
        exception_logger=logger,
    )
    def _get_query_retval_single(
        cls,
        res: dict,
        query_key: str,
        DataModelCls: BaseModel | None = None,
        skip_data_validation: bool = False,
    ) -> dict:
        """
        Retrieves a single query result value.

        Args:
            res (dict): The result dictionary from the query.
            query_key (str): The key to use for the returned dictionary.
            DataModelCls (BaseModel, optional): The Pydantic model class to validate the data against. Defaults to None.
            skip_data_validation (bool, optional): Whether to skip data validation. Defaults to False.

        Returns:
            dict: A dictionary containing the query key and the result value.

        Raises:
            Exception: If an error occurs during the retrieval process.
        """
        if not res:
            return {query_key: res}

        if not DataModelCls or skip_data_validation:
            return {query_key: res}

        data_model: BaseModel = DataModelCls(**res)
        return {query_key: data_model.model_dump()}
