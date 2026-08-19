# LLM Risk Assessment Module

A comprehensive Large Language Model (LLM) integration module for generating risk scenarios, dataflow diagrams, and architecture diagrams using hosted APIs, local Ollama models, and AWS Batch-backed Ollama jobs.

## Overview

This module provides AI-powered risk assessment capabilities through multiple generation modes:

- **Risk Scenario Generation**: Generate attack paths and risk scenarios using LLM chains
- **Dataflow Generation**: Create dataflow diagrams from user stories and architecture
- **Diagram Generation**: Generate architecture diagrams from system descriptions
- **Single-shot Generation**: Direct LLM interactions for specific tasks

## Features

- **Multi-LLM Support**: OpenAI, GPT-4.1, Google Gemini, Qwen 3, and Ministral 3
- **Mongo-backed Jobs**: LLM requests, jobs, and results are persisted for polling and debugging
- **Async Polling Execution**: Hosted APIs and local Ollama calls run through a Mongo polling wrapper; AWS Batch jobs poll the same Mongo result document
- **Chain-based Generation**: Multi-agent workflows for complex risk analysis
- **Structured Output**: JSON schema validation and repair mechanisms
- **Progress Tracking**: Real-time progress updates for long-running operations
- **Error Handling**: Robust error handling with retry mechanisms
- **Output Parsing**: Intelligent parsing and validation of LLM outputs

## Architecture

### Core Components

#### 1. LLM Models (`src/llm_model.py`)

- **OpenAILLM**: OpenAI/GPT-4.1 integration with structured JSON output and Mongo polling
- **GeminiLLM**: Google Gemini integration with safety settings and Mongo polling
- **LocalPollingOllamaLLM**: Local Ollama integration for Qwen/Ministral with Mongo polling
- **BatchPollingOllamaLLM**: AWS Batch-backed Ollama integration for GPU Batch execution
- **MongoPollingLLM**: Shared request/job/result polling base for hosted and local in-process models

Runtime details are documented in `../llm_runtime/README.md`.

#### 2. Generation Modes (`src/llm_generator.py`)

- **LLMGenerator**: Base generator class with common functionality
- **LLMRiskScenarioGenerator**: Specialized risk scenario generation
- **LLMDataflowGenerator**: Dataflow diagram generation
- **LLMTopologyGenerator**: Architecture topology generation

#### 3. Agent Framework (`src/llm_agent.py`)

- **Initial_Access_Agent**: Identifies initial attack vectors
- **Effects_Agent**: Analyzes system effects of attacks
- **Lateral_Movement_Agent**: Generates lateral movement scenarios
- **Impact_Agent**: Assesses final impact scenarios
- **Summary_Agent**: Consolidates attack paths

#### 4. Chain Processing (`src/llm_chain_scenario.py`)

- **LLMGenerationChain**: Orchestrates multi-agent workflows
- **State Management**: Tracks conversation state across agents
- **Conditional Routing**: Dynamic workflow routing based on results

#### 5. Single-shot Processing (`src/llm_single*.py`)

- **LLMSingleBase**: Base class for direct LLM interactions
- **LLMGenerationSingle**: Single-shot risk scenario generation
- **LLMDataflowSingle**: Single-shot dataflow generation
- **LLMTopologySingle**: Single-shot topology generation

## Requirements

### Python Dependencies

```bash
pip install -r requirements.txt
```

Key dependencies:

- `langchain` - LLM framework and chains
- `langchain_openai` - OpenAI integration
- `langchain_google_genai` - Google Gemini integration
- `langchain_ollama` - Ollama integration
- `jsonschema` - JSON validation
- `networkx` - Graph processing
- `langgraph` - Graph-based workflows
- `tqdm` - Progress bars

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google Gemini
GOOGLE_API_KEY=your_google_api_key

# Ollama
LLM_LOCAL_URL=http://localhost:11434

# Runtime job persistence
ASSESSMENT_JOBS_MONGO_COLLECTION=assessment_jobs
BATCH_WAIT_TIMEOUT=1440
LLM_BATCH_STALE_JOB_SECONDS=1440

# AWS Batch execution, only when qwen3/ministral3 resolve to batch mode
LLM_BATCH_JOB_QUEUE=arn:aws:batch:...
```

## Usage

### 1. Risk Scenario Generation

#### Chain-based Generation (Multi-agent)

```python
from engine_libs.generators.llm_generator_risk_scenario import LLMRiskScenarioGenerator

configuration = {
    "role": "securityConsultant",
    "llm": "openai",
    "generationOption": "chain",
    "systemDescription": "Your system description here",
    "prompt": ["initial_access", "effects", "lateral_movement", "impact"]
}

generator = LLMRiskScenarioGenerator(
    configuration=configuration,
    prompts_dict=prompts_dict,
    project_input_model=project_model,
    mitre_attack=attack_data,
    project_register_updater=updater
)

result = generator.generate()
```

#### Single-shot Generation

```python
from service.lib.llm.src.llm_single_scenario import LLMGenerationSingle

generator = LLMGenerationSingle(prompts=prompts_class)
generator.set_system(system_description, "text")
result = generator.generate_path(llm_model, schema, path_structure)
```

### 2. Dataflow Generation

```python
from service.lib.llm.src.llm_generator_dataflow import LLMDataflowGenerator

configuration = {
    "role": "projectManager",
    "llm": "openai",
    "generationOption": "dataflow",
    "prompt": input_prompts,
    "card_id": "card_dXgZxHppoci5bCjTsUZn9j"
}

generator = LLMDataflowGenerator(
    configuration=configuration,
    project_input_model=project_model,
    prompts_dict=prompts_dict
)

result = generator.generate()
```

### 3. Topology Generation

```python
from engine_libs.generators import LLMTopologyGenerator

configuration = {
    "role": "projectManager",
    "llm": "openai",
    "generationOption": "diagram",
    "prompt": input_prompts,
    "diagram_image": "base64_image_data",
    "icon_list": ["icon1", "icon2"]
}

generator = LLMTopologyGenerator(
    configuration=configuration,
    tosca_mapping=tosca_mapping,
    project_input_model=project_model,
    prompts_dict=prompts_dict
)

result = generator.generate()
```

### 4. Direct LLM Usage

```python
from service.lib.llm.src.llm_model import (
    GeminiLLM,
    LocalPollingOllamaLLM,
    OpenAILLM,
)

# OpenAI
llm = OpenAILLM(apikey="your_api_key", response_mode="json")

# Gemini
llm = GeminiLLM(apikey="your_api_key", response_mode="json")

# Ollama (local)
llm = LocalPollingOllamaLLM(
    "qwen3",
    base_url="http://localhost:11434",
    response_mode="json",
)

# Generate response
response = llm.invoke(messages)
parsed_json = llm.extract_json(response)
```

## Configuration

### Runtime Execution

LLM execution is selected by `service.lib.llm_runtime.resolver`.

Supported canonical models:

- `gemini`
- `openai`
- `gpt4_1`
- `qwen3`
- `ministral3`

Execution modes:

- `api`: hosted API or local in-process polling, depending on model
- `local`: local Ollama through `LocalPollingOllamaLLM`
- `batch`: AWS Batch Ollama through `BatchPollingOllamaLLM`
- `bedrock`: AWS Bedrock through `BedrockPollingLLM`

Configuration notes:

- `LLM_ALLOWED_MODELS` is the master allow-list.
- Execution mode is not environment-configurable — each canonical model has exactly one
  mode, fixed by which catalog it lives in (`shared_libs.constants.llm`).

For local/hosted polling, the job runs in a service-local background thread and
the caller polls Mongo.

For AWS Batch polling, the job runs in AWS Batch and the caller polls Mongo.

All runtime jobs use the same Mongo document shape:

```json
{
    "_id": "llm-...",
    "request_id": "llm-...",
    "attempt_id": "...",
    "request": {},
    "job": {},
    "result": {}
}
```

Polling uses `request_id` to find the document, then validates `attempt_id`,
`batch_job_id`, and `model_tag` before accepting the result.

### LLM Configuration

```python
configuration = {
    "role": "securityConsultant",  # Role for prompt customization
    "llm": "openai",              # LLM provider/model option
    "generationOption": "chain",        # Generation mode: "single", "chain", "dataflow", "diagram"
    "prompt": [...],  # List of prompt templates
    "systemDescription": "...",   # System description for context
    "prompt": [...]               # Specific prompts for chain generation
}
```

### Progress Tracking

```python
generator = LLMGenerator(
    # ... other parameters
    track_progress=True,
    min_progress=10,
    max_progress=90,
    project_register_updater=updater
)
```

## Output Formats

### Risk Scenarios

```json
{
    "attack_paths": [
        {
            "attack_path": [
                {
                    "attack_id": "T101",
                    "attack_name": "Weak Processes",
                    "system_component": "Web Server"
                }
            ],
            "risk_scenario": "Attack scenario description",
            "key_risk": "Key risk identified"
        }
    ]
}
```

### Dataflow Diagrams

```json
{
    "nodes": [
        {
            "id": "node_1",
            "data": {
                "card_id": "card_123",
                "data_stored": ["PII", "Credentials"],
                "icon": "database",
                "label": "Database Server",
                "tosca_type": "arcs.nodes.Database"
            }
        }
    ],
    "edges": [
        {
            "id": "edge_1",
            "data": {
                "card_id": "card_123",
                "source": "node_1",
                "target": "node_2"
            }
        }
    ]
}
```

### Architecture Diagrams

```json
{
    "nodes": [
        {
            "id": "node_1",
            "parentId": "",
            "position": { "x": 100, "y": 100 },
            "type": "infoNode",
            "width": 80,
            "height": 80,
            "data": {
                "icon": "server",
                "label": "Web Server"
            }
        }
    ],
    "edges": [
        {
            "id": "edge_1",
            "source": "node_1",
            "target": "node_2"
        }
    ]
}
```

## Error Handling

The module includes comprehensive error handling:

- **JSON Validation**: Automatic validation and repair of LLM outputs
- **Retry Mechanisms**: Configurable retry attempts for failed generations
- **Exception Logging**: Detailed logging of errors and exceptions
- **Graceful Degradation**: Fallback mechanisms for partial failures

## Performance Considerations

- **Timeout Settings**: hosted/local model calls use model-level timeouts; polling uses `BATCH_WAIT_TIMEOUT`
- **Job Persistence**: Mongo request/job/result documents support debugging and stale job replacement
- **AWS Batch Processing**: optional GPU-backed Batch execution for configured Ollama models
- **Progress Tracking**: Real-time progress updates for long operations
- **Memory Management**: Efficient memory usage for large datasets

## Development

### Running Tests

```bash
# Run specific test files
python -m pytest tests/test_llm_generator.py
python -m pytest tests/test_llm_model.py

# Run all tests
python -m pytest tests/
```

### Adding New LLM Providers

1. Add the model to `service.lib.llm_runtime.config`
2. Update runtime resolution if needed
3. Extend `MongoPollingLLM` for hosted/local polling, or `BatchPollingOllamaLLM` for AWS Batch-backed Ollama
4. Implement provider-specific setup and `extract_json()` methods
5. Update `LLMGenerator.init_llm()`

### Adding New Generation Modes

1. Create new generator class extending `LLMGenerator`
2. Implement `generate()` method
3. Define output schema in `llm_return_struct.py`
4. Add parsing logic in `output_parser.py`

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure environment variables are set correctly
2. **Timeout Issues**: Increase timeout values for complex generations
3. **JSON Parsing Errors**: Check output schemas and validation rules
4. **Memory Issues**: Reduce batch sizes or implement streaming
