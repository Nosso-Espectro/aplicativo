import importlib.util
from pathlib import Path
import sys
import unittest

SCRIPTS = Path(__file__).resolve().parents[2] / "scripts" / "github"
sys.path.insert(0, str(SCRIPTS))
SPEC = importlib.util.spec_from_file_location("native_build", SCRIPTS / "check-native-build.py")
native_build = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(native_build)


class RemoteBuildTests(unittest.TestCase):
    def setUp(self):
        self.sha = "a" * 40
        self.run = {
            "head_sha": self.sha, "head_branch": "main", "event": "workflow_dispatch",
            "status": "completed", "conclusion": "success",
        }
        self.jobs = [
            {"name": name, "status": "completed", "conclusion": "success"}
            for name in native_build.NATIVE_JOBS
        ]
        self.artifacts = [
            {"name": f"{prefix}-{self.sha}", "expired": False, "size_in_bytes": 123}
            for prefix in ("tear-android", "tear-ios-simulator")
        ]

    def test_accepts_both_native_jobs_and_artifacts_at_current_main_sha(self):
        self.assertTrue(native_build.completed_build(self.run, self.jobs, self.artifacts, self.sha))

    def test_rejects_old_sha_branch_or_non_manual_run(self):
        for key, value in {
            "head_sha": "b" * 40, "head_branch": "feature", "event": "push",
            "status": "in_progress", "conclusion": "failure",
        }.items():
            with self.subTest(key=key):
                self.assertFalse(native_build.completed_build(
                    {**self.run, key: value}, self.jobs, self.artifacts, self.sha,
                ))

    def test_rejects_skipped_or_failed_platform(self):
        for conclusion in ("skipped", "failure"):
            with self.subTest(conclusion=conclusion):
                jobs = [self.jobs[0], {**self.jobs[1], "conclusion": conclusion}]
                self.assertFalse(native_build.completed_build(self.run, jobs, self.artifacts, self.sha))

    def test_rejects_missing_expired_empty_or_wrong_sha_artifacts(self):
        for artifacts in (
            self.artifacts[:1],
            [{**item, "expired": True} for item in self.artifacts],
            [{**item, "size_in_bytes": 0} for item in self.artifacts],
            [{**item, "name": "other"} for item in self.artifacts],
        ):
            with self.subTest(artifacts=artifacts):
                self.assertFalse(native_build.completed_build(self.run, self.jobs, artifacts, self.sha))


if __name__ == "__main__":
    unittest.main()
