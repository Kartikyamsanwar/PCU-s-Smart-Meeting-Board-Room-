"""
Transcription with faster-whisper, per Blueprint Section F.10.

Takes the VAD-detected speech segments and transcribes only those windows
(via faster-whisper's clip_timestamps), instead of running STT over the
whole recording. Produces word-level timestamps and a log-probability-based
confidence proxy, feeding the HIGH/MEDIUM/LOW banding from Section F.30.
"""

from __future__ import annotations

from pathlib import Path

from faster_whisper import WhisperModel

from config import PipelineConfig

_model: WhisperModel | None = None
_model_key: tuple | None = None


def _get_model(config: PipelineConfig) -> WhisperModel:
    global _model, _model_key
    key = (config.whisper_model, config.whisper_device, config.whisper_compute_type)
    if _model is None or _model_key != key:
        print(f"Loading faster-whisper model '{config.whisper_model}' "
              f"({config.whisper_device}/{config.whisper_compute_type})...")
        _model = WhisperModel(
            config.whisper_model,
            device=config.whisper_device,
            compute_type=config.whisper_compute_type,
        )
        _model_key = key
    return _model


def _confidence_band(avg_logprob: float, config: PipelineConfig) -> str:
    if avg_logprob >= config.high_confidence_logprob:
        return "HIGH"
    if avg_logprob >= config.medium_confidence_logprob:
        return "MEDIUM"
    return "LOW"


def transcribe_segments(
    wav_path: Path,
    speech_segments: list[dict],
    config: PipelineConfig,
) -> list[dict]:
    """
    Transcribes only the given VAD speech windows.
    Returns a list of segment dicts matching the shape SBMIS's
    `speech_segments` DB table (Section F.20) will eventually store:
    start_ts, end_ts, text, avg_logprob, no_speech_prob, confidence, words.
    """
    if not speech_segments:
        return []

    model = _get_model(config)

    # faster-whisper's clip_timestamps takes a flat "start,end,start,end,..." string (seconds)
    clip_timestamps = ",".join(
        f"{seg['start']:.3f},{seg['end']:.3f}" for seg in speech_segments
    )

    segments, info = model.transcribe(
        str(wav_path),
        language=config.language,
        word_timestamps=True,
        clip_timestamps=clip_timestamps,
        vad_filter=False,  # we already ran Silero VAD ourselves
    )

    results = []
    for seg in segments:
        results.append({
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
            "avg_logprob": round(seg.avg_logprob, 4),
            "no_speech_prob": round(seg.no_speech_prob, 4),
            "confidence": _confidence_band(seg.avg_logprob, config),
            "words": [
                {"word": w.word, "start": round(w.start, 3), "end": round(w.end, 3),
                 "probability": round(w.probability, 4)}
                for w in (seg.words or [])
            ],
        })
    return results
