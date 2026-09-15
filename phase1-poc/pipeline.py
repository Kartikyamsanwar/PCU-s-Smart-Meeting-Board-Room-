"""
Phase 1 PoC entry point: audio capture -> Silero VAD -> faster-whisper STT.

This validates the STT-quality assumption (Section F.10, esp. Indian-English
accuracy) independently of the RS232/Plan A-B-C hardware question — per
Section F.42, Next Step 3, it doesn't need that answer to proceed.

Usage:
    python pipeline.py --list-devices
    python pipeline.py --record 60                 # record 60s from default mic, then transcribe
    python pipeline.py --record                     # record until Ctrl+C, then transcribe
    python pipeline.py --input recordings/foo.wav   # transcribe an existing recording
    python pipeline.py --input foo.wav --model small --language en
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import time
from pathlib import Path

from audio_capture import list_input_devices, record_to_file
from config import PipelineConfig
from transcribe import transcribe_segments
from vad_segment import get_speech_segments

BASE_DIR = Path(__file__).parent
RECORDINGS_DIR = BASE_DIR / "recordings"
TRANSCRIPTS_DIR = BASE_DIR / "transcripts"


def format_timestamp(seconds: float) -> str:
    m, s = divmod(seconds, 60)
    h, m = divmod(int(m), 60)
    return f"{h:02d}:{int(m):02d}:{s:05.2f}"


def print_transcript(segments: list[dict]) -> None:
    if not segments:
        print("(no speech detected)")
        return
    print("\n--- Transcript ---")
    for seg in segments:
        ts = f"[{format_timestamp(seg['start'])} - {format_timestamp(seg['end'])}]"
        print(f"{ts} ({seg['confidence']:<6}) {seg['text']}")
    print("--- End ---\n")


def run(args: argparse.Namespace) -> None:
    config = PipelineConfig()
    if args.device is not None:
        config.input_device = args.device
    if args.model:
        config.whisper_model = args.model
    if args.language:
        config.language = args.language
    if args.compute_type:
        config.whisper_compute_type = args.compute_type

    RECORDINGS_DIR.mkdir(exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(exist_ok=True)

    if args.input:
        wav_path = Path(args.input)
        if not wav_path.exists():
            raise SystemExit(f"Input file not found: {wav_path}")
    else:
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        wav_path = RECORDINGS_DIR / f"meeting-{timestamp}.wav"
        record_to_file(wav_path, config, duration_seconds=args.record)

    print(f"\nRunning Silero VAD on {wav_path.name}...")
    t0 = time.time()
    speech_segments = get_speech_segments(wav_path, config)
    print(f"  {len(speech_segments)} speech segment(s) detected in {time.time() - t0:.1f}s")

    print(f"Transcribing with faster-whisper ({config.whisper_model})...")
    t0 = time.time()
    transcript_segments = transcribe_segments(wav_path, speech_segments, config)
    print(f"  Done in {time.time() - t0:.1f}s")

    print_transcript(transcript_segments)

    out_path = Path(args.out) if args.out else TRANSCRIPTS_DIR / f"{wav_path.stem}.json"
    out_path.write_text(
        json.dumps(
            {
                "source_audio": str(wav_path),
                "config": dataclasses.asdict(config),
                "segments": transcript_segments,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Transcript saved to {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="SBMIS Phase 1 PoC: capture -> VAD -> STT")
    parser.add_argument("--list-devices", action="store_true", help="List audio input devices and exit")
    parser.add_argument("--record", type=float, nargs="?", const=None, default=argparse.SUPPRESS,
                         help="Record from mic for N seconds (omit N to record until Ctrl+C)")
    parser.add_argument("--input", type=str, help="Transcribe an existing WAV file instead of recording")
    parser.add_argument("--device", type=int, default=None, help="Input device index (see --list-devices)")
    parser.add_argument("--model", type=str, default=None,
                         help="faster-whisper model size: tiny/base/small/medium/large-v3 (default: medium)")
    parser.add_argument("--language", type=str, default=None, help="Language code (default: en)")
    parser.add_argument("--compute-type", type=str, default=None,
                         help="faster-whisper compute type, e.g. int8, float32 (default: int8)")
    parser.add_argument("--out", type=str, default=None, help="Output transcript JSON path")
    args = parser.parse_args()

    if args.list_devices:
        list_input_devices()
        return

    if not args.input and not hasattr(args, "record"):
        parser.error("Specify either --input <wav file> or --record [seconds]")

    if not hasattr(args, "record"):
        args.record = None

    run(args)


if __name__ == "__main__":
    main()
