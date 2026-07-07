"""
Pluggable AI abstraction layer. Per the "AI Architecture" spec: no models are trained or
shipped yet — only stable interfaces so a real engine can be dropped in later (or swapped
for a native C implementation, see /native_engine) without touching caller code.
"""
from abc import ABC, abstractmethod


class FaceRecognitionEngine(ABC):
    @abstractmethod
    def compute_embedding(self, image_path: str) -> list[float] | None:
        """Return a face embedding vector for the given image, or None if no face is found."""

    @abstractmethod
    def similarity(self, embedding_a: list[float], embedding_b: list[float]) -> float:
        """Return a 0-1 similarity score between two embeddings."""


class ImageEnhancementEngine(ABC):
    @abstractmethod
    def enhance(self, image_path: str) -> str:
        """Apply brightness/contrast/sharpen/noise-removal, return the path of the processed image."""

    @abstractmethod
    def detect_blur(self, image_path: str) -> float:
        """Return a blur score; higher means blurrier."""


class DuplicateDetectionEngine(ABC):
    @abstractmethod
    def find_duplicates(self, report) -> list:
        """Return other reports likely describing the same person/case."""


class TranslationEngine(ABC):
    @abstractmethod
    def translate(self, text: str, target_language: str) -> str:
        """Translate text into one of the supported Indian languages."""


class NotConfiguredEngine(FaceRecognitionEngine, ImageEnhancementEngine, DuplicateDetectionEngine, TranslationEngine):
    """Default no-op engine used until a real backend is configured via settings.AI_ENGINE_BACKEND."""

    def compute_embedding(self, image_path: str) -> list[float] | None:
        return None

    def similarity(self, embedding_a: list[float], embedding_b: list[float]) -> float:
        return 0.0

    def enhance(self, image_path: str) -> str:
        return image_path

    def detect_blur(self, image_path: str) -> float:
        return 0.0

    def find_duplicates(self, report) -> list:
        return []

    def translate(self, text: str, target_language: str) -> str:
        return text


def get_engine() -> NotConfiguredEngine:
    """Factory for the configured AI engine. Swap this to return a real implementation later."""
    return NotConfiguredEngine()
