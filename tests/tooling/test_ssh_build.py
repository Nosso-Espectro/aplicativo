import os
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]
WRAPPER = ROOT / "scripts/build/tear-android-ci"


class SSHBuildTests(unittest.TestCase):
    def test_rejects_arbitrary_commands_before_touching_build_storage(self):
        for request in ("", "bash", "build main", "build " + "a" * 39,
                        "build " + "a" * 40 + "; id", "artifact ../file",
                        "build " + "A" * 40, "build " + "a" * 40 + "\nid"):
            with self.subTest(request=request):
                result = subprocess.run(
                    ["bash", str(WRAPPER)],
                    env={**os.environ, "SSH_ORIGINAL_COMMAND": request},
                    capture_output=True, text=True, check=False,
                )
                self.assertEqual(result.returncode, 64)
                self.assertIn("Expected build or artifact", result.stderr)
                self.assertEqual(result.stdout, "")

    def test_shell_syntax(self):
        for script in (WRAPPER, ROOT / "scripts/build/provision-android-host.sh"):
            result = subprocess.run(["bash", "-n", str(script)], capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)


if __name__ == "__main__":
    unittest.main()
