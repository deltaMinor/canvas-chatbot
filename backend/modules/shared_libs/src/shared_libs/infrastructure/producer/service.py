import json
import logging
import time
import uuid
from collections.abc import Mapping
from typing import TYPE_CHECKING, Any

from celery import Celery
from celery.exceptions import TimeoutError as CeleryTimeoutError

from shared_libs import lib_config
from shared_libs.decorators import raise_exception, verify_params
from shared_libs.exceptions.api_exceptions import BadRequest, NotFound
from shared_libs.exceptions.exceptions import DictionaryValueError
from shared_libs.models.base_models import BatchInfoModel, ProducerDataModel

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)


class Producer:
    """
    A Producer that manages tasks using a data model and a Celery application.

    The Producer uses a data model to map tasks and a Celery application to manage
    these tasks.

    Attributes:
        producer_data_model (ProducerDataModel): The data model for the producer.
        celery_app (Celery): The Celery application instance used for task management.
        task_mappings (dict): The task mappings obtained from the data model.
    """

    def __init__(
        self,
        producer_data_model: "ProducerDataModel",
        celery_app: Celery,
    ):
        """
        Initializes the Producer with a data model and a Celery application.

        The Producer uses the data model to map tasks and the Celery application to manage
        these tasks.

        Args:
            producer_data_model (ProducerDataModel): The data model for the producer.
            celery_app (Celery): The Celery application instance used for task management.
        """
        self.producer_data_model = producer_data_model
        self.task_mappings = self.producer_data_model.task_mappings
        self.celery_app = celery_app

    def get_task_queue(
        self,
        task_name: str,
        task_body: Mapping[str, Any],
        queue: str | None = None,
    ) -> str | None:
        if queue:
            return queue
        return self.producer_data_model.task_queue

    @staticmethod
    @raise_exception(
        "Failed to get processed result.",
        exception_logger=logger,
    )
    def get_processed_result(
        task_key: str,
        res: dict | None,
    ) -> Any:
        """Processes the result of a task.

        This method retrieves the data from the result of a task. If a task key is provided, it retrieves the data associated with that key.
        If the result or the task key is None, it returns the result as is.

        Args:
            task_key (str): The key of the task whose result is to be processed. If this is None, the method returns the 'data' field from the result.
            res (dict | None): The result of the task. This should be a dictionary that includes a 'data' field. If this is None, the method returns None.

        Returns:
            Any: The processed result of the task. This is the value associated with the task key in the 'data' field of the result, or the 'data' field itself if the task key is None, or None if the result is None.

        Raises:
            Exception: If an error occurs while processing the result. The exception message includes the reason for the error.
        """
        if not res:
            return res
        if not task_key:
            return res.get("data")
        return res.get("data", {}).get(task_key)

    @raise_exception(
        "Failed to get task attributes from mappings.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type"])
    def get_task_attributes_from_mappings(
        self,
        task_type: str,
    ) -> tuple[str, str]:
        """Retrieves the task name and key for a given task type from the task mappings.

        This method looks up the task name and key associated with the provided task type in the task mappings.
        If the task name is not found in the mappings, it raises a DictionaryValueError.

        Args:
            task_type (str): The type of the task for which to retrieve the name and key.

        Returns:
            Tuple[str, str]: A tuple where the first element is the task name and the second element is the task key.

        Raises:
            DictionaryValueError: If the task name is not found in the mappings.
        """
        task_name = dict(self.task_mappings.task_name_dict).get(task_type)
        if task_name is None:
            raise DictionaryValueError(task_type)
        task_key = dict(self.task_mappings.task_key_dict).get(task_type)
        return task_name, task_key

    @raise_exception(
        "Failed to retrieve task value.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type", "task_body"])
    def get_task_value(
        self,
        task_type: str,
        task_body: Mapping[str, Any],
        raise_if_not_found=False,
        raise_if_found=False,
        raise_if_timeout=True,
        TIMEOUT=lib_config.TASK_WAIT_RESULT_TIMEOUT,
        queue: str | None = None,
    ) -> Any:
        """Sends a task to the Celery task queue and retrieves the result.

        This method sends a task of a specified type with a specified body to a Celery task queue. It then waits for the
        result of the task. If the task does not return a result, it raises an exception if `raise_if_not_found` is True.
        If the task returns a result, it raises an exception if `raise_if_found` is True. If the task times out, it raises
        an exception if `raise_if_timeout` is True.

        Args:
            task_type (str): The type of the task to be sent to the Celery task queue.
            task_body (Mapping[str, Any]): The body of the task, which contains the parameters for the task.
            raise_if_not_found (bool, optional): Whether to raise an exception if the task does not return a result. Defaults to False.
            raise_if_found (bool, optional): Whether to raise an exception if the task returns a result. Defaults to False.
            raise_if_timeout (bool, optional): Whether to raise an exception if the task times out. Defaults to True.

        Returns:
            Any: The result of the task, or None if the task does not return a result or times out and 'raise_if_timeout' is False.

        Raises:
            TimeoutError: If the task times out and 'raise_if_timeout' is True.
            NotFound: If 'raise_if_not_found' is True and the task does not return a result.
            BadRequest: If 'raise_if_found' is True and the task returns a result.
        """
        task_name, task_key = self.get_task_attributes_from_mappings(task_type)
        try:
            # --- TEMPORARY DIAGNOSTIC INSTRUMENTATION ---
            # Logged at WARNING so it shows up under this codebase's logging
            # config even though it's on the `shared_libs.infrastructure`
            # logger (which is otherwise capped to WARNING). Safe to remove
            # once the hang is diagnosed - these lines don't change behavior.
            _publish_start = time.monotonic()
            job = self.celery_app.send_task(
                name=task_name,
                args=[task_body],
                queue=self.get_task_queue(
                    task_name=task_name,
                    task_body=task_body,
                    queue=queue,
                ),
            )
            _publish_elapsed = time.monotonic() - _publish_start
            logger.warning(
                f"[TIMING] send_task({task_name}) returned in "
                f"{_publish_elapsed:.3f}s - task_id={job.id}"
            )
            _wait_start = time.monotonic()
            res = job.get(timeout=TIMEOUT)
            _wait_elapsed = time.monotonic() - _wait_start
            logger.warning(
                f"[TIMING] job.get({task_name}, task_id={job.id}) returned in "
                f"{_wait_elapsed:.3f}s"
            )
            # --- END TEMPORARY DIAGNOSTIC INSTRUMENTATION ---
        except (TimeoutError, CeleryTimeoutError):
            # NOTE: `job.get(timeout=...)` raises `celery.exceptions.TimeoutError`,
            # which is its own standalone `Exception` subclass and NOT the same
            # class as the builtin `TimeoutError` - so this branch must catch both
            # explicitly, or every real Celery timeout falls through to the
            # `except Exception` branch below and gets misreported as a broker/
            # connection problem instead of "the task didn't finish in time".
            logger.error(
                f"celery[task] : {task_name} timed out after {TIMEOUT}s "
                f"waiting for a result (queue={queue!r})."
            )
            if not raise_if_timeout:
                return None
            raise
        except Exception:
            logger.error(f"celery[main] : {self.celery_app.main}.")
            logger.error(
                f"celery[broker_url] : {self.celery_app._preconf.get('broker_url')}."
            )
            raise

        if raise_if_not_found and (not bool(res) or not len(res)):
            raise NotFound("Resource not found.")
        if raise_if_found and (bool(res) or len(res) > 0):
            raise BadRequest("Existing resource found.")

        return self.get_processed_result(task_key, res)

    @raise_exception(
        "Failed to retrieve task values.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type"])
    def get_task_values(
        self,
        task_type: str,
        task_body: Mapping[str, Any],
    ) -> Any:
        """Sends a task to the Celery worker and retrieves the result.

        This method sends a task of a specified type with a specified body to a Celery worker. It then waits for the
        result of the task. If the result contains batch information, it runs a batch process and returns the result of
        that process. Otherwise, it returns the result of the task.

        Args:
            task_type (str): The type of the task to be sent to the Celery worker.
            task_body (Mapping[str, Any]): The body of the task, which contains the parameters for the task.

        Returns:
            Any: The result of the task or the batch process. If the task result contains batch information, the result of the batch process is returned. Otherwise, the result of the task is returned.

        Raises:
            Exception: If an error occurs while sending the task, retrieving the task result, or running the batch process. The exception message includes the reason for the error.
        """
        retval = self.get_task_value(
            task_type=task_type,
            task_body=task_body,
        )
        batch_info = retval.get("batch_info") if isinstance(retval, dict) else None
        if batch_info:
            batch_info_model = BatchInfoModel(**batch_info)
            return self.run_batch_process(
                task_body=task_body,
                batch_info_model=batch_info_model,
            )
        return retval

    @raise_exception(
        "Failed to run batch process.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_body", "batch_info_model"])
    def run_batch_process(
        self,
        task_body: dict[str, Any],
        batch_info_model: BatchInfoModel,
    ) -> Any:
        """Runs a batch process by sending a task to the Celery worker and retrieving the result.

        This method sends a task of type 'find_multiple' with a specified body and batch information to a Celery worker.
        It then waits for the result of the task and returns it.

        Args:
            task_body (Dict[str, Any]): The body of the task, which contains the parameters for the task.
            batch_info_model (BatchInfoModel): The model containing information about the batch, including the total batch count and the batch session ID.

        Returns:
            Any: The result of the task, which is a list of task values retrieved by batch. Each item in the list is the result of a task.

        Raises:
            Exception: If an error occurs while sending the task or retrieving the result. The exception message includes the reason for the error.
        """
        logger.info(
            f"[ SHARED-INFRA ] [{batch_info_model.batch_session_id}] Starting batch process: {json.dumps(batch_info_model.model_dump(), default=str)}"
        )
        return self.get_task_value_by_batch(
            task_type="find_multiple",
            task_body=task_body,
            batch_info_model=batch_info_model,
        )

    @raise_exception(
        "Failed to retrieve task value by batch.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type", "task_body", "batch_info_model"])
    def get_task_value_by_batch(
        self,
        task_type: str,
        task_body: Mapping[str, Any],
        batch_info_model: BatchInfoModel,
    ) -> list[Any]:
        """Retrieves the value of a task by batch.

        This method retrieves the value of a task by batch. It first starts a new task for each batch
        and stores the task IDs. It then retrieves the result of each task by its ID and extends the
        data list with the result. It logs the progress of the batch retrieval and returns the data list.

        Args:
            task_type (str): The type of the task to get the value for.
            task_body (Mapping[str, Any]): The body of the task, which contains the parameters for the task.
            batch_info_model (BatchInfoModel): The model containing information about the batch, including the total batch count and the batch session ID.

        Returns:
            List[Any]: The list of task values retrieved by batch. Each item in the list is the result of a task.

        Raises:
            Exception: If an error occurs while starting a task or retrieving a task result. The exception message includes the reason for the error.
        """
        batch_count_total = batch_info_model.batch_count_total

        task_id_list = []
        for batch_num in range(1, batch_count_total + 1):
            task_id = self.start_task_async(
                task_type=task_type,
                task_body={
                    **task_body,
                    "batch_info": {
                        **batch_info_model.model_dump(),
                        "batch_num": batch_num,
                    },
                },
            )
            task_id_list.append(task_id)
            logger.info(
                f"[ SHARED-INFRA ] [{task_id}] batch {batch_num} / {batch_count_total}. task started."
            )

        data_list = []
        for index, task_id in enumerate(task_id_list):
            batch_retval = self.get_task_result_by_id(
                task_type="find_multiple",
                task_id=task_id,
            )
            data_list.extend(batch_retval)
            logger.info(
                f"[ SHARED-INFRA ] [{task_id}] batch {index + 1} / {batch_count_total}. cummulative_data_length: {len(data_list)}. "
            )

        logger.info(
            f"[ SHARED-INFRA ] [{batch_info_model.batch_session_id}] {len(data_list)} documents retrieved by batch method."
        )
        return data_list

    @raise_exception(
        "Failed to start a new task.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type", "task_body"])
    def start_task_async(
        self,
        task_type: str,
        task_body: Mapping[str, Any],
        queue: str | None = None,
    ) -> str:
        """Starts a new asynchronous task.

        This method starts a new task asynchronously. It first retrieves the task attributes
        from the mappings based on the task type. It then generates a unique task ID and
        sends the task to the Celery application.

        Args:
            task_type (str): The type of the task to start. This is used to retrieve the task attributes from the mappings.
            task_body (Mapping[str, Any]): The body of the task, which contains the parameters for the task.

        Returns:
            str: The ID of the task that was started. This is a unique identifier generated using the uuid module.

        Raises:
            Exception: If an error occurs while retrieving the task attributes or sending the task. The exception message includes the reason for the error.
        """
        task_name, _ = self.get_task_attributes_from_mappings(task_type)
        task_id = uuid.uuid4().hex
        self.celery_app.send_task(
            name=task_name,
            args=[task_body],
            task_id=task_id,
            queue=self.get_task_queue(
                task_name=task_name,
                task_body=task_body,
                queue=queue,
            ),
        )
        return task_id

    @raise_exception(
        "Failed to retrieve task result by id.",
        exception_logger=logger,
    )
    @verify_params(key_list=["task_type", "task_id"])
    def get_task_result_by_id(
        self,
        task_type: str,
        task_id: str,
        raise_if_not_found=False,
        raise_if_found=False,
        raise_if_timeout=True,
    ) -> Any:
        """Retrieves the result of a task by its ID.

        This method retrieves the result of a task by its ID. It first gets the task attributes
        from the mappings based on the task type. It then tries to get the result of the task
        from the Celery application. If the task result is not found, it raises an exception
        if `raise_if_not_found` is True. If the task result is found, it raises an exception
        if `raise_if_found` is True.

        Args:
            task_type (str): The type of the task to get the result for.
            task_id (str): The ID of the task to get the result for.
            raise_if_not_found (bool, optional): Whether to raise an exception if the task result is not found. Defaults to False.
            raise_if_found (bool, optional): Whether to raise an exception if the task result is found. Defaults to False.
            raise_if_timeout (bool, optional): Whether to raise an exception if the task result retrieval times out. Defaults to True.

        Returns:
            Any: The result of the task, or None if the task result was not found or if the task result retrieval times out and 'raise_if_timeout' is False.

        Raises:
            TimeoutError: If the task result retrieval times out and 'raise_if_timeout' is True.
            NotFound: If 'raise_if_not_found' is True and the task result is not found.
            BadRequest: If 'raise_if_found' is True and the task result is found.
        """
        _, task_key = self.get_task_attributes_from_mappings(task_type)
        try:
            res = self.celery_app.AsyncResult(task_id).get(
                timeout=lib_config.TASK_WAIT_RESULT_TIMEOUT,
            )
        except (TimeoutError, CeleryTimeoutError):
            if not raise_if_timeout:
                return None
            raise

        if raise_if_not_found and (res is None or not len(res)):
            raise NotFound("Resource not found.")
        if raise_if_found and (res is not None or len(res) > 0):
            raise BadRequest("Existing resource found.")

        return self.get_processed_result(task_key, res)
