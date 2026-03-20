import anthropic
import openai

from app.config import settings

claude_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

# Unified LLM client — uses Euron (OpenAI-compatible) or OpenAI based on LLM_PROVIDER.
# All services import `openai_client` and `settings.llm_model` to stay provider-agnostic.
if settings.llm_provider.lower() == "euron" and settings.euron_api_key:
    openai_client = openai.AsyncOpenAI(
        api_key=settings.euron_api_key,
        base_url=settings.euron_base_url,
    )
else:
    openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
