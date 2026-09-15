"""
Continuous audio capture to WAV, per Blueprint Section F.8.

The eventual boardroom deployment taps the Vak 40.s Balanced/Record Out
through a USB audio interface. On this dev machine there's no such tap,
so capture defaults to whatever input device the OS reports — pass
--device to pick a specific one (e.g. a USB interface) once available.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

import numpy as np
import sounddevice as sd
import soundfile as sf

from config import PipelineConfig


def list_input_devices() -> None:
    print("Available input devices:")
    for idx, dev in enumerate(sd.query_devices()):
        if dev["max_input_channels"] > 0:
            default_marker = " (default)" if idx == sd.default.device[0] else ""
            print(f"  [{idx}] {dev['name']} - {dev['max_input_channels']} ch{default_marker}")


def record_to_file(
    output_path: Path,
    config: PipelineConfig,
    duration_seconds: float | None = None,
) -> Path:
    """
    Record from the configured input device to `output_path` (WAV, 16 kHz mono).

    If duration_seconds is None, records until interrupted with Ctrl+C —
    matching how a real meeting capture daemon runs (start of meeting to end).
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Recording to {output_path}")
    print(f"  sample_rate={config.sample_rate} Hz  channels={config.channels}  "
          f"device={config.input_device if config.input_device is not None else 'default'}")
    print("  Press Ctrl+C to stop." if duration_seconds is None
          else f"  Recording for {duration_seconds:.0f}s...")

    with sf.SoundFile(
        str(output_path),
        mode="w",
        samplerate=config.sample_rate,
        channels=config.channels,
        subtype="PCM_16",
    ) as out_file:

        def callback(indata, frames, time_info, status):
            if status:
                print(f"  [audio warning] {status}", file=sys.stderr)
            out_file.write(indata.copy())

        start = time.time()
        with sd.InputStream(
            samplerate=config.sample_rate,
            channels=config.channels,
            dtype="int16",
            device=config.input_device,
            callback=callback,
        ):
            try:
                if duration_seconds is None:
                    while True:
                        time.sleep(0.2)
                else:
                    while time.time() - start < duration_seconds:
                        time.sleep(0.2)
            except KeyboardInterrupt:
                pass

    elapsed = time.time() - start
    print(f"  Stopped after {elapsed:.1f}s.")
    return output_path
