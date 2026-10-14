"""US-027 original signals; offline verification never runs or plays FFmpeg."""

import argparse
import array
import hashlib
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[2]
DESTINATION = ROOT / "assets/regulation-sounds"
RATE = 24000
DURATION = 23
RECIPES = {
    "white": {"color": "white", "seed": 2701, "filter": "anull"},
    "brown": {"color": "brown", "seed": 2702, "filter": "highpass=f=25,lowpass=f=3500"},
    "rain": {
        "color": "pink", "seed": 2703,
        "filter": "highpass=f=450,lowpass=f=8500,aeval=val(0)*(0.85+0.15*sin(2*PI*t/3.7))",
    },
    "ocean": {
        "color": "pink", "seed": 2704,
        "filter": "highpass=f=45,lowpass=f=1800,aeval=val(0)*(0.65+0.35*sin(2*PI*t/7.5))",
    },
}


def inspect_wav(path):
    with wave.open(str(path), "rb") as audio:
        parameters = (audio.getnchannels(), audio.getsampwidth(), audio.getframerate(),
                      audio.getnframes(), audio.getcomptype())
        if parameters != (1, 2, RATE, RATE * DURATION, "NONE"):
            raise ValueError(f"Expected 23 seconds of mono 24kHz PCM16, got {parameters}")
        samples = array.array("h", audio.readframes(audio.getnframes()))
    if sys.byteorder != "little":
        samples.byteswap()
    rms = math.sqrt(sum(value * value for value in samples) / len(samples)) / 32768
    peak = max(abs(value) for value in samples) / 32768
    window = RATE // 10
    minimum_window_rms = min(
        math.sqrt(sum(value * value for value in samples[start:start + window]) / window) / 32768
        for start in range(0, len(samples), window)
    )
    return {
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size,
        "rms": rms,
        "peak": peak,
        "mean": sum(samples) / len(samples) / 32768,
        "minimum_100ms_rms": minimum_window_rms,
        "loop_step": abs(samples[0] - samples[-1]) / 32768,
        "maximum_internal_step": max(abs(b - a) for a, b in zip(samples, samples[1:])) / 32768,
    }


def validate_metrics(metrics):
    if not (0.012 <= metrics["rms"] <= 0.08 and metrics["peak"] <= 0.281
            and abs(metrics["mean"]) <= 0.01 and metrics["minimum_100ms_rms"] >= 0.005
            and metrics["loop_step"] <= metrics["maximum_internal_step"]):
        raise ValueError("Signal level, silence or loop discontinuity outside validation bounds")


def verify(destination=DESTINATION):
    manifest = json.loads((destination / "manifest.json").read_text())
    if manifest.get("license") != "Apache-2.0" or manifest.get("recipes") != RECIPES:
        raise ValueError("Unexpected asset provenance")
    if set(manifest.get("assets", {})) != set(RECIPES):
        raise ValueError("Expected four original assets")
    digests = set()
    for sound_id in RECIPES:
        actual = inspect_wav(destination / f"{sound_id}.wav")
        validate_metrics(actual)
        if actual != manifest["assets"][sound_id]:
            raise ValueError("Asset does not match its recorded metrics/checksum")
        digests.add(actual["sha256"])
    if len(digests) != 4:
        raise ValueError("Duplicated signal")
    return manifest


def ffmpeg(*arguments):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-n", *arguments],
                   check=True, timeout=60, capture_output=True)


def generate(destination=DESTINATION):
    # Refuse any existing destination, including symlinks, before generating files.
    if destination.exists() or destination.is_symlink():
        raise FileExistsError("Destination already exists; verify it or choose an absent directory")
    destination.parent.mkdir(parents=True, exist_ok=True)
    version = subprocess.check_output(["ffmpeg", "-version"], text=True, timeout=10).splitlines()[0]
    with tempfile.TemporaryDirectory(prefix="tear-audio-", dir=destination.parent) as temporary:
        staging = Path(temporary) / "assets"
        staging.mkdir()
        metrics = {}
        for sound_id, recipe in RECIPES.items():
            source = f"anoisesrc=color={recipe['color']}:seed={recipe['seed']}:r={RATE}:d=24:a=0.5"
            signal = Path(temporary) / f"{sound_id}-source.wav"
            ffmpeg("-f", "lavfi", "-i", source, "-af", recipe["filter"],
                   "-c:a", "pcm_s16le", str(signal))
            # Rotate the body, then crossfade tail into head; the file wrap joins
            # consecutive samples near t=2, rather than unrelated noise endpoints.
            graph = (
                "[0:a]atrim=start=2:end=22,asetpts=PTS-STARTPTS[b];"
                "[1:a]atrim=start=22:end=24,asetpts=PTS-STARTPTS[t];"
                "[2:a]atrim=start=0:end=2,asetpts=PTS-STARTPTS[h];"
                "[t][h]acrossfade=d=1:c1=qsin:c2=qsin[s];"
                "[b][s]concat=n=2:v=0:a=1[out]"
            )
            raw = Path(temporary) / f"{sound_id}.wav"
            ffmpeg("-i", str(signal), "-i", str(signal), "-i", str(signal), "-filter_complex", graph,
                   "-map", "[out]", "-ac", "1", "-ar", str(RATE), "-c:a", "pcm_s16le", str(raw))
            raw_metrics = inspect_wav(raw)
            gain = min(0.075 / raw_metrics["rms"], 0.28 / raw_metrics["peak"])
            output = staging / f"{sound_id}.wav"
            ffmpeg("-i", str(raw), "-af", f"volume={gain:.12f}", "-map_metadata", "-1",
                   "-ac", "1", "-ar", str(RATE), "-c:a", "pcm_s16le", str(output))
            metrics[sound_id] = inspect_wav(output)
            validate_metrics(metrics[sound_id])
        manifest = {"license": "Apache-2.0", "ffmpeg": version, "recipes": RECIPES, "assets": metrics}
        (staging / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
        verify(staging)
        # Reserve exclusively; never replace a directory created concurrently.
        destination.mkdir()
        for asset in staging.iterdir():
            with asset.open("rb") as source_file, (destination / asset.name).open("xb") as target:
                shutil.copyfileobj(source_file, target)
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--generate", action="store_true", help="Generate only into an absent directory")
    parser.add_argument("--output", type=Path, default=DESTINATION)
    arguments = parser.parse_args()
    result = generate(arguments.output) if arguments.generate else verify(arguments.output)
    for name, metrics in result["assets"].items():
        print(f"{name}: verified PCM16/24kHz/23s, RMS={metrics['rms']:.5f}, peak={metrics['peak']:.5f}")
