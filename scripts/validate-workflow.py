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
SKILLS = {
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


def validate_local():
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
    skill_paths = list((ROOT / ".codex/skills").glob("*/SKILL.md"))
    ensure({p.parent.name for p in skill_paths} == SKILLS, "Conjunto de Skills incompleto/inesperado.")
    for path in skill_paths:
        data = workflow.metadata(path)
        ensure(data.get("name") == path.parent.name, f"Nome inconsistente em {path}.")
        ensure(isinstance(data.get("description"), str) and data["description"].strip(),
               f"Descrição ausente em {path}.")
    ensure((ROOT / ".agents/skills").resolve() == (ROOT / ".codex/skills").resolve(),
           "Link de descoberta das Skills inválido.")
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
    parser.add_argument("--github", action="store_true", help="Comparar com GitHub (somente leitura).")
    args = parser.parse_args()
    try:
        mapping, numbers = validate_local()
        if args.github:
            validate_github(mapping, numbers)
    except (workflow.WorkflowError, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        sys.exit(1)
