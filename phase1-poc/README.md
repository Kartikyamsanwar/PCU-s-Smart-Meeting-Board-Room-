# SBMIS — Phase 1 PoC

Single-stream audio capture -> Silero VAD -> faster-whisper transcription.
No speaker attribution yet — that's Phase 2, and it's gated on the RS232
hardware question in the [Technical Blueprint](../SBMIS_Technical_Blueprint.md)
Section 6. This PoC exists to answer a question that *doesn't* depend on
that: **is STT quality (especially on Indian-accented English) good enough
on real boardroom-style audio?**

## Setup

```bash
cd phase1-poc
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

First run downloads models automatically: faster-whisper's `medium` model
(~1.5 GB, from Hugging Face) and Silero VAD's ONNX model (a few MB). Both
are cached locally afterward.

## Usage

List available microphones/audio interfaces:

```bash
python pipeline.py --list-devices
```

Record 60 seconds from the default input device and transcribe it:

```bash
python pipeline.py --record 60
```

Record until you press Ctrl+C (use this for a full mock meeting):

```bash
python pipeline.py --record
```

Transcribe an existing recording instead of capturing live audio (e.g. a
sample pulled from the boardroom once a tap point is available):

```bash
python pipeline.py --input recordings/meeting-20260101-090000.wav
```

Useful overrides:

```bash
python pipeline.py --record 60 --device 2 --model small --language en
```

- `--model` — `tiny` / `base` / `small` / `medium` / `large-v3`. Start with
  `small` for a quick smoke test; use `medium` (default) for real accuracy
  evaluation. `large-v3` is CPU-slow — reserve it for GPU hardware (Blueprint
  Section 31, Tier B).
- `--compute-type` — `int8` (default, fastest on CPU) or `float32`.

## Output

Each run prints a timestamped, confidence-banded transcript to the console
and writes the full result (including word-level timestamps and raw
log-probabilities) to `transcripts/<recording-name>.json`, shaped so it maps
directly onto the `speech_segments` table in the Blueprint's DB schema
(Section F.20):

```json
{
  "start": 12.34,
  "end": 15.02,
  "text": "I'd like to propose we move the budget review to next week.",
  "avg_logprob": -0.21,
  "no_speech_prob": 0.01,
  "confidence": "HIGH",
  "words": [ { "word": "I'd", "start": 12.34, "end": 12.5, "probability": 0.98 }, ... ]
}
```

## What this does and doesn't prove

- **Proves:** capture pipeline works end-to-end; VAD segmentation quality;
  STT accuracy on real speech in this environment; rough CPU latency budget
  for chunked transcription.
- **Doesn't prove:** anything about the actual boardroom acoustics, the Vak
  40.s tap point, RS232 availability, or multi-speaker overlap handling —
  those need the Section 6 discovery pass with real hardware and, ideally, a
  recording made in the actual room.

## Next steps (per Blueprint Section F.42)

1. Run this against a few minutes of real or simulated Indian-English board
   discussion; log transcription errors per the Section F.34 accuracy-audit
   process (STT errors, missed words, confidence-band calibration).
2. If accuracy is acceptable, move to Phase 2 once Plan A/B/C is confirmed
   (speaker attribution — serial-event parsing or diarization+enrollment).
3. If accuracy is marginal on Indian-accented speech, evaluate `large-v3`
   (needs GPU for reasonable latency) before considering fine-tuning.
