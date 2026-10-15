import os
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]
WRAPPER = ROOT / "scripts/build/tear-android-ci"


class SSHBuildTests(unittest.TestCase):
    def test_android_backends_are_explicit_and_builds_still_manual_on_main(self):
        workflow = (ROOT / ".github/workflows/mobile-quality.yml").read_text()
        android = workflow.split("  android-build:\n", 1)[1].split("  ios-build:\n", 1)[0]
        self.assertIn("github.event_name == 'workflow_dispatch'", android)
        self.assertIn("github.ref == 'refs/heads/main'", android)
        self.assertIn("runs-on: ubuntu-24.04", android)
        quality = workflow.split("  quality:\n", 1)[1].split("  android-build:\n", 1)[0]
        self.assertNotIn("if: inputs.android_backend", quality)
        github_steps, ssh_steps = android.split("      - name: Build Android over SSH and retrieve APK\n", 1)
        self.assertNotIn("TEAR_BUILD_", github_steps)
        self.assertIn("if: inputs.android_backend == 'github'", github_steps)
        self.assertIn("if: inputs.android_backend == 'ssh'", ssh_steps)
        self.assertIn("StrictHostKeyChecking=yes", ssh_steps)
        self.assertIn('"build $GITHUB_SHA"', ssh_steps)
        self.assertIn('"artifact $GITHUB_SHA"', ssh_steps)
        self.assertIn("node-version-file: .nvmrc", android)
        self.assertIn("distribution: temurin", android)
        self.assertIn("java-version: '17'", android)
        self.assertIn("packages: platform-tools", android)
        self.assertIn('"platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"', android)
        self.assertIn("./gradlew --no-daemon --max-workers=2 -Pkotlin.compiler.execution.strategy=in-process assembleRelease", android)
        self.assertRegex(android, r"path:\s*\|\s+build/android/\*\.apk\s+build/android/THIRD_PARTY_NOTICES\.txt")
        self.assertIn("name: tear-android-${{ github.sha }}", android)

    def test_manual_builds_have_sha_scoped_non_cancelling_concurrency(self):
        workflow = (ROOT / ".github/workflows/mobile-quality.yml").read_text()
        self.assertIn(
            "group: mobile-quality-${{ github.workflow }}-${{ github.ref }}-"
            "${{ github.event_name == 'workflow_dispatch' && github.sha || 'checks' }}",
            workflow,
        )
        self.assertIn(
            "cancel-in-progress: ${{ github.event_name != 'workflow_dispatch' }}",
            workflow,
        )

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
        for script in (WRAPPER, ROOT / "scripts/build/provision-android-host.sh", ROOT / "scripts/build/install-build-jdk.sh"):
            result = subprocess.run(["bash", "-n", str(script)], capture_output=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_dedicated_host_uses_verified_jdk_and_retains_crash_reports(self):
        wrapper = WRAPPER.read_text()
        installer = (ROOT / "scripts/build/install-build-jdk.sh").read_text()
        self.assertIn("JAVA_HOME=/opt/tear-build/jdk-21.0.12.1+1", wrapper)
        self.assertIn('chmod 700 "$base/diagnostics"', wrapper)
        self.assertIn("-XX:ErrorFile=$base/diagnostics/$sha-hs_err_pid%p.log", wrapper)
        self.assertIn("--no-daemon --max-workers=2 -Pkotlin.compiler.execution.strategy=in-process", wrapper)
        self.assertIn("-Xmx4g -XX:MaxMetaspaceSize=1g", wrapper)
        self.assertIn("version=21.0.12.1+1", installer)
        self.assertIn("ce79869e1307ed8ee1e2baa86a412b1eb5b75d10a01006d788a6f968bcfaee94", installer)
        self.assertIn("temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/", installer)
        self.assertIn("OpenJDK21U-jdk_x64_linux_hotspot_21.0.12.1_1.tar.gz", installer)
        self.assertIn("sha256sum -c -", installer)
        self.assertIn("refusing to overwrite", installer)
        self.assertNotIn("update-alternatives", installer)
        self.assertNotIn("systemctl", installer)
        self.assertNotIn("rm -rf /opt/tear-build", installer)


if __name__ == "__main__":
    unittest.main()
