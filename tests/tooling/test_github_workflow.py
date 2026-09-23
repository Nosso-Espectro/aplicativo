"""Exercise workflow safety boundaries without creating Git refs or remote writes."""

from contextlib import ExitStack, redirect_stdout
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch

SOURCE_ROOT = Path(__file__).resolve().parents[2]
loader = importlib.util.spec_from_file_location("workflow", SOURCE_ROOT / "scripts/github/_workflow.py")
workflow = importlib.util.module_from_spec(loader)
loader.loader.exec_module(workflow)


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.root_patch = patch.object(workflow, "ROOT", self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        self.output = io.StringIO()
        self.output_patch = redirect_stdout(self.output)
        self.output_patch.__enter__()
        self.addCleanup(self.output_patch.__exit__, None, None, None)
        self.ms = {"number": 9, "title": "P0 — Comunicação", "state": "open"}
        self.item = {
            # Deliberately different issue and story numbers.
            "number": 12, "title": "[US-001] Exibir comunicação básica", "state": "OPEN",
            "url": "https://github.com/Nosso-Espectro/aplicativo/issues/12",
            "milestone": self.ms, "labels": [{"name": "user-story"}, {"name": "P0"}],
            "body": "## História de usuário\n\nComo usuário, quero comunicar, para pedir ajuda.\n\n"
                    "## Critérios de aceite\n\n- [ ] Funcionar offline.\n\n## Definition of Done\n\n- [ ] Testar.\n",
        }
        self.path = self.root / "specs/001-comunicacao/spec.md"
        self.path.parent.mkdir(parents=True)
        self.path.write_text(
            "---\nmilestone: 9\npriority: P0\ntag: m001-comunicacao\nstatus: implemented\n"
            'ready_stories: ["US-001"]\n---\n\n# Comunicação\n\nP0 — Comunicação\n\n'
            "### US-001 — Exibir comunicação básica\n\nGitHub Issue: [#12](https://example.org/12)\n\n"
            "Como usuário, quero comunicar, para pedir ajuda.\n\n"
            "#### Critérios de aceite\n\n- [ ] Funcionar offline.\n"
        )
        self.path.with_name("tasks.md").write_text("- [x] T001 [US-001] Atender RF-001.\n")
        (self.root / "scripts").mkdir()

    def test_paginated_json_handles_empty_and_multiple_pages(self):
        self.assertEqual(workflow.decode_pages('[{"number":1}]\n[]\n[{"number":2}]'),
                         [[{"number": 1}], [], [{"number": 2}]])

    def test_rest_prs_not_counted_as_issues(self):
        with patch.object(workflow, "api", return_value=[self.item, {"number": 13, "pull_request": {}}]):
            self.assertEqual(workflow.milestone_issues(self.ms), [self.item])

    def test_empty_milestone_is_not_release_ready(self):
        self.path.write_text(self.path.read_text().replace("GitHub Issue: [#12]", "Sem Issue:"))
        with patch.object(workflow, "milestone", return_value=self.ms), \
             patch.object(workflow, "milestone_issues", return_value=[]):
            workflow.check_milestone(self.ms["title"])
        self.assertIn("milestone vazia", self.output.getvalue())
        self.assertIn("0.0%", self.output.getvalue())

    def test_milestone_scope_removed_from_github_is_rejected(self):
        with patch.object(workflow, "milestone", return_value=self.ms), \
             patch.object(workflow, "milestone_issues", return_value=[]):
            with self.assertRaisesRegex(workflow.WorkflowError, "diferem da spec"):
                workflow.check_milestone(self.ms["title"])

    def test_branch_uses_story_number_and_ascii_slug(self):
        self.assertEqual(workflow.branch_name(self.item), "feat/us-001-exibir-comunicacao-basica")

    def test_correction_and_technical_labels(self):
        for label, prefix in (("bug", "fix"), ("technical-task", "chore")):
            self.item["labels"] = [{"name": label}]
            self.assertTrue(workflow.branch_name(self.item).startswith(prefix + "/us-001-"))
        self.item["labels"] = [{"name": "bug"}, {"name": "chore"}]
        with self.assertRaises(workflow.WorkflowError):
            workflow.branch_name(self.item)

    def test_missing_story_or_milestone_blocks_mapping(self):
        self.item["title"] = "Sem história"
        with self.assertRaises(workflow.WorkflowError):
            workflow.branch_name(self.item)
        self.item["milestone"] = None
        with self.assertRaises(workflow.WorkflowError):
            workflow.mapped_spec(self.item)

    def test_changed_acceptance_blocks_start_before_any_git_operation(self):
        self.item["body"] = self.item["body"].replace("Funcionar offline.", "Exigir login.")
        with patch.object(workflow, "issue", return_value=self.item), patch.object(workflow, "git") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "Critérios"):
                workflow.start_issue("12")
            git.assert_not_called()

    def test_changed_story_blocks_start_before_any_git_operation(self):
        self.item["body"] = self.item["body"].replace("para pedir ajuda", "para outra finalidade")
        with patch.object(workflow, "issue", return_value=self.item), patch.object(workflow, "git") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "História no GitHub"):
                workflow.start_issue("12")
            git.assert_not_called()

    def test_missing_ready_blocks_start_before_any_git_operation(self):
        self.path.write_text(self.path.read_text().replace('["US-001"]', '[]'))
        with patch.object(workflow, "issue", return_value=self.item), patch.object(workflow, "git") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "Ready"):
                workflow.start_issue("12")
            git.assert_not_called()

    def test_closed_issue_cannot_start(self):
        self.item["state"] = "CLOSED"
        with patch.object(workflow, "issue", return_value=self.item), patch.object(workflow, "git") as git:
            with self.assertRaises(workflow.WorkflowError):
                workflow.start_issue("12")
            git.assert_not_called()

    def test_dirty_worktree_stops_before_switch(self):
        with patch.object(workflow, "issue", return_value=self.item), \
             patch.object(workflow, "git", return_value="?? user-file.txt") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "suja"):
                workflow.start_issue("12")
            self.assertEqual([c.args[0] for c in git.call_args_list], ["status"])

    def test_existing_story_branch_with_different_slug_is_rejected(self):
        for local, remote in (("feat/us-001-old", ""), ("", "abc\trefs/heads/fix/us-001-other")):
            with patch.object(workflow, "git", side_effect=[local, remote]):
                with self.assertRaisesRegex(workflow.WorkflowError, "Já existe"):
                    workflow.unique_branch(self.item, workflow.branch_name(self.item))

    def test_diverged_main_never_creates_branch(self):
        def git(*args):
            if args[0] == "merge-base":
                raise workflow.WorkflowError("main divergiu")
            return ""
        with patch.object(workflow, "issue", return_value=self.item), \
             patch.object(workflow, "git", side_effect=git) as mock:
            with self.assertRaises(workflow.WorkflowError):
                workflow.start_issue("12")
            self.assertFalse(any(c.args[0] == "switch" for c in mock.call_args_list))

    def test_start_updates_main_and_only_then_creates_issue_branch(self):
        def git(*args):
            if args == ("branch", "--show-current"):
                return "main"
            if args == ("rev-parse", "HEAD"):
                return "a" * 40
            if args[:2] == ("ls-remote", "--exit-code"):
                return "a" * 40 + "\trefs/heads/main"
            return ""
        with patch.object(workflow, "issue", return_value=self.item), \
             patch.object(workflow, "git", side_effect=git) as mock:
            workflow.start_issue("12")
            calls = [c.args for c in mock.call_args_list]
            self.assertLess(calls.index(("pull", "--ff-only", "origin", "main")),
                            calls.index(("switch", "-c", "feat/us-001-exibir-comunicacao-basica")))
            self.assertFalse(any(c[0] in {"push", "tag", "commit"} for c in calls))

    def test_readiness_is_rechecked_after_updating_main(self):
        def update(*args):
            if args[:1] == ("pull",):
                self.path.write_text(self.path.read_text().replace('["US-001"]', '[]'))
            return ""
        with patch.object(workflow, "issue", return_value=self.item), \
             patch.object(workflow, "synchronized_main", return_value="a" * 40), \
             patch.object(workflow, "git", side_effect=update) as mock:
            with self.assertRaisesRegex(workflow.WorkflowError, "prontidão"):
                workflow.start_issue("12")
            self.assertFalse(any(c.args[:2] == ("switch", "-c") for c in mock.call_args_list))

    def test_main_must_match_remote_exactly(self):
        with patch.object(workflow, "git", side_effect=["main", "", "a" * 40]), \
             patch.object(workflow, "remote_main", return_value="b" * 40):
            with self.assertRaisesRegex(workflow.WorkflowError, "sincronizada"):
                workflow.synchronized_main()

    def test_tag_existing_locally_or_remotely_is_never_overwritten(self):
        for responses in (["m001-comunicacao"], ["", "abc\trefs/tags/m001-comunicacao"]):
            with patch.object(workflow, "git", side_effect=responses) as git:
                with self.assertRaisesRegex(workflow.WorkflowError, "já existe"):
                    workflow.tag_absent("m001-comunicacao")
                self.assertFalse(any(c.args[:2] == ("tag", "-a") for c in git.call_args_list))

    def write_quality(self, value):
        (self.root / "scripts/quality-gate.json").write_text(json.dumps(value))

    def test_missing_quality_setup_blocks_before_running_any_command(self):
        self.write_quality(dict.fromkeys(("tests", "lint", "typecheck", "build", "e2e")))
        with patch.object(workflow.subprocess, "run") as run:
            with self.assertRaisesRegex(workflow.WorkflowError, "não configurado"):
                workflow.quality_gate()
            run.assert_not_called()

    def test_build_cannot_be_marked_not_applicable(self):
        config = {k: ["tool", k] for k in ("tests", "lint", "typecheck", "build", "e2e")}
        config["build"] = {"not_applicable": "Não há aplicação inicializada neste repositório."}
        self.write_quality(config)
        with patch.object(workflow.subprocess, "run") as run:
            with self.assertRaises(workflow.WorkflowError):
                workflow.quality_gate()
            run.assert_not_called()

    def test_failed_quality_command_stops_following_commands(self):
        self.write_quality({k: ["tool", k] for k in ("tests", "lint", "typecheck", "build", "e2e")})
        with patch.object(workflow.subprocess, "run", return_value=Mock(returncode=1)) as run:
            with self.assertRaisesRegex(workflow.WorkflowError, "tests falhou"):
                workflow.quality_gate()
            self.assertEqual(run.call_count, 1)

    def test_review_must_match_commit(self):
        evidence = self.root / "review.md"
        fields = {"milestone": 9, "commit": "b" * 40, "reviewer": "Test reviewer",
                  **dict.fromkeys(workflow.REVIEW_FIELDS, True)}
        evidence.write_text("---\n" + "\n".join(f"{k}: {json.dumps(v)}" for k, v in fields.items())
                            + "\n---\n" + "Evidências de revisão. " * 10)
        with patch.dict(os.environ, {"TEAR_RELEASE_EVIDENCE": str(evidence)}):
            with self.assertRaisesRegex(workflow.WorkflowError, "não corresponde"):
                workflow.review_evidence(self.ms, "a" * 40)

    def test_issue_closed_without_merged_pr_is_blocked(self):
        response = {"data": {"repository": {"issue": {"closedByPullRequestsReferences": {
            "pageInfo": {"hasNextPage": False}, "nodes": [],
        }}}}}
        with patch.object(workflow, "run", return_value=json.dumps(response)), patch.object(workflow, "git") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "sem PR"):
                workflow.merged_prs([self.item])
            git.assert_not_called()

    def test_pr_merged_outside_main_is_blocked(self):
        response = {"data": {"repository": {"issue": {"closedByPullRequestsReferences": {
            "pageInfo": {"hasNextPage": False}, "nodes": [{"merged": True, "baseRefName": "develop",
                "url": "https://example.org/pr", "mergeCommit": {"oid": "a" * 40},
                "repository": {"nameWithOwner": workflow.REPO}}],
        }}}}}
        with patch.object(workflow, "run", return_value=json.dumps(response)):
            with self.assertRaisesRegex(workflow.WorkflowError, "não integrado"):
                workflow.merged_prs([self.item])

    def test_remote_failed_check_blocks_release(self):
        with patch.object(workflow, "api", side_effect=[[], {"check_runs": [
            {"name": "build", "status": "completed", "conclusion": "failure"},
        ]}]):
            with self.assertRaisesRegex(workflow.WorkflowError, "build"):
                workflow.remote_checks("a" * 40)

    def release_context(self):
        stack = ExitStack()
        self.addCleanup(stack.close)
        self.item["state"] = "CLOSED"
        defaults = {
            "check_milestone": (self.ms, [self.item]), "synchronized_main": "a" * 40,
            "tag_absent": None, "merged_prs": None, "review_evidence": None,
            "remote_checks": None, "quality_gate": None, "milestone": self.ms,
            "milestone_issues": [self.item], "git": "",
        }
        return {name: stack.enter_context(patch.object(workflow, name, return_value=value))
                for name, value in defaults.items()}

    def test_open_issue_blocks_tag_before_git_operations(self):
        with patch.object(workflow, "check_milestone", return_value=(self.ms, [self.item])), \
             patch.object(workflow, "git") as git:
            with self.assertRaisesRegex(workflow.WorkflowError, "Todas as Issues"):
                workflow.tag_milestone(self.ms["title"])
            git.assert_not_called()

    def test_pending_tasks_block_tag(self):
        mocks = self.release_context()
        self.path.with_name("tasks.md").write_text("- [ ] T001 [US-001] Trabalho pendente.\n")
        with self.assertRaisesRegex(workflow.WorkflowError, "Tasks"):
            workflow.tag_milestone(self.ms["title"])
        mocks["git"].assert_not_called()

    def test_each_release_gate_failure_prevents_tag(self):
        mocks = self.release_context()
        for name in ("synchronized_main", "tag_absent", "merged_prs", "review_evidence",
                     "remote_checks", "quality_gate"):
            with self.subTest(gate=name):
                mocks[name].side_effect = workflow.WorkflowError(name)
                with self.assertRaises(workflow.WorkflowError):
                    workflow.tag_milestone(self.ms["title"])
                mocks["git"].assert_not_called()
                mocks[name].side_effect = None

    def test_backlog_changed_during_gates_prevents_tag(self):
        mocks = self.release_context()
        mocks["milestone_issues"].return_value = [dict(self.item, state="open")]
        with self.assertRaisesRegex(workflow.WorkflowError, "Backlog mudou"):
            workflow.tag_milestone(self.ms["title"])
        mocks["git"].assert_not_called()

    def test_head_changed_during_gates_prevents_tag(self):
        mocks = self.release_context()
        mocks["synchronized_main"].side_effect = ["a" * 40, "b" * 40]
        with self.assertRaisesRegex(workflow.WorkflowError, "HEAD mudou"):
            workflow.tag_milestone(self.ms["title"])
        mocks["git"].assert_not_called()

    def test_success_requests_only_annotated_tag_on_verified_head_no_push(self):
        mocks = self.release_context()
        workflow.tag_milestone(self.ms["title"])
        mocks["git"].assert_called_once_with(
            "tag", "-a", "m001-comunicacao", "a" * 40,
            "-m", "Milestone concluída: P0 — Comunicação",
        )
        self.assertIn("git push origin m001-comunicacao", self.output.getvalue())
        # git is mocked: this verifies the command contract without creating a tag.


class ShellEntrypointTests(unittest.TestCase):
    def test_all_wrappers_validate_arguments_without_git_mutation(self):
        for path in sorted((SOURCE_ROOT / "scripts/github").glob("*.sh")):
            with self.subTest(script=path.name):
                result = subprocess.run([str(path)], text=True, capture_output=True, check=False)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Uso:", result.stderr)


if __name__ == "__main__":
    unittest.main()
