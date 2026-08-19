import logging

from pymongo.results import DeleteResult, UpdateResult

from shared_libs.decorators import raise_exception

logger = logging.getLogger(__name__)


class TaskResultBuilder:
    """A builder class for resolving the results of update or delete operations.

    This class provides methods to process the results of update or delete operations
    and return the relevant information in a structured format.
    """

    def __init__(self):
        pass

    @classmethod
    @raise_exception(
        "Failed to resolve update or delete retval.",
        exception_logger=logger,
    )
    def resolve(
        cls,
        res: UpdateResult | DeleteResult | list[UpdateResult] | list[DeleteResult],
    ) -> dict | list[dict]:
        """Resolves the return value for update or delete operations.

        This method processes the result(s) of update or delete operations and returns
        the relevant information in a structured format.

        Args:
            res (UpdateResult | DeleteResult | List[UpdateResult] | List[DeleteResult]):
                The result(s) of update or delete operations.

        Returns:
            dict | List[dict]: A dictionary or a list of dictionaries containing the result information.
            If the input is a single result, a dictionary is returned. If the input is a list of results,
            a list of dictionaries is returned.

        Raises:
            Exception: If the resolution of the return value fails.
        """

        if not res:
            return res
        if isinstance(res, list):
            return cls._get_retval_multi(res)
        return cls._get_retval_single(res)

    @classmethod
    @raise_exception(
        "Failed to get return value for multiple results.",
        exception_logger=logger,
    )
    def _get_retval_multi(
        cls,
        res_arr: list[UpdateResult] | list[DeleteResult],
    ) -> list[dict]:
        """Gets the return values for multiple results.

        This method processes a list of update or delete operation results and returns
        a list of dictionaries containing the relevant information for each result.

        Args:
            res_arr (List[UpdateResult] | List[DeleteResult]): A list of results from update or delete operations.

        Returns:
            List[dict]: A list of dictionaries, each containing the result information for an individual operation.
            Each dictionary will have either an "updateResult" key with details of the update operation or a "deleteResult"
            key with details of the delete operation.
        """
        retval_arr = []
        for res in res_arr:
            retval_arr.append(
                cls._get_retval_single(res),
            )
        return retval_arr

    @classmethod
    @raise_exception(
        "Failed to get return value for a single result.",
        exception_logger=logger,
    )
    def _get_retval_single(
        cls,
        res: UpdateResult | DeleteResult,
    ) -> dict | None:
        """Gets the return value for a single result.

        This method processes the result of an update or delete operation and returns
        a dictionary containing the relevant information.

        Args:
            res (UpdateResult | DeleteResult): The result of an update or delete operation.

        Returns:
            dict: A dictionary containing the result information. The dictionary will have
            either an "updateResult" key with details of the update operation or a "deleteResult"
            key with details of the delete operation. If the result is neither an UpdateResult
            nor a DeleteResult, returns None.
        """
        if isinstance(res, UpdateResult):
            return {
                "updateResult": {
                    "acknowledged": res.acknowledged,
                    "matched_count": res.matched_count,
                    "modified_count": res.modified_count,
                },
            }
        if isinstance(res, DeleteResult):
            return {
                "deleteResult": {
                    "acknowledged": res.acknowledged,
                    "deleted_count": res.deleted_count,
                },
            }
        return None
