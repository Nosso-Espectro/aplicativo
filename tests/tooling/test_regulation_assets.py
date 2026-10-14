import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch
import wave

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("regulation_assets", ROOT / "scripts/audio/regulation_assets.py")
assets = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(assets)


class RegulationAssetsTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.destination = Path(self.temporary.name) / "sounds"

    def copied_assets(self):
        shutil.copytree(assets.DESTINATION, self.destination)
        return self.destination

    def test_four_distinct_local_signals_with_recorded_levels_and_provenance(self):
        manifest = assets.verify()
        self.assertEqual(set(manifest["assets"]), {"white", "brown", "rain", "ocean"})
        self.assertEqual(len({record["sha256"] for record in manifest["assets"].values()}), 4)
        self.assertEqual(manifest["license"], "Apache-2.0")

    def test_missing_file_is_not_silently_regenerated(self):
        destination = self.copied_assets()
        (destination / "rain.wav").unlink()
        with self.assertRaises(FileNotFoundError):
            assets.verify(destination)
        self.assertFalse((destination / "rain.wav").exists())

    def test_duplicate_or_altered_asset_fails_integrity(self):
        destination = self.copied_assets()
        shutil.copyfile(destination / "white.wav", destination / "rain.wav")
        with self.assertRaises(ValueError):
            assets.verify(destination)

    def test_missing_catalog_entry_or_changed_recipe_is_rejected(self):
        destination = self.copied_assets()
        path = destination / "manifest.json"
        manifest = json.loads(path.read_text())
        del manifest["assets"]["brown"]
        path.write_text(json.dumps(manifest))
        with self.assertRaises(ValueError):
            assets.verify(destination)
        manifest["recipes"]["white"]["seed"] = 0
        path.write_text(json.dumps(manifest))
        with self.assertRaises(ValueError):
            assets.verify(destination)

    def test_silent_wrong_length_or_format_audio_is_rejected(self):
        path = Path(self.temporary.name) / "invalid.wav"
        with wave.open(str(path), "wb") as audio:
            audio.setnchannels(1)
            audio.setsampwidth(2)
            audio.setframerate(assets.RATE)
            audio.writeframes(bytes(assets.RATE * assets.DURATION * 2))
        with self.assertRaises(ValueError):
            assets.validate_metrics(assets.inspect_wav(path))
        with wave.open(str(path), "wb") as audio:
            audio.setnchannels(2)
            audio.setsampwidth(2)
            audio.setframerate(assets.RATE)
            audio.writeframes(bytes(400))
        with self.assertRaises(ValueError):
            assets.inspect_wav(path)

    def test_existing_user_directory_is_preserved_before_any_ffmpeg_execution(self):
        self.destination.mkdir()
        personal = self.destination / "personal.txt"
        personal.write_text("synthetic fixture")
        with patch.object(assets.subprocess, "check_output") as command:
            with self.assertRaises(FileExistsError):
                assets.generate(self.destination)
            command.assert_not_called()
        self.assertEqual(personal.read_text(), "synthetic fixture")

    def test_symlink_destination_is_not_followed_or_replaced(self):
        target = Path(self.temporary.name) / "absent-target"
        self.destination.symlink_to(target, target_is_directory=True)
        with self.assertRaises(FileExistsError):
            assets.generate(self.destination)
        self.assertTrue(self.destination.is_symlink())
        self.assertFalse(target.exists())


if __name__ == "__main__":
    unittest.main()
