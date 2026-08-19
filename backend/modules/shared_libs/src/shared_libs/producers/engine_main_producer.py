import logging

from shared_libs import lib_config
from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.producer.service import Producer

logger = logging.getLogger(__name__)


class EngineMainProducer:
    def __init__(
        self,
        producer: Producer,
    ):
        self.producer = producer

    @raise_exception(
        "Failed to run async in engine main producer.",
        exception_logger=logger,
    )
    def run_async(
        self,
        **kwargs,
    ):
        logger.info("[ SHARED-PRODUCER ] Starting async engine main task ...")
        task_id = self.producer.start_task_async(
            task_type="run_engine",
            task_body={**kwargs},
        )
        return task_id

    @raise_exception(
        "Failed to run sync in engine main producer.",
        exception_logger=logger,
    )
    def run_sync(
        self,
        **kwargs,
    ):
        logger.info("[ SHARED-PRODUCER ] Starting sync engine main task ...")
        res = self.producer.get_task_value(
            task_type="run_engine",
            task_body={**kwargs},
            TIMEOUT=lib_config.TASK_TIME_LIMIT_ENGINE_MAIN,
        )
        return res
