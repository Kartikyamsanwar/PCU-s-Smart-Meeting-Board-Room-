"""
Pipeline configuration for the SBMIS Phase 1 PoC.

Phase 1 scope (per the Technical Blueprint, Section F.35/36):
single audio stream -> Silero VAD -> faster-whisper STT.
No speaker attribution yet (that's Phase 2, gated on the Plan A/B/C
hardware decision in Section 6).
"""

from dataclasses import dataclass


@dataclass
class PipelineConfig:
    # Audio
    sample_rate: int = 16000  # required by both Silero VAD and Whisper
    channels: int = 1
    input_device: int | None = None  # None = system default input device

    # VAD (Silero) — Section F.11
    vad_threshold: float = 0.5
    min_speech_duration_ms: int = 250
    min_silence_duration_ms: int = 300
    speech_pad_ms: int = 200

    # STT (faster-whisper) — Section F.10
    whisper_model: str = "medium"  # tiny / base / small / medium / large-v3
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"  # int8 is the practical choice for CPU
    language: str = "en"

    # Confidence banding — Section F.30 (thresholds are a starting point;
    # tune against the Phase 1 accuracy audit in Section F.34)
    high_confidence_logprob: float = -0.35
    medium_confidence_logprob: float = -0.75
