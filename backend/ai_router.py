"""
NetPulse AI - Multi-Provider AI Router
Routes requests to the best AI provider based on task type.
"""
import httpx
import asyncio
import json
from typing import Optional, AsyncGenerator
from config import settings


class AIProvider:
    """Single AI provider wrapper."""

    def __init__(self, name: str, base_url: str, api_key: str, models: list[str], is_gemini: bool = False):
        self.name = name
        self.base_url = base_url
        self.api_key = api_key
        self.models = models
        self.available = bool(api_key)
        self.is_gemini = is_gemini

    async def chat(self, model: str, messages: list, max_tokens: int = 1024, temperature: float = 0.7) -> dict:
        if not self.available:
            raise ValueError(f"Provider {self.name} not configured")

        if self.is_gemini:
            return await self._gemini_chat(model, messages, max_tokens, temperature)
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def stream_chat(self, model: str, messages: list, max_tokens: int = 1024, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        if not self.available:
            yield json.dumps({"error": f"Provider {self.name} not configured"})
            return

        if self.is_gemini:
            async for chunk in self._gemini_stream(model, messages, max_tokens, temperature):
                yield chunk
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", f"{self.base_url}/chat/completions", headers=headers, json=payload) as response:
                response.raise_for_status()
                async for chunk in response.aiter_lines():
                    if chunk.startswith("data: ") and chunk != "data: [DONE]":
                        try:
                            data = json.loads(chunk[6:])
                            if "choices" in data and len(data["choices"]) > 0:
                                delta = data["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield json.dumps({"content": content}) + "\n"
                        except Exception as e:
                            pass

    async def _gemini_chat(self, model: str, messages: list, max_tokens: int, temperature: float) -> dict:
        gemini_messages = self._convert_to_gemini_format(messages)
        
        url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
        payload = {
            "contents": gemini_messages,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            content = ""
            if "candidates" in data and len(data["candidates"]) > 0:
                content = data["candidates"][0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
            return {
                "choices": [{"message": {"content": content}}]
            }

    async def _gemini_stream(self, model: str, messages: list, max_tokens: int, temperature: float) -> AsyncGenerator[str, None]:
        gemini_messages = self._convert_to_gemini_format(messages)
        
        url = f"{self.base_url}/{model}:streamGenerateContent?key={self.api_key}"
        payload = {
            "contents": gemini_messages,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                buffer = ""
                async for chunk in response.aiter_text():
                    buffer += chunk
                    # Simple regex or parsing to extract text from the JSON stream
                    # Gemini streams a JSON array of objects. We'll extract text parts.
                    import re
                    texts = re.findall(r'"text":\s*"([^"]+)"', chunk)
                    for text in texts:
                        # Unescape basic JSON string stuff
                        text = text.replace('\\n', '\n').replace('\\"', '"').replace('\\t', '\t')
                        yield json.dumps({"content": text}) + "\n"

    def _convert_to_gemini_format(self, messages: list) -> list:
        gemini_messages = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            if msg["role"] == "system":
                # Gemini doesn't have a direct system role in the same way, we prepend it to the first user message
                continue
                
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })
            
        # Handle system prompt
        system_msgs = [m["content"] for m in messages if m["role"] == "system"]
        if system_msgs and gemini_messages:
            gemini_messages[0]["parts"][0]["text"] = f"System Instruction: {system_msgs[0]}\n\n" + gemini_messages[0]["parts"][0]["text"]
            
        return gemini_messages


class AIRouter:
    """Routes AI requests to optimal providers."""

    def __init__(self):
        self.providers = {
            "gemini": AIProvider(
                name="Google Gemini",
                base_url=settings.GEMINI_URL,
                api_key=settings.GEMINI_API_KEY,
                models=["gemini-1.5-flash", "gemini-1.5-pro"],
                is_gemini=True
            ),
            "mistral": AIProvider(
                name="Mistral AI",
                base_url=settings.MISTRAL_URL,
                api_key=settings.MISTRAL_API_KEY,
                models=["mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
            ),
            "groq": AIProvider(
                name="Groq",
                base_url=settings.GROQ_URL,
                api_key=settings.GROQ_API_KEY,
                models=["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
            ),
            "cerebras": AIProvider(
                name="Cerebras",
                base_url=settings.CEREBRAS_URL,
                api_key=settings.CEREBRAS_API_KEY,
                models=["gpt-oss-120b", "gemma-4-31b"],
            ),
            "sambanova": AIProvider(
                name="SambaNova",
                base_url=settings.SAMBANOVA_URL,
                api_key=settings.SAMBANOVA_API_KEY,
                models=["DeepSeek-V3.1", "MiniMax-M2.7"],
            ),
            "cohere": AIProvider(
                name="Cohere",
                base_url=settings.COHERE_URL,
                api_key=settings.COHERE_API_KEY,
                models=["command-r-plus", "command-r", "command-r7b"],
            ),
            "nvidia": AIProvider(
                name="NVIDIA NIM",
                base_url=settings.NVIDIA_URL,
                api_key=settings.NVIDIA_API_KEY,
                models=["meta/llama-3.3-70b-instruct", "mistralai/mistral-large-2-instruct"],
            ),
            "openrouter": AIProvider(
                name="OpenRouter",
                base_url=settings.OPENROUTER_URL,
                api_key=settings.OPENROUTER_API_KEY,
                models=["nvidia/nemotron-4-340b-instruct", "meta-llama/llama-3-70b-instruct"],
            ),
        }

        # Task-to-provider routing map
        self.task_routing = {
            "diagnostic": {"primary": "gemini", "fallback": "groq", "model_primary": "gemini-1.5-flash", "model_fallback": "llama-3.3-70b-versatile"},
            "analysis": {"primary": "gemini", "fallback": "mistral", "model_primary": "gemini-1.5-flash", "model_fallback": "mistral-medium-latest"},
            "code": {"primary": "mistral", "fallback": "gemini", "model_primary": "codestral-latest", "model_fallback": "gemini-1.5-flash"},
            "report": {"primary": "gemini", "fallback": "groq", "model_primary": "gemini-1.5-flash", "model_fallback": "llama-3.3-70b-versatile"},
            "chat": {"primary": "groq", "fallback": "gemini", "model_primary": "llama-3.3-70b-versatile", "model_fallback": "gemini-1.5-flash"},
            "security": {"primary": "groq", "fallback": "gemini", "model_primary": "llama-3.3-70b-versatile", "model_fallback": "gemini-1.5-flash"},
            "prediction": {"primary": "gemini", "fallback": "mistral", "model_primary": "gemini-1.5-flash", "model_fallback": "mistral-medium-latest"},
            "documentation": {"primary": "gemini", "fallback": "groq", "model_primary": "gemini-1.5-flash", "model_fallback": "llama-3.3-70b-versatile"},
        }

    async def stream_route(self, task_type: str, messages: list, max_tokens: int = 1024, temperature: float = 0.7) -> AsyncGenerator[str, None]:
        """Stream route to the best provider."""
        routing = self.task_routing.get(task_type, self.task_routing["chat"])

        primary = self.providers[routing["primary"]]
        if primary.available:
            try:
                yield json.dumps({"_provider": routing["primary"], "_model": routing["model_primary"]}) + "\n"
                async for chunk in primary.stream_chat(routing["model_primary"], messages, max_tokens, temperature):
                    yield chunk
                return
            except Exception as e:
                print(f"Primary provider stream {routing['primary']} failed: {e}")

        fallback = self.providers[routing["fallback"]]
        if fallback.available:
            try:
                yield json.dumps({"_provider": routing["fallback"], "_model": routing["model_fallback"]}) + "\n"
                async for chunk in fallback.stream_chat(routing["model_fallback"], messages, max_tokens, temperature):
                    yield chunk
                return
            except Exception as e:
                print(f"Fallback provider stream {routing['fallback']} failed: {e}")
                
        yield json.dumps({"error": "All providers failed"}) + "\n"

    async def route(self, task_type: str, messages: list, max_tokens: int = 1024, temperature: float = 0.7) -> dict:
        """Route to the best provider for the task."""
        routing = self.task_routing.get(task_type, self.task_routing["chat"])

        primary = self.providers[routing["primary"]]
        if primary.available:
            try:
                result = await primary.chat(routing["model_primary"], messages, max_tokens, temperature)
                result["_provider"] = routing["primary"]
                result["_model"] = routing["model_primary"]
                return result
            except Exception as e:
                print(f"Primary provider {routing['primary']} failed: {e}")

        fallback = self.providers[routing["fallback"]]
        if fallback.available:
            try:
                result = await fallback.chat(routing["model_fallback"], messages, max_tokens, temperature)
                result["_provider"] = routing["fallback"]
                result["_model"] = routing["model_fallback"]
                return result
            except Exception as e:
                print(f"Fallback provider {routing['fallback']} failed: {e}")

        raise ValueError(f"All providers failed for task: {task_type}")

    def get_status(self) -> dict:
        """Get status of all providers."""
        return {
            name: {
                "available": provider.available,
                "name": provider.name,
                "models": provider.models,
            }
            for name, provider in self.providers.items()
        }


ai_router = AIRouter()
