import os

import requests

from shared_libs.exceptions.api_exceptions import BadRequest


class LLMModelOllamaUtil:
    @staticmethod
    def _raise_ollama_unreachable(*, base_url: str, error: Exception) -> None:
        raise BadRequest(
            f"Unable to reach Ollama server at {base_url}: {error}. "
            f"Please verify LLM_LOCAL_URL and that the Ollama service is running."
        ) from error

    @staticmethod
    def _assert_ollama_model_installed(
        *, installed: list[str], model_tag: str, base_url: str
    ) -> None:
        if any(
            name == model_tag or name.split(":", 1)[0] == model_tag
            for name in installed
        ):
            return
        raise BadRequest(
            f"Ollama model '{model_tag}' is not installed on the server at {base_url}. "
            f"Please run `ollama pull {model_tag}` on the Ollama host first. "
            f"Installed models: {installed or 'none'}."
        )

    @staticmethod
    def assert_ollama_model_available(base_url: str, model_tag: str) -> None:
        try:
            resp = requests.get(f"{base_url.rstrip('/')}/api/tags", timeout=10)
            resp.raise_for_status()
            installed = [m.get("name", "") for m in resp.json().get("models", [])]
        except requests.RequestException as e:
            LLMModelOllamaUtil._raise_ollama_unreachable(base_url=base_url, error=e)

        LLMModelOllamaUtil._assert_ollama_model_installed(
            installed=installed,
            model_tag=model_tag,
            base_url=base_url,
        )

    @staticmethod
    def env_bool(name: str, default: bool = False) -> bool:
        raw_value = os.getenv(name)
        if raw_value is None:
            return default
        return raw_value.strip().lower() in {"1", "true", "yes", "y", "on"}
