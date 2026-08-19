import logging

from shared_libs.decorators import raise_exception
from shared_libs.infrastructure.producer.service import Producer

logger = logging.getLogger(__name__)


class RegisterPipelineProducer:
    def __init__(
        self,
        producer: Producer,
    ):
        self.producer = producer

    @raise_exception(
        "Failed to run async in register pipeline producer.",
        exception_logger=logger,
    )
    def run_async(
        self,
        **kwargs,
    ):
        logger.info("[ SHARED-PRODUCER ] Starting async register pipeline task ...")
        task_id = self.producer.start_task_async(
            task_type="run_pipeline",
            task_body={
                **kwargs,
            },
        )
        return task_id
