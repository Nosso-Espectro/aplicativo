#!/usr/bin/env python3
"""Validate documentation and optional live GitHub traceability (read only)."""

import argparse
from collections import Counter
import importlib.util
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
loader = importlib.util.spec_from_file_location("workflow", ROOT / "scripts/github/_workflow.py")
workflow = importlib.util.module_from_spec(loader)
loader.loader.exec_module(workflow)

SPEC_SECTIONS = (
    "Contexto", "Objetivo", "Público e necessidades", "Histórias de usuário",
    "Requisitos funcionais", "Requisitos não funcionais", "Fora de escopo",
    "Dependências funcionais", "Casos de erro", "Questões em aberto", "Rastreabilidade",
)
PLAN_SECTIONS = (
    "Stack", "Arquitetura atual", "Estratégia", "Componentes envolvidos", "Modelo de dados",
    "Persistência", "Fluxos principais", "Offline", "Acessibilidade", "Privacidade e segurança",
    "Estratégia de testes", "Dependências técnicas", "Riscos", "Decisões arquiteturais",
)
REQUIRED_SKILLS = {
    "spec-driven-development", "github-trunk-workflow", "clean-code",
    "accessibility-neuroinclusive", "ui-ux-design", "testing-quality",
    "privacy-security", "offline-first", "code-review", "milestone-release",
}


def ensure(value, message):
    if not value:
        raise workflow.WorkflowError(message)


def duplicates(values):
    return sorted(key for key, count in Counter(values).items() if count > 1)


def original_section(body, title):
    match = re.search(rf"^## {re.escape(title)}\s*\n(.*?)(?=^## |\Z)", body, re.M | re.S)
    ensure(match, f"Seção {title} ausente no GitHub.")
    return match[1].strip()


def skill_identity(path):
    """Read required top-level scalar fields without treating nested metadata as fields."""
    match = re.match(r"\A---\n(.*?)\n---(?:\n|\Z)", path.read_text(), re.S)
    ensure(match, f"Frontmatter ausente em {path}.")
    fields = {}
    lines = match[1].splitlines()
    for index, line in enumerate(lines):
        field = re.match(r"^(name|description):\s*(.*)$", line)
        if not field:
            continue
        key, value = field.groups()
        ensure(key not in fields, f"Campo {key} duplicado em {path}.")
        if value in ("|", "|-", "|+", ">", ">-", ">+"):
            block = []
            for continuation in lines[index + 1:]:
                if continuation and not continuation.startswith((" ", "\t")):
                    break
                block.append(continuation.strip())
            value = (" " if value.startswith(">") else "\n").join(block).strip()
        elif value.startswith('"'):
            try:
                value = json.loads(value)
            except ValueError:
                raise workflow.WorkflowError(f"Campo {key} com aspas inválidas em {path}.")
        elif value.startswith("'"):
            ensure(value.endswith("'") and len(value) >= 2, f"Aspas inválidas em {path}.")
            value = value[1:-1].replace("''", "'")
        else:
            value = value.split(" #", 1)[0].strip()
            ensure(value.lower() not in {"null", "true", "false", "~"}
                   and not value.startswith(("[", "{", "&", "*", "!"))
                   and not re.fullmatch(r"[-+]?\d+(?:\.\d+)?", value),
                   f"Campo {key} deve ser texto em {path}.")
        ensure(isinstance(value, str) and value.strip(), f"Campo {key} vazio em {path}.")
        fields[key] = value
    ensure(set(fields) == {"name", "description"}, f"name/description ausente em {path}.")
    return fields


def validate_skills():
    directory = ROOT / ".codex/skills"
    folders = sorted(p for p in directory.iterdir() if p.is_dir())
    missing = REQUIRED_SKILLS - {p.name for p in folders}
    ensure(not missing, f"Skills obrigatórias ausentes: {', '.join(sorted(missing))}.")
    paths = []
    for folder in folders:
        path = folder / "SKILL.md"
        ensure(path.is_file(), f"SKILL.md ausente em {folder}.")
        fields = skill_identity(path)
        ensure(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", fields["name"])
               and len(fields["name"]) <= 64, f"Nome de Skill inválido em {path}.")
        ensure(fields["name"] == folder.name, f"Nome inconsistente em {path}.")
        paths.append(path)
    ensure((ROOT / ".agents/skills").resolve() == directory.resolve(),
           "Link de descoberta das Skills inválido.")
    print(f"SKILLS OK: {len(paths)} Skills; {len(REQUIRED_SKILLS)} obrigatórias presentes; "
          "identificação das Skills adicionais validada.")
    return paths


def validate_local():
    skill_paths = validate_skills()
    mapping = workflow.specs()
    ensure(mapping, "Nenhuma spec encontrada.")
    all_issues, all_stories = [], []
    index = (ROOT / "specs/README.md").read_text()
    total_tasks = 0
    for number, (path, data) in mapping.items():
        text = path.read_text()
        ensure(data.get("priority") in {"P0", "P1", "P2", "P3"}, f"Prioridade inválida em {path}.")
        ensure(data.get("status") in {"draft", "ready", "implemented"}, f"Status inválido em {path}.")
        ensure(isinstance(data.get("ready_stories"), list), f"ready_stories inválido em {path}.")
        for heading in SPEC_SECTIONS:
            ensure(f"\n## {heading}\n" in text, f"Seção {heading} ausente em {path}.")
        plan = path.with_name("plan.md").read_text()
        for heading in PLAN_SECTIONS:
            ensure(f"\n## {heading}\n" in plan, f"Seção {heading} ausente no plano {number}.")
        stories = re.findall(r"^### (US-\d+) — ", text, re.M)
        nums = [int(n) for n in re.findall(r"^GitHub Issue: \[#(\d+)\]", text, re.M)]
        ensure(stories and len(stories) == len(nums), f"Histórias/Issues inconsistentes em {path}.")
        ensure(set(data["ready_stories"]) <= set(stories), f"Ready contém US de outra spec: {path}.")
        ensure(not duplicates(data["ready_stories"]), f"Ready duplicado em {path}.")
        all_issues.extend(nums)
        all_stories.extend(stories)
        reqs = re.findall(r"^- \*\*((?:RF|RNF)-\d+)\*\*", text, re.M)
        ensure(reqs and not duplicates(reqs), f"Requisitos ausentes/duplicados em {path}.")
        for req in reqs:
            ensure(re.search(rf"^\| {req} \| .*#\d+", text, re.M), f"{path}: {req} sem Issue na tabela.")
        tasks_text = path.with_name("tasks.md").read_text()
        tasks = re.findall(r"^- \[[ xX]\] (T\d+) (?:\[P\] )?\[(US-\d+)\] (.+)$", tasks_text, re.M)
        ensure(tasks and not duplicates(t[0] for t in tasks), f"Tasks ausentes/duplicadas em {path}.")
        ensure({t[1] for t in tasks} == set(stories), f"US não rastreada nas tasks de {path}.")
        for req in (r for r in reqs if r.startswith("RF-")):
            ensure(req in tasks_text, f"{path}: {req} sem task.")
        total_tasks += len(tasks)
        ensure(f"({path.parent.name}/spec.md)" in index and f"`{data['tag']}`" in index,
               f"Spec/tag ausente no índice: {path}.")
    ensure(not duplicates(all_issues), f"Issues duplicadas: {duplicates(all_issues)}")
    ensure(not duplicates(all_stories), f"US duplicadas: {duplicates(all_stories)}")
    documents = [ROOT / "README.md", ROOT / "AGENTS.md"]
    for directory in ("specs", "docs", ".specify", ".codex", ".github"):
        documents.extend((ROOT / directory).rglob("*.md"))
    for path in documents:
        text = path.read_text()
        ensure(text.endswith("\n"), f"Sem newline final: {path}.")
        ensure(not any(line.rstrip() != line for line in text.splitlines()), f"Whitespace final em {path}.")
        ensure(text.count("```") % 2 == 0, f"Bloco de código não fechado em {path}.")
        for target in re.findall(r"\[[^\]\n]+\]\(([^)\n]+)\)", text):
            if re.match(r"[a-z]+://", target) or target.startswith("#"):
                continue
            target = target.split("#")[0]
            ensure((path.parent / target).exists(), f"Link quebrado em {path}: {target}")
    config = json.loads((ROOT / "scripts/quality-gate.json").read_text())
    ensure(set(config) == {"tests", "lint", "typecheck", "build", "e2e"}, "Campos de qualidade incorretos.")
    print(f"LOCAL OK: {len(mapping)} specs, {len(all_issues)} Issues, {len(all_stories)} histórias, "
          f"{total_tasks} tasks, {len(skill_paths)} Skills; links e Markdown estrutural válidos.")
    return mapping, set(all_issues)


def validate_github(mapping, local_numbers):
    workflow.prerequisites()
    milestones = workflow.api(f"repos/{workflow.REPO}/milestones?state=all&per_page=100", True)
    issues = workflow.api(f"repos/{workflow.REPO}/issues?state=all&per_page=100", True)
    issues = [item for item in issues if "pull_request" not in item]
    ms_numbers = {m["number"] for m in milestones}
    ensure(set(mapping) == ms_numbers,
           f"Milestones sem spec: {ms_numbers - set(mapping)}; specs sem milestone: {set(mapping) - ms_numbers}.")
    orphan = [i["number"] for i in issues if not i.get("milestone")]
    ensure(not orphan, f"Issues sem milestone: {orphan}.")
    numbers = [i["number"] for i in issues]
    stories = [workflow.story_id(i) for i in issues]
    ensure(not duplicates(numbers) and not duplicates(stories), "Issues ou histórias duplicadas no GitHub.")
    ensure(set(numbers) == local_numbers,
           f"Issues sem spec: {set(numbers) - local_numbers}; referências sem Issue: {local_numbers - set(numbers)}.")
    for item in issues:
        path, data = workflow.mapped_spec(item)
        text = path.read_text()
        for section in ("História de usuário", "Definition of Done", "Observações de produto"):
            ensure(original_section(item["body"], section) in text,
                   f"#{item['number']}: {section} não preservada na spec.")
        priority_labels = {x["name"] for x in item["labels"] if re.fullmatch(r"P[0-3]", x["name"])}
        ensure(priority_labels == {data["priority"]}, f"Prioridade divergente na Issue #{item['number']}.")
        ensure(f"`{workflow.branch_name(item)}`" in (ROOT / "specs/README.md").read_text(),
               f"Branch prevista desatualizada para #{item['number']}.")
    for m in milestones:
        path, data = mapping[m["number"]]
        ensure(m["title"].startswith(data["priority"]), f"Prioridade divergente em {m['title']}.")
        ensure((m["description"] or "") in path.read_text(), f"Descrição da milestone divergente: {m['title']}.")
    print(f"GITHUB OK: {len(milestones)} milestones, {len(issues)} Issues; nenhuma órfã, duplicada "
          "ou sem spec; histórias, critérios, DoD, prioridades e descrições preservados.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--github", action="store_true", help="Comparar com GitHub (somente leitura).")
    mode.add_argument("--skills-only", action="store_true", help="Validar somente as Skills locais.")
    args = parser.parse_args()
    try:
        if args.skills_only:
            validate_skills()
        else:
            mapping, numbers = validate_local()
            if args.github:
                validate_github(mapping, numbers)
    except (workflow.WorkflowError, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        sys.exit(1)
