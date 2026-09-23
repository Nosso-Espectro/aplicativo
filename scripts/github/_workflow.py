#!/usr/bin/env python3
"""GitHub helpers. Product metadata comes from GitHub; mapping lives in specs."""

import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import unicodedata

REPO = "Nosso-Espectro/aplicativo"
ROOT = Path(__file__).resolve().parents[2]
REVIEW_FIELDS = (
    "acceptance", "accessibility", "privacy", "documentation",
    "spec_consistency", "required_checks", "no_blocking_regressions", "no_critical_todos",
    "no_blocking_vulnerabilities",
)


class WorkflowError(Exception):
    """A precondition failed; do not continue with mutations."""


def require(condition, message):
    if not condition:
        raise WorkflowError(message)


def run(*args, cwd=None):
    result = subprocess.run(
        args, cwd=cwd or ROOT, text=True, capture_output=True, check=False,
    )
    if result.returncode:
        # Avoid dumping potentially personal JSON returned by the API.
        raise WorkflowError(f"Falha em {args[0]} {args[1] if len(args) > 1 else ''}: "
                            f"{result.stderr.strip() or 'verifique a saída da ferramenta'}")
    return result.stdout.strip()


def git(*args):
    return run("git", *args)


def prerequisites():
    for tool in ("git", "gh"):
        require(shutil.which(tool), f"Instale {tool} antes de continuar.")
    require(Path(git("rev-parse", "--show-toplevel")).resolve() == ROOT,
            "Execute os scripts dentro do checkout do projeto.")
    remote = git("remote", "get-url", "origin")
    require(remote in (
        f"https://github.com/{REPO}", f"https://github.com/{REPO}.git",
        f"git@github.com:{REPO}", f"git@github.com:{REPO}.git",
        f"ssh://git@github.com/{REPO}", f"ssh://git@github.com/{REPO}.git",
    ), "origin não aponta ao repositório esperado; confira antes de operar.")


def decode_pages(raw):
    decoder = json.JSONDecoder()
    pages = []
    remaining = raw.strip()
    while remaining:
        value, end = decoder.raw_decode(remaining)
        pages.append(value)
        remaining = remaining[end:].lstrip()
    return pages


def api(endpoint, paginate=False):
    args = ["gh", "api", "--hostname", "github.com", endpoint]
    if paginate:
        args.append("--paginate")
    pages = decode_pages(run(*args))
    require(bool(pages), "GitHub retornou resposta vazia.")
    if paginate:
        require(all(isinstance(page, list) for page in pages),
                "Esperadas páginas de listas do GitHub.")
        return [item for page in pages for item in page]
    require(len(pages) == 1, "Resposta inesperada do GitHub.")
    return pages[0]


def metadata(path):
    text = path.read_text(encoding="utf-8")
    match = re.match(r"\A---\n(.*?)\n---\n", text, re.S)
    require(match is not None, f"Metadados ausentes em {path}.")
    data = {}
    for line in match[1].splitlines():
        key, separator, raw = line.partition(":")
        require(separator and key not in data, f"Metadado inválido/duplicado: {path}.")
        raw = raw.strip()
        try:
            data[key] = json.loads(raw)
        except json.JSONDecodeError:
            data[key] = raw
    return data


def specs():
    result = {}
    for path in sorted((ROOT / "specs").glob("*/spec.md")):
        data = metadata(path)
        number = data.get("milestone")
        require(type(number) is int and number > 0, f"Milestone inválida em {path}.")
        require(number not in result, f"Milestone #{number} duplicada em specs.")
        require(re.fullmatch(r"\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*", path.parent.name),
                f"Nome de spec inválido: {path.parent.name}.")
        require(data.get("tag") == "m" + path.parent.name, f"Tag inconsistente em {path}.")
        result[number] = (path, data)
    return result


def issue(number):
    require(re.fullmatch(r"[1-9][0-9]*", str(number)), "Informe um número positivo de Issue.")
    return json.loads(run(
        "gh", "issue", "view", str(number), "--repo", f"https://github.com/{REPO}",
        "--json", "number,title,body,labels,milestone,state,url",
    ))


def story_id(item):
    match = re.match(r"^\[(US-[0-9]{3,})\]\s+\S", item["title"])
    require(match, f"Issue #{item['number']} não possui título [US-XXX] válido.")
    return match[1]


def slug(text):
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")


def branch_name(item):
    story = story_id(item)
    labels = {x["name"].lower() for x in item.get("labels", [])}
    fix = bool(labels & {"bug", "fix", "correcao", "correção"})
    chore = bool(labels & {"chore", "technical", "technical-task", "tarefa-tecnica", "tarefa técnica"})
    require(not (fix and chore), "Rótulos de correção e tarefa técnica conflitantes.")
    prefix = "fix" if fix else "chore" if chore else "feat"
    title_slug = slug(re.sub(r"^\[US-[0-9]+\]\s*", "", item["title"]))
    require(title_slug, "Título não produz slug válido.")
    return f"{prefix}/{story.lower()}-{title_slug}"


def acceptance(body):
    match = re.search(r"^## Critérios de aceite\s*\n(.*?)(?=^## |\Z)", body, re.M | re.S)
    require(match, "Issue sem seção de critérios de aceite.")
    value = match[1].strip()
    require(re.search(r"^- \[[ xX]\] \S", value, re.M), "Issue sem critérios verificáveis.")
    return value


def mapped_spec(item):
    milestone = item.get("milestone")
    require(milestone, f"Issue #{item['number']} sem milestone.")
    match = specs().get(milestone["number"])
    require(match, f"Milestone #{milestone['number']} sem spec.")
    path, data = match
    story = story_id(item)
    text = path.read_text()
    block = re.search(rf"^### {re.escape(story)} — .*?(?=^### |^## |\Z)", text, re.M | re.S)
    require(block, f"{story} não está rastreada em {path.relative_to(ROOT)}.")
    require(f"GitHub Issue: [#{item['number']}]" in block[0], "US aponta a outra Issue na spec.")
    require(item["title"].split("] ", 1)[1] in block[0].splitlines()[0],
            "Título da história diverge do GitHub; atualize a spec.")
    require(acceptance(item["body"]) in block[0],
            "Critérios no GitHub diferem da spec; reconcilie antes de continuar.")
    story_text = re.search(r"^## História de usuário\s*\n(.*?)(?=^## |\Z)",
                           item["body"], re.M | re.S)
    require(story_text and story_text[1].strip() in block[0],
            "História no GitHub difere da spec; reconcilie antes de continuar.")
    require(milestone["title"] in text, "Título da milestone diverge do GitHub.")
    return path, data


def milestone(title):
    matches = [m for m in api(f"repos/{REPO}/milestones?state=all&per_page=100", True)
               if m["title"] == title]
    require(len(matches) == 1, "Informe o título exato de uma milestone existente e única.")
    return matches[0]


def milestone_issues(m):
    items = api(f"repos/{REPO}/issues?state=all&milestone={m['number']}&per_page=100", True)
    items = [i for i in items if "pull_request" not in i]
    require(len({i["number"] for i in items}) == len(items), "GitHub retornou Issues duplicadas.")
    return items


def clean_tree():
    require(not git("status", "--porcelain", "--untracked-files=all"),
            "Working tree suja. Preserve e resolva as alterações antes de continuar.")


def remote_main():
    output = git("ls-remote", "--exit-code", "origin", "refs/heads/main")
    lines = output.splitlines()
    require(len(lines) == 1, "Não foi possível confirmar main remota.")
    return lines[0].split()[0]


def synchronized_main():
    require(git("branch", "--show-current") == "main", "A branch atual deve ser main.")
    clean_tree()
    head = git("rev-parse", "HEAD")
    require(head == remote_main(), "main não está sincronizada com origin/main.")
    return head


def unique_branch(item, branch):
    story = story_id(item).lower()
    local = git("for-each-ref", "--format=%(refname:short)", "refs/heads").splitlines()
    remote = git("ls-remote", "--heads", "origin").splitlines()
    names = local + [line.split("refs/heads/", 1)[1] for line in remote if "refs/heads/" in line]
    require(not any(name == branch or re.match(rf"^(feat|fix|chore)/{story}-", name)
                    for name in names),
            f"Já existe branch local/remota de {story}; não será sobrescrita nem duplicada.")


def check_issue(number):
    item = issue(number)
    print(f"Issue #{item['number']}: {item['title']}\n{item['url']}")
    print(f"Status: {item['state']}")
    print("Milestone:", (item.get("milestone") or {}).get("title", "AUSENTE"))
    print("Labels:", ", ".join(label["name"] for label in item.get("labels", [])))
    print("Branch esperada:", branch_name(item))
    print("Critérios de aceite:\n" + acceptance(item["body"]))
    path, data = mapped_spec(item)
    print("Spec:", path.relative_to(ROOT))
    print("Ready registrado:", "sim" if story_id(item) in data.get("ready_stories", []) else "não")
    return item


def start_issue(number):
    item = issue(number)
    require(item["state"].upper() == "OPEN", "Não iniciar branch para Issue fechada.")
    path, data = mapped_spec(item)
    story = story_id(item)
    require(re.search(r"Como .+quero .+para .+", item["body"], re.I | re.S),
            "História de usuário incompleta.")
    require(story in data.get("ready_stories", []),
            "Definition of Ready não registrada. Resolva questões bloqueantes no GitHub "
            "e inclua a US em ready_stories da spec após revisão.")
    clean_tree()
    branch = branch_name(item)
    unique_branch(item, branch)
    # A local main ahead of/diverged from origin is not the latest remote trunk.
    git("fetch", "origin", "refs/heads/main:refs/remotes/origin/main")
    git("merge-base", "--is-ancestor", "main", "refs/remotes/origin/main")
    git("switch", "main")
    git("pull", "--ff-only", "origin", "main")
    synchronized_main()
    # Re-read the spec after updating main; never branch using stale readiness.
    item = issue(number)
    path, data = mapped_spec(item)
    require(item["state"].upper() == "OPEN" and story_id(item) in data.get("ready_stories", []),
            "Issue/prontidão mudou ao atualizar main; revise antes de continuar.")
    branch = branch_name(item)
    unique_branch(item, branch)
    git("switch", "-c", branch)
    print(f"Branch criada: {branch}\nSpec: {path.relative_to(ROOT)}")
    print(f"Selecionar no Spec Kit: export SPECIFY_FEATURE_DIRECTORY=specs/{path.parent.name}")


def check_milestone(title):
    m = milestone(title)
    items = milestone_issues(m)
    total = len(items)
    closed = sum(i["state"].lower() == "closed" for i in items)
    print(f"Milestone #{m['number']}: {m['title']} ({m['state']})")
    print(f"Total: {total}\nAbertas: {total - closed}\nFechadas: {closed}")
    print(f"Concluído por estado das Issues: {100 * closed / total if total else 0:.1f}%")
    if not total:
        print("Apta para release: não; milestone vazia não comprova entrega.")
    elif closed != total:
        print("Apta para release: não; existem Issues abertas.")
    else:
        print("Apta para release: não comprovado. Elegível para o quality gate; "
              "ainda faltam main, PRs integrados, checks e revisões.")
    mapping = specs()
    require(m["number"] in mapping, "Milestone sem spec.")
    path, _ = mapping[m["number"]]
    expected = {int(number) for number in re.findall(
        r"^GitHub Issue: \[#(\d+)\]", path.read_text(), re.M,
    )}
    require(expected == {item["number"] for item in items},
            "Issues da milestone diferem da spec; reconcilie o escopo antes de continuar.")
    for item in items:
        mapped_spec(item)
    return m, items


def tag_absent(tag):
    require(not git("tag", "--list", tag), f"Tag local {tag} já existe; não sobrescrever.")
    require(not git("ls-remote", "--tags", "origin", f"refs/tags/{tag}", f"refs/tags/{tag}^{{}}"),
            f"Tag remota {tag} já existe; não sobrescrever.")


def merged_prs(items):
    query = '''query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          closedByPullRequestsReferences(first: 100) {
            pageInfo { hasNextPage }
            nodes { url merged baseRefName repository { nameWithOwner }
                    mergeCommit { oid } }
          }
        }
      }
    }'''
    owner, name = REPO.split("/")
    for item in items:
        data = json.loads(run(
            "gh", "api", "--hostname", "github.com", "graphql", "-f", f"query={query}",
            "-f", f"owner={owner}", "-f", f"name={name}", "-F", f"number={item['number']}",
        ))
        require(not data.get("errors"), f"Não foi possível verificar PRs de #{item['number']}.")
        refs = data["data"]["repository"]["issue"]["closedByPullRequestsReferences"]
        require(not refs["pageInfo"]["hasNextPage"], "Mais de 100 PRs vinculados; revisar paginação.")
        prs = refs["nodes"]
        require(prs, f"Issue #{item['number']} fechada sem PR de conclusão rastreável.")
        for pr in prs:
            require(pr["merged"] and pr["baseRefName"] == "main"
                    and pr["repository"]["nameWithOwner"].lower() == REPO.lower()
                    and pr["mergeCommit"], f"PR não integrado corretamente: {pr['url']}.")
            git("merge-base", "--is-ancestor", pr["mergeCommit"]["oid"], "HEAD")


def quality_gate():
    path = ROOT / "scripts/quality-gate.json"
    config = json.loads(path.read_text())
    required = ("tests", "lint", "typecheck", "build", "e2e")
    require(set(config) == set(required), "Configuração do quality gate deve conter os cinco gates.")
    # Validate every entry before executing any command; missing setup never passes.
    for name in required:
        value = config[name]
        if isinstance(value, dict):
            require(name in ("typecheck", "e2e") and set(value) == {"not_applicable"}
                    and isinstance(value["not_applicable"], str)
                    and len(value["not_applicable"].strip()) >= 20,
                    f"Justificativa de não aplicabilidade inválida para {name}.")
        else:
            require(isinstance(value, list) and value
                    and all(isinstance(x, str) and x for x in value),
                    f"Gate {name} não configurado. Configure comandos reais do app; release bloqueada.")
    for name in required:
        value = config[name]
        if isinstance(value, dict):
            print(f"{name}: não aplicável — {value['not_applicable']}")
            continue
        print(f"Executando gate {name}: {value}", flush=True)
        result = subprocess.run(value, cwd=ROOT, check=False)
        require(result.returncode == 0, f"Gate {name} falhou; tag bloqueada.")


def review_evidence(m, head):
    raw_path = os.environ.get("TEAR_RELEASE_EVIDENCE")
    require(raw_path, "Defina TEAR_RELEASE_EVIDENCE para evidência revisada do commit exato; "
                      "consulte .specify/templates/release-evidence-template.md.")
    path = Path(raw_path).expanduser().resolve()
    require(path.is_file(), "Arquivo de evidência não encontrado.")
    evidence = metadata(path)
    require(evidence.get("milestone") == m["number"] and evidence.get("commit") == head,
            "Evidência não corresponde à milestone/commit atual.")
    require(isinstance(evidence.get("reviewer"), str) and evidence["reviewer"].strip(),
            "Revisor não identificado na evidência.")
    for field in REVIEW_FIELDS:
        require(evidence.get(field) is True, f"Revisão pendente: {field}.")
    body = path.read_text().split("---", 2)[-1].strip()
    require(len(body) > 100, "Registre evidências concretas, não apenas flags de aprovação.")


def remote_checks(head):
    statuses = api(f"repos/{REPO}/commits/{head}/statuses?per_page=100", True)
    latest = {}
    for status in statuses:  # API returns newest first.
        latest.setdefault(status["context"], status["state"])
    require(all(state == "success" for state in latest.values()), "Status remoto pendente/falhando.")
    page = 1
    while True:
        checks = api(f"repos/{REPO}/commits/{head}/check-runs?filter=latest&per_page=100&page={page}")
        for check in checks["check_runs"]:
            require(check["status"] == "completed" and check["conclusion"] in ("success", "neutral", "skipped"),
                    f"Check remoto pendente/falhando: {check['name']}.")
        if len(checks["check_runs"]) < 100:
            break
        page += 1
    # Branch protection/ruleset approval remains a reviewer responsibility, not inferred here.


def tag_milestone(title):
    m, items = check_milestone(title)
    require(items and all(i["state"].lower() == "closed" for i in items),
            "Todas as Issues da milestone devem estar concluídas; nenhuma tag criada.")
    path, data = specs()[m["number"]]
    require(data.get("status") == "implemented", "Spec ainda não marcada implemented após revisão.")
    tasks = (path.parent / "tasks.md").read_text()
    require(re.search(r"^- \[[xX]\] T\d+", tasks, re.M)
            and not re.search(r"^- \[ \] T\d+", tasks, re.M), "Tasks não concluídas.")
    head = synchronized_main()
    tag = data["tag"]
    tag_absent(tag)
    merged_prs(items)
    review_evidence(m, head)
    remote_checks(head)
    quality_gate()
    # Tests/hooks may modify the working tree or main; recheck immediately before tagging.
    require(synchronized_main() == head, "HEAD mudou durante os gates.")
    final_m = milestone(title)
    final_items = milestone_issues(final_m)
    require(final_m["number"] == m["number"]
            and {(i["number"], i["state"].lower()) for i in final_items}
            == {(i["number"], "closed") for i in items}, "Backlog mudou durante os gates.")
    for item in final_items:
        mapped_spec(item)
    remote_checks(head)
    tag_absent(tag)
    require(synchronized_main() == head, "main mudou antes de criar a tag.")
    git("tag", "-a", tag, head, "-m", f"Milestone concluída: {m['title']}")
    print(f"Tag anotada criada localmente: {tag}\nNenhum push executado.")
    print(f"Para publicação explícita pelo usuário: git push origin {tag}")


def main(argv):
    commands = {"start-issue": start_issue, "check-issue": check_issue,
                "check-milestone": check_milestone, "tag-milestone": tag_milestone}
    require(len(argv) == 2 and argv[0] in commands,
            "Uso: start-issue|check-issue NUMERO ou check-milestone|tag-milestone 'Título exato'.")
    prerequisites()
    commands[argv[0]](argv[1])


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except (WorkflowError, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        sys.exit(1)
