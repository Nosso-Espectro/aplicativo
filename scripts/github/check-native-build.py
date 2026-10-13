#!/usr/bin/env python3
"""Verify native builds on GitHub Actions without compiling locally."""

import sys

from _workflow import REPO, WorkflowError, api, git, prerequisites, require

NATIVE_JOBS = {"Android release APK (test signing)", "iOS Release simulator build"}


def completed_build(run, jobs, artifacts, sha):
    if not (
        run.get("head_sha") == sha
        and run.get("head_branch") == "main"
        and run.get("event") == "workflow_dispatch"
        and run.get("status") == "completed"
        and run.get("conclusion") == "success"
    ):
        return False
    successful_jobs = {
        job["name"] for job in jobs
        if job.get("status") == "completed" and job.get("conclusion") == "success"
    }
    available_artifacts = {
        artifact["name"] for artifact in artifacts
        if not artifact.get("expired", True) and artifact.get("size_in_bytes", 0) > 0
    }
    return NATIVE_JOBS <= successful_jobs and {
        f"tear-android-{sha}", f"tear-ios-simulator-{sha}",
    } <= available_artifacts


def main():
    prerequisites()
    sha = git("rev-parse", "HEAD")
    require(git("branch", "--show-current") == "main", "Execute o gate na main integrada.")
    endpoint = f"repos/{REPO}/actions"
    runs = api(
        f"{endpoint}/workflows/mobile-quality.yml/runs"
        f"?head_sha={sha}&event=workflow_dispatch&status=completed&per_page=100"
    )["workflow_runs"]
    for run in runs:
        if run.get("conclusion") != "success":
            continue
        jobs = api(f"{endpoint}/runs/{run['id']}/jobs?per_page=100&filter=latest")["jobs"]
        artifacts = api(f"{endpoint}/runs/{run['id']}/artifacts?per_page=100")["artifacts"]
        if completed_build(run, jobs, artifacts, sha):
            print(f"BUILD REMOTO OK: {sha} — {run['html_url']}")
            return
    raise WorkflowError(
        f"Build remoto ausente ou incompleto para {sha}. Execute Mobile quality "
        "na main com platform=both; Android/iOS e artefatos devem estar aprovados."
    )


if __name__ == "__main__":
    try:
        main()
    except (WorkflowError, KeyError, ValueError) as error:
        print(f"ERRO: {error}", file=sys.stderr)
        sys.exit(1)
