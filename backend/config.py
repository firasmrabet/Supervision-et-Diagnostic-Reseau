"""
NetPulse AI - Backend Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "NetPulse AI"
    VERSION = "1.0.0"
    SECRET_KEY = os.getenv("SECRET_KEY", "netpulse-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60

    # AI Providers
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY", "")
    SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY", "")
    COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

    # AI Provider URLs
    GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    MISTRAL_URL = "https://api.mistral.ai/v1"
    GROQ_URL = "https://api.groq.com/openai/v1"
    CEREBRAS_URL = "https://api.cerebras.ai/v1"
    SAMBANOVA_URL = "https://api.sambanova.ai/v1"
    COHERE_URL = "https://api.cohere.com/v2"
    NVIDIA_URL = "https://integrate.api.nvidia.com/v1"
    OPENROUTER_URL = "https://openrouter.ai/api/v1"
    GITHUB_URL = "https://models.github.ai/inference"


settings = Settings()
