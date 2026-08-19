from shared_libs import lib_config
from shared_libs.types.enum import PipelineEngineJobType

ENGINE_MAIN_JOB_TYPE = {
    "engine_job_type": PipelineEngineJobType.run_main_engine.value,
    "start_message": "Running rule-based engine.",
    "end_message": "Processing rule-based engine result.",
}
ENGINE_LLM_JOB_TYPE = {
    "engine_job_type": PipelineEngineJobType.run_llm_engine.value,
    "start_message": "Waiting for LLM result.",
    "end_message": "Processing LLM result.",
}
ENGINE_PENTEST_JOB_TYPE = {
    "engine_job_type": PipelineEngineJobType.run_pentest_engine.value,
    "start_message": "Running pentest engine.",
    "end_message": "Processing pentest engine result.",
}
ENGINE_GRAPH_REASONING_JOB_TYPE = {
    "engine_job_type": PipelineEngineJobType.run_graph_reasoning_engine.value,
    "start_message": "Running graph reasoning engine.",
    "end_message": "Processing graph reasoning result.",
}

ENGINE_JOB_TASK_TYPES = {
    PipelineEngineJobType.run_main_engine.value: "run_engine",
    PipelineEngineJobType.run_llm_engine.value: "run_llm",
    PipelineEngineJobType.run_pentest_engine.value: "run_pentest",
    PipelineEngineJobType.run_graph_reasoning_engine.value: "run_graph_reasoning",
}
ENGINE_JOB_TIMEOUT_SECONDS = {
    PipelineEngineJobType.run_main_engine.value: lib_config.TASK_TIME_LIMIT_ENGINE_MAIN,
    PipelineEngineJobType.run_llm_engine.value: lib_config.TASK_TIME_LIMIT_ENGINE_LLM,
    PipelineEngineJobType.run_pentest_engine.value: lib_config.TASK_TIME_LIMIT_ENGINE_PENTEST,
    PipelineEngineJobType.run_graph_reasoning_engine.value: lib_config.TASK_TIME_LIMIT_ENGINE_PENTEST,
}
