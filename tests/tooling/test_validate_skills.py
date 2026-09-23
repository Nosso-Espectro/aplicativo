import contextlib
import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
loader = importlib.util.spec_from_file_location("validator", ROOT / "scripts/validate-workflow.py")
validator = importlib.util.module_from_spec(loader)
loader.loader.exec_module(validator)


class SkillValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.skills = self.root / ".codex/skills"
        self.skills.mkdir(parents=True)
        (self.root / ".agents").mkdir()
        (self.root / ".agents/skills").symlink_to("../.codex/skills")
        for name in validator.REQUIRED_SKILLS:
            self.write_skill(name, f"name: {name}\ndescription: Use ao realizar esta tarefa.")
        self.root_patch = patch.object(validator, "ROOT", self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def write_skill(self, name, fields):
        folder = self.skills / name
        folder.mkdir(exist_ok=True)
        path = folder / "SKILL.md"
        path.write_text(f"---\n{fields}\n---\n\n# Instruções\n")
        return path

    def validate(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return validator.validate_skills()

    def test_additional_skill_with_nested_metadata_is_accepted(self):
        self.write_skill("speckit-plan", 'name: "speckit-plan"\ndescription: "Plan implementation."\n'
                         'compatibility: "Spec Kit"\nmetadata:\n  author: "github-spec-kit"\n'
                         '  name: "not-the-skill-name"')
        self.assertEqual(len(self.validate()), len(validator.REQUIRED_SKILLS) + 1)

    def test_missing_required_skill_is_rejected(self):
        (self.skills / "code-review/SKILL.md").unlink()
        (self.skills / "code-review").rmdir()
        with self.assertRaisesRegex(validator.workflow.WorkflowError, "obrigatórias ausentes.*code-review"):
            self.validate()

    def test_additional_skill_cannot_hide_invalid_identity(self):
        self.write_skill("extra", "name: other\ndescription: Instructions.")
        with self.assertRaisesRegex(validator.workflow.WorkflowError, "Nome inconsistente"):
            self.validate()

    def test_additional_folder_requires_skill_file(self):
        (self.skills / "extra").mkdir()
        with self.assertRaisesRegex(validator.workflow.WorkflowError, "SKILL.md ausente"):
            self.validate()

    def test_missing_or_invalid_description_is_rejected(self):
        for fields in ("name: extra", 'name: extra\ndescription: ""',
                       "name: extra\ndescription: false", "name: extra\ndescription: []"):
            with self.subTest(fields=fields):
                self.write_skill("extra", fields)
                with self.assertRaises(validator.workflow.WorkflowError):
                    self.validate()

    def test_folded_and_single_quoted_description(self):
        for raw, expected in ((">-\n  Plan the\n  implementation.", "Plan the implementation."),
                              ("'Use the project''s plan.'", "Use the project's plan.")):
            path = self.write_skill("extra", f"name: extra\ndescription: {raw}\nmetadata:\n  author: someone")
            self.assertEqual(validator.skill_identity(path)["description"], expected)
            self.validate()

    def test_duplicate_top_level_field_is_rejected(self):
        self.write_skill("extra", "name: extra\ndescription: First.\ndescription: Second.")
        with self.assertRaisesRegex(validator.workflow.WorkflowError, "duplicado"):
            self.validate()

    def test_discovery_link_cannot_point_elsewhere(self):
        (self.root / ".agents/skills").unlink()
        (self.root / ".agents/skills").mkdir()
        with self.assertRaisesRegex(validator.workflow.WorkflowError, "Link de descoberta"):
            self.validate()


if __name__ == "__main__":
    unittest.main()
