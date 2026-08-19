from typing import TypeAlias, TypedDict


class LlmCatalogEntry(TypedDict, total=False):
    label: str
    model_id: str
    provider: str
    reasoning: bool | str
    apikey: str
    local_url: str


LlmCatalog: TypeAlias = dict[str, LlmCatalogEntry]

# Flattened catalog keyed by canonical model name.
LLM_BEDROCK_CATALOG: LlmCatalog = {
    # AI21 Labs
    "jamba_1_5_large_bedrock": {
        "label": "Jamba 1.5 Large",
        "model_id": "ai21.jamba-1-5-large-v1:0",
        "provider": "ai21_labs",
        "reasoning": False,
    },
    "jamba_1_5_mini_bedrock": {
        "label": "Jamba 1.5 Mini",
        "model_id": "ai21.jamba-1-5-mini-v1:0",
        "provider": "ai21_labs",
        "reasoning": False,
    },
    # Amazon
    "nova_lite_bedrock": {
        "label": "Nova Lite",
        "model_id": "amazon.nova-lite-v1:0",
        "provider": "amazon",
        "reasoning": "LLM_MODEL_NOVA_REASONING",
    },
    "nova_micro_bedrock": {
        "label": "Nova Micro",
        "model_id": "amazon.nova-micro-v1:0",
        "provider": "amazon",
        "reasoning": "LLM_MODEL_NOVA_REASONING",
    },
    "nova_pro_bedrock": {
        "label": "Nova Pro",
        "model_id": "amazon.nova-pro-v1:0",
        "provider": "amazon",
        "reasoning": "LLM_MODEL_NOVA_REASONING",
    },
    # DeepSeek
    "deepseek_v3_2_bedrock": {
        "label": "DeepSeek V3.2",
        "model_id": "deepseek.v3.2",
        "provider": "deepseek",
        "reasoning": "LLM_MODEL_DEEPSEEK_REASONING",
    },
    "deepseek_v3_1_bedrock": {
        "label": "DeepSeek-V3.1",
        "model_id": "deepseek.v3-v1:0",
        "provider": "deepseek",
        "reasoning": "LLM_MODEL_DEEPSEEK_REASONING",
    },
    # Google
    "gemma_3_27b_pt_bedrock": {
        "label": "Gemma 3 27B PT",
        "model_id": "google.gemma-3-27b-it",
        "provider": "google",
        "reasoning": False,
    },
    "gemma_3_12b_it_bedrock": {
        "label": "Gemma 3 12B IT",
        "model_id": "google.gemma-3-12b-it",
        "provider": "google",
        "reasoning": False,
    },
    "gemma_3_4b_it_bedrock": {
        "label": "Gemma 3 4B IT",
        "model_id": "google.gemma-3-4b-it",
        "provider": "google",
        "reasoning": False,
    },
    # Meta
    "llama_3_70b_instruct_bedrock": {
        "label": "Llama 3 70B Instruct",
        "model_id": "meta.llama3-70b-instruct-v1:0",
        "provider": "meta",
        "reasoning": False,
    },
    "llama_3_8b_instruct_bedrock": {
        "label": "Llama 3 8B Instruct",
        "model_id": "meta.llama3-8b-instruct-v1:0",
        "provider": "meta",
        "reasoning": False,
    },
    "llama_3_3_70b_instruct_bedrock": {
        "label": "Llama 3.3 70B Instruct",
        "model_id": "meta.llama3-3-70b-instruct-v1:0",
        "provider": "meta",
        "reasoning": False,
    },
    # MiniMax
    "minimax_m2_1_bedrock": {
        "label": "MiniMax M2.1",
        "model_id": "minimax.minimax-m2.1",
        "provider": "minimax",
        "reasoning": False,
    },
    "minimax_m2_5_bedrock": {
        "label": "MiniMax M2.5",
        "model_id": "minimax.minimax-m2.5",
        "provider": "minimax",
        "reasoning": False,
    },
    "minimax_m2_bedrock": {
        "label": "MiniMax M2",
        "model_id": "minimax.minimax-m2",
        "provider": "minimax",
        "reasoning": False,
    },
    # Mistral AI
    "devstral_2_123b_bedrock": {
        "label": "Devstral 2 123B",
        "model_id": "mistral.devstral-2-123b",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "magistral_small_2509_bedrock": {
        "label": "Magistral Small 2509",
        "model_id": "mistral.magistral-small-2509",
        "provider": "mistral_ai",
        "reasoning": "LLM_MODEL_MINISTRAL_REASONING",
    },
    "mistral_large_3_bedrock": {
        "label": "Mistral Large 3",
        "model_id": "mistral.mistral-large-3-675b-instruct",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "ministral_14b_3_0_bedrock": {
        "label": "Ministral 14B 3.0",
        "model_id": "mistral.ministral-3-14b-instruct",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "mistral_large_bedrock": {
        "label": "Mistral Large (24.02)",
        "model_id": "mistral.mistral-large-2402-v1:0",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "mistral_small_24_02_bedrock": {
        "label": "Mistral Small (24.02)",
        "model_id": "mistral.mistral-small-2402-v1:0",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "ministral_3_8b_bedrock": {
        "label": "Ministral 3 8B (Bedrock)",
        "model_id": "mistral.ministral-3-8b-instruct",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "ministral_3b_bedrock": {
        "label": "Ministral 3B",
        "model_id": "mistral.ministral-3-3b-instruct",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "mistral_7b_instruct_bedrock": {
        "label": "Mistral 7B Instruct",
        "model_id": "mistral.mistral-7b-instruct-v0:2",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    "mixtral_8x7b_instruct_bedrock": {
        "label": "Mixtral 8x7B Instruct",
        "model_id": "mistral.mixtral-8x7b-instruct-v0:1",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    # Moonshot AI
    "kimi_k2_5_bedrock": {
        "label": "Kimi K2.5",
        "model_id": "moonshotai.kimi-k2.5",
        "provider": "moonshot_ai",
        "reasoning": "LLM_MODEL_KIWI_REASONING",
    },
    "kimi_k2_thinking_bedrock": {
        "label": "Kimi K2 Thinking",
        "model_id": "moonshot.kimi-k2-thinking",
        "provider": "moonshot_ai",
        "reasoning": "LLM_MODEL_KIWI_REASONING",
    },
    # NVIDIA
    "nvidia_nemotron_3_super_120b_bedrock": {
        "label": "NVIDIA Nemotron 3 Super 120B A12B",
        "model_id": "nvidia.nemotron-super-3-120b",
        "provider": "nvidia",
        "reasoning": False,
    },
    "nemotron_nano_3_30b_bedrock": {
        "label": "Nemotron Nano 3 30B",
        "model_id": "nvidia.nemotron-nano-3-30b",
        "provider": "nvidia",
        "reasoning": False,
    },
    "nemotron_nano_9b_v2_bedrock": {
        "label": "NVIDIA Nemotron Nano 9B v2",
        "model_id": "nvidia.nemotron-nano-9b-v2",
        "provider": "nvidia",
        "reasoning": False,
    },
    # OpenAI
    "gpt_oss_120b_bedrock": {
        "label": "gpt-oss-120b",
        "model_id": "openai.gpt-oss-120b-1:0",
        "provider": "openai",
        "reasoning": False,
    },
    "gpt_oss_20b_bedrock": {
        "label": "gpt-oss-20b",
        "model_id": "openai.gpt-oss-20b-1:0",
        "provider": "openai",
        "reasoning": False,
    },
    "gpt_oss_safeguard_120b_bedrock": {
        "label": "GPT OSS Safeguard 120B",
        "model_id": "openai.gpt-oss-safeguard-120b",
        "provider": "openai",
        "reasoning": False,
    },
    "gpt_oss_safeguard_20b_bedrock": {
        "label": "GPT OSS Safeguard 20B",
        "model_id": "openai.gpt-oss-safeguard-20b",
        "provider": "openai",
        "reasoning": False,
    },
    # Qwen
    "qwen_3_30b_a3b_bedrock": {
        "label": "Qwen3-Coder-30B-A3B-Instruct",
        "model_id": "qwen.qwen3-coder-30b-a3b-v1:0",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    "qwen_3_32b_bedrock": {
        "label": "Qwen3 32B (dense)",
        "model_id": "qwen.qwen3-32b-v1:0",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    "qwen_3_80b_bedrock": {
        "label": "Qwen3 Next 80B A3B",
        "model_id": "qwen.qwen3-next-80b-a3b",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    "qwen_3_coder_next_bedrock": {
        "label": "Qwen3 Coder Next",
        "model_id": "qwen.qwen3-coder-next",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    "qwen_3_235b_a22b_2507_bedrock": {
        "label": "Qwen3 235B A22B 2507",
        "model_id": "qwen.qwen3-235b-a22b-2507-v1:0",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    "qwen_3_coder_480b_a35b_bedrock": {
        "label": "Qwen3 Coder 480B A35B Instruct",
        "model_id": "qwen.qwen3-coder-480b-a35b-v1:0",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
    # Z.AI
    "glm_4_7_flash_bedrock": {
        "label": "GLM 4.7 Flash",
        "model_id": "zai.glm-4.7-flash",
        "provider": "z_ai",
        "reasoning": False,
    },
    "glm_4_7_bedrock": {
        "label": "GLM 4.7",
        "model_id": "zai.glm-4.7",
        "provider": "z_ai",
        "reasoning": False,
    },
    "glm_5_bedrock": {
        "label": "GLM 5",
        "model_id": "zai.glm-5",
        "provider": "z_ai",
        "reasoning": False,
    },
}

LLM_BEDROCK_CANONICAL_NAME_TO_DISPLAY: dict[str, str] = {
    _canonical_name: _model.get("label", "")
    for _canonical_name, _model in LLM_BEDROCK_CATALOG.items()
}

# Bedrock batch catalog (execution mode = bedrock_batch). Mirrors
# LLM_BEDROCK_CATALOG's model_id/provider mappings — the same foundation
# models are addressable through AWS Bedrock's native batch inference API,
# just via create_model_invocation_job instead of converse().
LLM_BEDROCK_BATCH_CATALOG: LlmCatalog = {
    f"{key.removesuffix('_bedrock')}_bedrock_batch": dict(value)
    for key, value in LLM_BEDROCK_CATALOG.items()
}

# API catalog keyed by runtime canonical model names (execution mode = api).
LLM_API_CATALOG: LlmCatalog = {
    # Google
    "gemini_2_5_flash_api": {
        "label": "Gemini 2.5 Flash",
        "model_id": "gemini-2.5-flash",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_2_5_flash_lite_api": {
        "label": "Gemini 2.5 Flash Lite",
        "model_id": "gemini-2.5-flash-lite",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_2_5_flash_reasoning_api": {
        "label": "Gemini 2.5 Flash Reasoning",
        "model_id": "gemini-2.5-flash-reasoning",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_2_5_pro_api": {
        "label": "Gemini 2.5 Pro",
        "model_id": "gemini-2.5-pro",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_1_flash_lite_api": {
        "label": "Gemini 3.1 Flash Lite",
        "model_id": "gemini-3.1-flash-lite",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_1_flash_lite_preview_api": {
        "label": "Gemini 3.1 Flash Lite Preview",
        "model_id": "gemini-3.1-flash-lite-preview",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_1_pro_api": {
        "label": "Gemini 3.1 Pro",
        "model_id": "gemini-3.1-pro",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_1_pro_preview_api": {
        "label": "Gemini 3.1 Pro Preview",
        "model_id": "gemini-3.1-pro-preview",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_5_flash_api": {
        "label": "Gemini 3.5 Flash",
        "model_id": "gemini-3.5-flash",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_5_pro_api": {
        "label": "Gemini 3.5 Pro",
        "model_id": "gemini-3.5-pro",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_deep_think_api": {
        "label": "Gemini 3 Deep Think",
        "model_id": "gemini-3-deep-think",
        "provider": "google",
        "reasoning": "LLM_MODEL_GEMINI_REASONING",
        "apikey": "LLM_APIKEY_GEMINI",
    },
    "gemini_3_flash_preview_api": {
        "label": "Gemini 3 Flash Preview",
        "model_id": "gemini-3-flash-preview",
        "provider": "google",
        "reasoning": False,
        "apikey": "LLM_APIKEY_GEMINI",
    },
    # OpenAI
    "openai_gpt_4_1_api": {
        "label": "OpenAI GPT-4.1",
        "model_id": "gpt-4.1",
        "provider": "openai",
        "reasoning": False,
        "apikey": "LLM_APIKEY_OPENAI",
    },
    "openai_gpt_5_2_api": {
        "label": "OpenAI GPT-5.2",
        "model_id": "gpt-5.2",
        "provider": "openai",
        "reasoning": "LLM_MODEL_OPENAI_REASONING",
        "apikey": "LLM_APIKEY_OPENAI",
    },
    "openai_gpt_5_api": {
        "label": "OpenAI GPT-5",
        "model_id": "gpt-5",
        "provider": "openai",
        "reasoning": "LLM_MODEL_OPENAI_REASONING",
        "apikey": "LLM_APIKEY_OPENAI",
    },
    "openai_gpt_5_4_api": {
        "label": "OpenAI GPT-5.4",
        "model_id": "gpt-5.4",
        "provider": "openai",
        "reasoning": "LLM_MODEL_OPENAI_REASONING",
        "apikey": "LLM_APIKEY_OPENAI",
    },
    "openai_gpt_5_5_api": {
        "label": "OpenAI GPT-5.5",
        "model_id": "gpt-5.5",
        "provider": "openai",
        "reasoning": "LLM_MODEL_OPENAI_REASONING",
        "apikey": "LLM_APIKEY_OPENAI",
    },
}

# Local catalog keyed by runtime canonical model names (execution mode = local/batch).
LLM_LOCAL_CATALOG: LlmCatalog = {
    # Mistral AI
    "ministral_3_8b_local": {
        "label": "Ministral 3 8B",
        "model_id": "ministral-3:8b",
        "provider": "mistral_ai",
        "reasoning": False,
        "local_url": "LLM_LOCAL_URL",
    },
    # Qwen
    "qwen_3_8b_local": {
        "label": "Qwen 3 8B",
        "model_id": "qwen3:8b",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
        "local_url": "LLM_LOCAL_URL",
    },
    "qwen_3_1_7b_local": {
        "label": "Qwen 3 1.7B",
        "model_id": "qwen3:1.7b",
        "provider": "qwen",
        "reasoning": False,
        "local_url": "LLM_LOCAL_URL",
    },
    "qwen_2_5_3b_local": {
        "label": "Qwen 2.5 3B",
        "model_id": "qwen2.5:3b",
        "provider": "qwen",
        "reasoning": False,
        "local_url": "LLM_LOCAL_URL",
    },
}

# Batch catalog keyed by runtime canonical model names (execution mode = batch).
LLM_BATCH_CATALOG: LlmCatalog = {
    # Mistral AI
    "ministral_3_8b_batch": {
        "label": "Ministral 3 8B",
        "model_id": "ministral-3:8b",
        "provider": "mistral_ai",
        "reasoning": False,
    },
    # Qwen
    "qwen_3_8b_batch": {
        "label": "Qwen 3 8B",
        "model_id": "qwen3:8b",
        "provider": "qwen",
        "reasoning": "LLM_MODEL_QWEN_REASONING",
    },
}


def resolve_llm_label(runtime_model_key: str) -> str:
    ollama_model = LLM_LOCAL_CATALOG.get(runtime_model_key, {})
    if isinstance(ollama_model, dict):
        label = str(ollama_model.get("label", "")).strip()
        if label:
            return label
    api_model = LLM_API_CATALOG.get(runtime_model_key, {})
    if isinstance(api_model, dict):
        label = str(api_model.get("label", "")).strip()
        if label:
            return label
    bedrock_model = LLM_BEDROCK_CATALOG.get(runtime_model_key, {})
    if isinstance(bedrock_model, dict):
        label = str(bedrock_model.get("label", "")).strip()
        if label:
            return label
    return runtime_model_key


def resolve_ollama_model(runtime_model_key: str) -> LlmCatalogEntry:
    model = LLM_LOCAL_CATALOG.get(runtime_model_key)
    if model is None:
        return {}
    return model


class LlmModelResolver:
    @staticmethod
    def resolve_bedrock_model_id(runtime_model_key: str) -> str:
        model = LLM_BEDROCK_CATALOG.get(runtime_model_key, {})
        if not isinstance(model, dict):
            return ""
        return str(model.get("model_id", "")).strip()


def resolve_bedrock_model_id(runtime_model_key: str) -> str:
    return LlmModelResolver.resolve_bedrock_model_id(runtime_model_key)
