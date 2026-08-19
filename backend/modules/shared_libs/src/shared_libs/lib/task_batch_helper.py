import json
import logging
import uuid
from sys import getsizeof
from typing import Any

from shared_libs.decorators import raise_exception
from shared_libs.templates.message_template import success

BATCH_THRESHOLD = 10**7

logger = logging.getLogger(__name__)


class TaskBatchHelper:
    """
    A helper class for handling task batches.

    This class provides methods to get batch information, get batch data, and process task batches.

    Raises:
        Exception: If getting task batch information, getting task batch data, or processing task batch fails.
    """

    @raise_exception(
        "Failed to get task batch information.",
        exception_logger=logger,
    )
    def get_batch_info(
        self,
        data_list: list[Any],
    ):
        """
        Gets the batch information for a given list of data.

        Args:
            data_list (List[Any]): The list of data to get batch information for.

        Returns:
            dict: A dictionary containing batch information if the size of the data is greater than the batch threshold.
            None: If the size of the data is less than or equal to the batch threshold.
        """
        data_size = getsizeof(json.dumps(data_list, default=str))
        if data_size > BATCH_THRESHOLD:
            data_length = len(data_list)
            average_unit_size = int(data_size / data_length)
            batch_size = int(BATCH_THRESHOLD / average_unit_size)
            batch_count_total = int(data_length / batch_size) + 1
            return {
                "batch_size": batch_size,
                "batch_count_total": batch_count_total,
                "batch_session_id": f"batch-{uuid.uuid4()}",
                "data_length": data_length,
                "data_size": data_size,
                "average_unit_size": average_unit_size,
            }
        return None

    @raise_exception(
        "Failed to get task batch data.",
        exception_logger=logger,
    )
    def get_batch_data(
        self,
        data_list: list[Any],
        batch_info: dict[str, Any],
    ):
        """
        Gets the batch data for a given list of data and batch information.

        Args:
            data_list (List[Any]): The list of data to get batch data for.
            batch_info (Dict[str, Any]): The batch information.

        Returns:
            List[Any]: The batch data.
        """
        batch_num = batch_info["batch_num"]
        batch_size = batch_info["batch_size"]
        start_index = batch_size * (batch_num - 1)
        end_index = batch_size * batch_num
        if batch_num == batch_info["batch_count_total"]:
            return data_list[start_index:]
        return data_list[start_index:end_index]

    @raise_exception(
        "Failed to process task batch.",
        exception_logger=logger,
    )
    def process_task_batch(
        self,
        data_list: list[Any],
        key: str,
        batch_info: dict[str, Any],
    ):
        """
        Processes a task batch for a given list of data, key, and batch information.

        Args:
            data_list (List[Any]): The list of data to process the task batch for.
            key (str): The key to use for the result.
            batch_info (Dict[str, Any]): The batch information.

        Returns:
            dict: A dictionary containing the result of the task batch processing.
            None: If no batch information is provided and the size of the data is less than or equal to the batch threshold.
        """
        if batch_info:
            batch_data = self.get_batch_data(data_list, batch_info)
            return success(
                f"Batch {batch_info['batch_num']} of session {batch_info['batch_session_id']} retrieved successfully.",
                {key: [_.model_dump() for _ in batch_data]},
            )

        batch_info = self.get_batch_info(data_list)
        if batch_info:
            return success(
                "New batch info generated successfully.",
                {key: {"batch_info": batch_info}},
            )

        return None
