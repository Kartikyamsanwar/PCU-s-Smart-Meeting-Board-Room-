"""
Speech-segment detection with Silero VAD, per Blueprint Section F.11.

Continuous audio -> Silero VAD -> speech-segment boundaries -> only those
segments get sent to faster-whisper. This is what keeps STT compute down
given how much of a board meeting is silence/pause.
"""

from __future__ import annotations

from pathlib import Path

import soundfile as sf
import torch
from silero_vad import get_speech_timestamps, load_silero_vad

from config import PipelineConfig

_model = None  # lazy singleton — loading the model is the expensive part


def _get_model():
    global _model
    if _model is None:
        _model = load_silero_vad(onnx=True)
    return _model


def _load_audio(wav_path: Path, expected_sample_rate: int) -> torch.Tensor:
    """
    Loads audio via soundfile directly (not silero_vad's own read_audio,
    which pulls in torchaudio's torchcodec backend — an extra native
    dependency this PoC doesn't need since our capture step already
    guarantees 16 kHz mono PCM WAV).
    """
    data, sample_rate = sf.read(str(wav_path), dtype="float32", always_2d=False)
    if data.ndim > 1:
        data = data.mean(axis=1)  # downmix to mono, just in case
    if sample_rate != expected_sample_rate:
        raise ValueError(
            f"{wav_path} is {sample_rate} Hz, expected {expected_sample_rate} Hz "
            "(capture/config sample rates must match)"
        )
    return torch.from_numpy(data)


def get_speech_segments(wav_path: Path, config: PipelineConfig) -> list[dict]:
    """
    Returns a list of {"start": float, "end": float} in seconds, one per
    detected speech segment.
    """
    model = _get_model()
    wav = _load_audio(wav_path, config.sample_rate)

    timestamps = get_speech_timestamps(
        wav,
        model,
        sampling_rate=config.sample_rate,
        threshold=config.vad_threshold,
        min_speech_duration_ms=config.min_speech_duration_ms,
        min_silence_duration_ms=config.min_silence_duration_ms,
        speech_pad_ms=config.speech_pad_ms,
        return_seconds=True,
    )
    return [{"start": ts["start"], "end": ts["end"]} for ts in timestamps]
