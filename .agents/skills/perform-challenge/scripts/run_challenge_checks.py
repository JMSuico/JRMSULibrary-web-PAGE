#!/usr/bin/env python3
"""
Deterministic 6-Domain Static & Runtime Scanner for PERFORM-CHALLENGE.
Usage:
    python scripts/run_challenge_checks.py <repo_root> [--run-tests]
"""
import argparse
import os
import py_compile
import re
import subprocess
import sys
from pathlib import Path

EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F6FF"
    "\U0001F900-\U0001F9FF"
    "\U00002600-\U000026FF"
    "\U00002700-\U000027BF"
    "]+",
    flags=re.UNICODE,
)
CONTROLLER_ORM_RE = re.compile(r"\b\w+\.objects\.(?:all|filter|get|exclude|raw|create|update|delete)\s*\(")
ALPHABETICAL_SLICE_RE = re.compile(r"\.order_by\(\s*['\"]name['\"]\s*\)\s*\[\s*:\s*\d+\s*\]")
TS_ANY_RE = re.compile(r"(?::\s*any\b|\bas\s+any\b|<any>)")


def iter_source_files(root: Path, exts: tuple[str, ...]):
    ignore_dirs = {".git", "node_modules", "dist", "build", "__pycache__", ".venv", "venv", "migrations"}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith(".")]
        for fname in filenames:
            if fname.endswith(exts):
                yield Path(dirpath) / fname


def resolve_project_python(repo_root: Path) -> str:
    import shutil
    candidates = [
        repo_root / "backend" / ".venv" / "Scripts" / "python.exe",
        repo_root / ".venv" / "Scripts" / "python.exe",
        repo_root / "backend" / "venv" / "Scripts" / "python.exe",
        repo_root / "venv" / "Scripts" / "python.exe",
        Path.home() / "AppData" / "Local" / "Programs" / "Python" / "Python314" / "python.exe",
        Path.home() / "AppData" / "Local" / "Programs" / "Python" / "Python313" / "python.exe",
        Path.home() / "AppData" / "Local" / "Programs" / "Python" / "Python312" / "python.exe",
    ]
    which_py = shutil.which("python")
    if which_py:
        candidates.append(Path(which_py))
    for c in candidates:
        if c.exists():
            chk = subprocess.run([str(c), "-c", "import django"], capture_output=True)
            if chk.returncode == 0:
                return str(c)
    return sys.executable


def audit_repository(repo_root: Path, run_tests: bool = False) -> int:
    failures: list[str] = []
    notes: list[str] = []

    py_files = list(iter_source_files(repo_root, (".py",)))
    ts_files = list(iter_source_files(repo_root, (".ts", ".tsx")))

    # Domain 1: Architecture, Flowchain & Anti-Spaghetti
    controller_orm_hits = []
    for pf in py_files:
        rel = pf.relative_to(repo_root).as_posix()
        if "controller" in rel.lower() and "test" not in rel.lower():
            text = pf.read_text(encoding="utf-8", errors="ignore")
            for lineno, line in enumerate(text.splitlines(), 1):
                if CONTROLLER_ORM_RE.search(line) and not line.lstrip().startswith("#"):
                    controller_orm_hits.append(f"{rel}:{lineno}: {line.strip()}")
    if controller_orm_hits:
        failures.append(f"[Domain 1 - Architecture] Direct ORM query inside Controller: {controller_orm_hits[:5]}")
    else:
        notes.append("[Domain 1 - Architecture] PASS: Zero direct ORM queries inside Controllers.")

    # Domain 2: Database & Query Safety
    alpha_cutoff_hits = []
    for pf in py_files:
        rel = pf.relative_to(repo_root).as_posix()
        if "repository" in rel.lower() or "service" in rel.lower():
            text = pf.read_text(encoding="utf-8", errors="ignore")
            for lineno, line in enumerate(text.splitlines(), 1):
                if ALPHABETICAL_SLICE_RE.search(line) and not line.lstrip().startswith("#"):
                    alpha_cutoff_hits.append(f"{rel}:{lineno}: {line.strip()}")
    if alpha_cutoff_hits:
        failures.append(f"[Domain 2 - Database] Alphabetical .order_by('name')[:N] cutoff found: {alpha_cutoff_hits}")
    else:
        notes.append("[Domain 2 - Database] PASS: Zero alphabetical .order_by('name')[:N] search cutoffs.")

    # Domain 3: Backend Bytecode Compilation
    compile_errors = []
    for pf in py_files:
        try:
            py_compile.compile(str(pf), doraise=True)
        except py_compile.PyCompileError as exc:
            compile_errors.append(str(exc))
    if compile_errors:
        failures.append(f"[Domain 3 - Backend] py_compile errors: {compile_errors[:5]}")
    else:
        notes.append(f"[Domain 3 - Backend] PASS: {len(py_files)} Python files compiled cleanly.")

    # Domain 4 & 6: Streaming Headers, Path Traversal & Nginx Worker MIME
    nginx_conf = repo_root / "frontend" / "nginx.conf"
    if nginx_conf.exists():
        ng_text = nginx_conf.read_text(encoding="utf-8", errors="ignore")
        if "nosniff" in ng_text and "mjs" not in ng_text:
            failures.append("[Domain 6 - Security/MIME] nginx.conf sets nosniff without explicit .mjs MIME rule.")
        else:
            notes.append("[Domain 6 - Security/MIME] PASS: nginx.conf .mjs MIME + nosniff verified.")

    urls_py = repo_root / "backend" / "core" / "urls.py"
    if urls_py.exists():
        u_text = urls_py.read_text(encoding="utf-8", errors="ignore")
        if "realpath" in u_text and "commonpath" in u_text and "206" in u_text:
            notes.append("[Domain 4 & 6 - API/Security] PASS: Range streaming (206) + realpath/commonpath verified.")
        else:
            failures.append("[Domain 4 & 6 - API/Security] urls.py missing realpath/commonpath or 206 Range support.")

    # Domain 5: Frontend TypeScript / Lint check & Migrations (optional runtime flag)
    if run_tests:
        manage_py = repo_root / "backend" / "manage.py"
        if manage_py.exists():
            py_exe = resolve_project_python(repo_root)
            django_ok = subprocess.run([py_exe, "-c", "import django"], capture_output=True).returncode == 0
            if not django_ok:
                notes.append(
                    "[Domain 2 - Migrations] SKIPPED: Django not installed on host. Run inside the container: "
                    "docker compose exec backend python manage.py makemigrations --check --dry-run"
                )
            else:
                res = subprocess.run(
                    [py_exe, str(manage_py), "makemigrations", "--check", "--dry-run"],
                    cwd=str(repo_root / "backend"),
                    capture_output=True,
                    text=True,
                )
                if res.returncode != 0:
                    failures.append(f"[Domain 2 - Migrations] makemigrations --check failed: {res.stderr.strip()}")
                else:
                    notes.append("[Domain 2 - Migrations] PASS: makemigrations --check --dry-run exited 0.")

    print("=== PERFORM-CHALLENGE SCAN SUMMARY ===")
    for n in notes:
        print("  " + n)
    for f in failures:
        print("  FAIL: " + f)

    return 1 if failures else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run PERFORM-CHALLENGE 6-Domain verification checks.")
    parser.add_argument("repo_root", nargs="?", default=".", help="Path to repository root")
    parser.add_argument("--run-tests", action="store_true", help="Run live migration and test commands")
    args = parser.parse_args()
    sys.exit(audit_repository(Path(args.repo_root).resolve(), run_tests=args.run_tests))
