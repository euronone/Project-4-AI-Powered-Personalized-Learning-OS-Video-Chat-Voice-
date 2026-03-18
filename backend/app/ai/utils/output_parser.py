import json
import logging
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

class StructuredOutputParserError(Exception):
    """Custom exception raised when output parsing or validation fails."""
    pass

class StructuredOutputParser:
    """
    Parses string outputs from LLMs into structured Pydantic models.
    """
    
    @classmethod
    def parse(cls, text: str, schema: Type[T]) -> T:
        """
        Parses the text, extracts JSON, and validates against the provided Pydantic schema.
        Includes a deterministic retry mechanism if initial parsing fails.
        """
        try:
            return cls._attempt_parse(text, schema)
        except (json.JSONDecodeError, ValidationError) as initial_error:
            logger.warning(f"Initial JSON parsing failed: {initial_error}. Attempting aggressive fallback extraction.")
            # Retry Once: Aggressive extraction fallback
            try:
                start_idx = text.find('{')
                end_idx = text.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    aggressive_text = text[start_idx:end_idx + 1]
                    return cls._attempt_parse(aggressive_text, schema, fallback=True)
                # If no braces found or extraction is invalid, raise original exception
                raise StructuredOutputParserError(f"Failed to parse structured output. Ensure the LLM returned valid JSON. Error: {initial_error}") from initial_error
            except Exception as fallback_error:
                raise StructuredOutputParserError(
                    f"Actionable JSON extraction failed during fallback retry: {fallback_error}\n"
                    f"Original text payload: {text}"
                ) from fallback_error
        except Exception as e:
            raise StructuredOutputParserError(f"Unexpected error during structured parsing: {str(e)}") from e

    @classmethod
    def _attempt_parse(cls, text: str, schema: Type[T], fallback: bool = False) -> T:
        """
        Internal mapping method formatting code blocks -> JSON dict -> Pydantic Model.
        """
        cleaned_text = text.strip()
        
        # Only process markdown syntax if we aren't already doing an aggressive fallback payload slice
        if not fallback:
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
                
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
                
            cleaned_text = cleaned_text.strip()
            
        # Optional JSON safety net logic could reside here in the future
        
        parsed_dict = json.loads(cleaned_text)
        return schema.model_validate(parsed_dict)
