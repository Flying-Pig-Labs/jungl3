#!/usr/bin/env python3
"""
Submit, poll, and collect Parallel.ai deep-research runs for the
2026-04-22 cluster.

Pattern matches the 2026-04-21 cluster: per-topic .input.md assembly from
00-context.md + NN-slug.md, per-topic .start.json with run_id, per-topic
.poll.log for monitoring, per-topic result markdown + full JSON.

Stdlib only. API key from PARALLEL_AI_KEY or PARALLEL_API_KEY.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
PROMPTS = HERE / "prompts"
RUNS = HERE / "runs"
LOGS = HERE / "logs"
RESULTS = HERE / "results"

BASE_URL = "https://api.parallel.ai/v1/tasks/runs"


def api_key() -> str:
    key = os.getenv("PARALLEL_AI_KEY") or os.getenv("PARALLEL_API_KEY")
    if not key:
        sys.exit("Set PARALLEL_AI_KEY or PARALLEL_API_KEY in the environment.")
    return key


def _request(method: str, path: str = "", data: dict | None = None, timeout: int = 60) -> dict:
    url = BASE_URL + path
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = Request(url, data=body, method=method)
    req.add_header("x-api-key", api_key())
    req.add_header("Content-Type", "application/json")
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def topic_prompts() -> list[Path]:
    """Return prompt files in numeric order, excluding 00-context.md."""
    return sorted(p for p in PROMPTS.glob("[0-9][0-9]-*.md") if not p.name.startswith("00-"))


def assemble_input(topic: Path) -> str:
    """Context + topic, joined with a separator. Written to runs/ so we can diff."""
    context = (PROMPTS / "00-context.md").read_text()
    topic_body = topic.read_text()
    return f"{context}\n\n---\n\n{topic_body}"


def slug(topic: Path) -> str:
    return topic.stem


def submit_one(topic: Path, processor: str) -> dict:
    RUNS.mkdir(exist_ok=True)
    s = slug(topic)
    input_path = RUNS / f"{s}.input.md"
    start_path = RUNS / f"{s}.start.json"
    err_path = RUNS / f"{s}.start.err"

    if start_path.exists():
        existing = json.loads(start_path.read_text())
        print(f"[{s}] already submitted: {existing.get('run_id')}")
        return existing

    input_text = assemble_input(topic)
    input_path.write_text(input_text)

    try:
        resp = _request(
            "POST",
            data={
                "input": input_text,
                "processor": processor,
                "task_spec": {"output_schema": {"type": "text"}},
            },
            timeout=120,
        )
    except HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        err_path.write_text(f"HTTPError {e.code}: {err_body}\n")
        print(f"[{s}] FAILED: HTTP {e.code} — see {err_path.name}")
        return {"error": f"HTTP {e.code}", "body": err_body}
    except URLError as e:
        err_path.write_text(f"URLError: {e}\n")
        print(f"[{s}] FAILED: {e}")
        return {"error": str(e)}

    start_path.write_text(json.dumps(resp, indent=2))
    print(f"[{s}] submitted: {resp.get('run_id')} (processor={resp.get('processor')})")
    return resp


def submit_all(processor: str) -> None:
    for topic in topic_prompts():
        submit_one(topic, processor)


def _poll_once(run_id: str) -> dict:
    return _request("GET", f"/{run_id}")


def poll_run(run_id: str) -> str:
    status = _poll_once(run_id).get("status", "unknown")
    print(f"{run_id}: {status}")
    return status


def poll_all(interval: int = 60, log: bool = True) -> None:
    LOGS.mkdir(exist_ok=True)
    topics = topic_prompts()
    done: set[str] = set()
    while len(done) < len(topics):
        for topic in topics:
            s = slug(topic)
            if s in done:
                continue
            start_path = RUNS / f"{s}.start.json"
            if not start_path.exists():
                done.add(s)
                continue
            run_id = json.loads(start_path.read_text()).get("run_id")
            if not run_id:
                done.add(s)
                continue
            try:
                status = _poll_once(run_id).get("status", "unknown")
            except HTTPError as e:
                status = f"poll-error-{e.code}"
            ts = dt.datetime.now(dt.timezone.utc).isoformat()
            line = f"{ts} {run_id} {status}\n"
            if log:
                (LOGS / f"{s}.poll.log").open("a").write(line)
            print(line, end="")
            if status in ("completed", "failed"):
                done.add(s)
        if len(done) < len(topics):
            time.sleep(interval)


def collect_one(topic: Path) -> None:
    RESULTS.mkdir(exist_ok=True)
    s = slug(topic)
    start_path = RUNS / f"{s}.start.json"
    if not start_path.exists():
        print(f"[{s}] no start record")
        return
    run_id = json.loads(start_path.read_text()).get("run_id")
    if not run_id:
        print(f"[{s}] no run_id in start record")
        return

    status = _poll_once(run_id).get("status", "unknown")
    if status != "completed":
        print(f"[{s}] {run_id} status={status}; skipping")
        return

    raw = _request("GET", f"/{run_id}/result")
    (RESULTS / f"{s}.json").write_text(json.dumps(raw, indent=2))
    content = raw.get("output", {}).get("content", "")
    if not isinstance(content, str):
        content = json.dumps(content, indent=2)
    (RESULTS / f"{s}.md").write_text(content)
    print(f"[{s}] collected: results/{s}.md")


def collect_all() -> None:
    for topic in topic_prompts():
        collect_one(topic)


def main() -> None:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)

    sub_submit_all = sub.add_parser("submit-all", help="Submit every prompt in prompts/")
    sub_submit_all.add_argument("--processor", default="ultra4x")

    sub_submit_one = sub.add_parser("submit-one", help="Submit a single topic by slug")
    sub_submit_one.add_argument("slug")
    sub_submit_one.add_argument("--processor", default="ultra4x")

    sub_poll = sub.add_parser("poll", help="Poll one run_id once")
    sub_poll.add_argument("run_id")

    sub_poll_all = sub.add_parser("poll-all", help="Poll all in-flight runs until done")
    sub_poll_all.add_argument("--interval", type=int, default=60)

    sub.add_parser("collect-all", help="Fetch results for all completed runs")

    sub_collect_one = sub.add_parser("collect-one", help="Fetch result for one topic slug")
    sub_collect_one.add_argument("slug")

    args = p.parse_args()

    if args.cmd == "submit-all":
        submit_all(args.processor)
    elif args.cmd == "submit-one":
        topic = PROMPTS / f"{args.slug}.md"
        if not topic.exists():
            sys.exit(f"no such prompt: {topic}")
        submit_one(topic, args.processor)
    elif args.cmd == "poll":
        poll_run(args.run_id)
    elif args.cmd == "poll-all":
        poll_all(interval=args.interval)
    elif args.cmd == "collect-all":
        collect_all()
    elif args.cmd == "collect-one":
        topic = PROMPTS / f"{args.slug}.md"
        if not topic.exists():
            sys.exit(f"no such prompt: {topic}")
        collect_one(topic)


if __name__ == "__main__":
    main()
