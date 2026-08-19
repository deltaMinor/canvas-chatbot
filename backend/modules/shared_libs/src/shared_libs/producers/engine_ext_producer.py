import logging

from shared_libs import lib_config
from shared_libs.decorators.raise_exception import raise_exception
from shared_libs.infrastructure.producer.service import Producer

logger = logging.getLogger(__name__)


class EngineExtProducer:
    def __init__(
        self,
        producer: Producer,
    ):
        self.producer = producer

    @raise_exception(
        "Failed to run async in engine external producer.",
        exception_logger=logger,
    )
    def run_async(
        self,
        task_type: str = "run_pentest",
        **kwargs,
    ):
        logger.info("[ SHARED-PRODUCER ] Starting async engine external task ...")
        task_body = {**kwargs}
        task_id = self.producer.start_task_async(
            task_type=task_type,
            task_body=task_body,
        )
        return task_id

    def run_diagram_async(
        self,
        **kwargs,
    ):
        return self.run_async(**kwargs)

    def run_data_flow_async(
        self,
        **kwargs,
    ):
        return self.run_async(**kwargs)

    @raise_exception(
        "Failed to run sync in engine external producer.",
        exception_logger=logger,
    )
    def run_sync(
        self,
        task_type: str = "run_pentest",
        **kwargs,
    ):
        logger.info("[ SHARED-PRODUCER ] Starting sync engine external task ...")
        task_body = {**kwargs}
        res = self.producer.get_task_value(
            task_type=task_type,
            task_body=task_body,
            TIMEOUT=lib_config.TASK_TIME_LIMIT_ENGINE_LLM,
        )
        return res
