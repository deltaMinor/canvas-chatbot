from shared_libs.models.llm_task_context import LlmTaskContext

ENGINE_LLM_CONTEXT = LlmTaskContext(
    queue_name="engine_llm_queue",
    task_name="engine_llm.generate",
    task_type="engine_llm",
)

ENGINE_LLM_EXEC_SUMMARY_CONTEXT = LlmTaskContext(
    queue_name="engine_llm_queue",
    task_name="engine_llm.generate_executive_summary",
    task_type="engine_llm_exec_summary",
)

DIAGRAM_LLM_DATAFLOW_CONTEXT = LlmTaskContext(
    queue_name="diagram_llm_dataflow_queue",
    task_name="diagram_llm_dataflow.generate",
    task_type="diagram_llm_dataflow",
)

DIAGRAM_LLM_TOPOLOGY_CONTEXT = LlmTaskContext(
    queue_name="diagram_llm_topology_queue",
    task_name="diagram_llm_topology.generate",
    task_type="diagram_llm_topology",
)

DIAGRAM_LLM_ARCHITECTURE_CONTEXT = LlmTaskContext(
    queue_name="diagram_llm_architecture_queue",
    task_name="diagram_llm_architecture.generate",
    task_type="diagram_llm_architecture",
)


LLM_BATCH_TASK_CONTEXTS = (
    ENGINE_LLM_CONTEXT,
    ENGINE_LLM_EXEC_SUMMARY_CONTEXT,
    DIAGRAM_LLM_DATAFLOW_CONTEXT,
    DIAGRAM_LLM_TOPOLOGY_CONTEXT,
    DIAGRAM_LLM_ARCHITECTURE_CONTEXT,
)
