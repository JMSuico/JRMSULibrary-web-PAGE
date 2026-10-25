#!/usr/bin/env python3
"""
Portable Session Importer for Antigravity CLI (agy)
Usage on Library PC:
    python import-session.py
"""

import os
import sys
import json
import sqlite3
import zipfile
import urllib.parse
from pathlib import Path

CONV_ID = "f84debdb-96dd-49b1-8817-a7961ac87f30"
ZIP_NAME = "session_f84debdb_portable.zip"

def main():
    print("=" * 60)
    print(f" Antigravity Session Importer -> {CONV_ID}")
    print("=" * 60)

    # 1. Locate zip package
    script_dir = Path(__file__).resolve().parent
    zip_path = script_dir / ZIP_NAME
    if not zip_path.exists():
        zip_path = Path(ZIP_NAME)
    if not zip_path.exists():
        print(f"ERROR: Cannot find '{ZIP_NAME}' in {script_dir}")
        print("Please ensure the zip file is in the same folder as this script.")
        sys.exit(1)

    # 2. Locate ~/.gemini/antigravity-cli
    cli_base = Path.home() / ".gemini" / "antigravity-cli"
    convs_dir = cli_base / "conversations"
    brain_dir = cli_base / "brain" / CONV_ID
    summaries_db_path = cli_base / "conversation_summaries.db"

    convs_dir.mkdir(parents=True, exist_ok=True)
    brain_dir.mkdir(parents=True, exist_ok=True)

    print(f"Target CLI directory: {cli_base}")

    # 3. Unpack zip
    print(f"Extracting '{ZIP_NAME}'...")
    summary_data = None
    with zipfile.ZipFile(zip_path, "r") as z:
        for member in z.infolist():
            if member.filename == f"{CONV_ID}.db":
                target_file = convs_dir / f"{CONV_ID}.db"
                with z.open(member) as source, open(target_file, "wb") as target:
                    target.write(source.read())
                print(f" -> Restored database: {target_file}")
            elif member.filename.startswith("brain/"):
                rel_path = member.filename[len("brain/"):]
                if not rel_path:
                    continue
                target_file = brain_dir / rel_path
                if member.is_dir():
                    target_file.mkdir(parents=True, exist_ok=True)
                else:
                    target_file.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(member) as source, open(target_file, "wb") as target:
                        target.write(source.read())
            elif member.filename == "summary.json":
                with z.open(member) as f:
                    summary_data = json.loads(f.read().decode("utf-8"))

    print(" -> Brain artifacts and transcript logs restored.")

    # 4. Determine current workspace URI on this machine
    current_dir = Path.cwd().resolve()
    # Format as valid file URI (e.g. file:///C:/path/to/project)
    path_posix = str(current_dir).replace("\\", "/")
    if not path_posix.startswith("/"):
        path_posix = "/" + path_posix
    workspace_uri = f"file://{path_posix}"
    workspace_json = json.dumps([workspace_uri])

    # 5. Register in conversation_summaries.db
    print("Registering conversation in CLI registry...")
    con = sqlite3.connect(summaries_db_path)
    
    # Ensure table exists
    con.execute("""
    CREATE TABLE IF NOT EXISTS conversation_summaries (
        conversation_id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        preview TEXT NOT NULL DEFAULT '',
        step_count INTEGER NOT NULL DEFAULT 0,
        last_modified_time TEXT NOT NULL,
        workspace_uris TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '',
        project_id TEXT NOT NULL DEFAULT '',
        agent_name TEXT NOT NULL DEFAULT '',
        parent_conversation_id TEXT NOT NULL DEFAULT '',
        nesting_depth INTEGER NOT NULL DEFAULT 0,
        battle_id TEXT NOT NULL DEFAULT '',
        winning_conversation_id TEXT NOT NULL DEFAULT '',
        not_fully_idle BOOLEAN NOT NULL DEFAULT false,
        killed BOOLEAN NOT NULL DEFAULT false,
        last_user_input_time TEXT NOT NULL,
        last_user_input_step_index INTEGER NOT NULL DEFAULT -1,
        app_data_dir TEXT NOT NULL DEFAULT '',
        raw_summary BLOB,
        group_id TEXT NOT NULL DEFAULT ''
    )
    """)

    title = summary_data.get("title", "JRMSU Library Session") if summary_data else "JRMSU Library Session"
    preview = summary_data.get("preview", "JRMSU Library Full Stack & Dynamic Content") if summary_data else "JRMSU Library Full Stack & Dynamic Content"
    step_count = summary_data.get("step_count", 6650) if summary_data else 6650

    con.execute("""
    INSERT OR REPLACE INTO conversation_summaries (
        conversation_id, title, preview, step_count, last_modified_time,
        workspace_uris, status, source, project_id, agent_name,
        parent_conversation_id, nesting_depth, battle_id, winning_conversation_id,
        not_fully_idle, killed, last_user_input_time, last_user_input_step_index,
        app_data_dir, group_id
    ) VALUES (
        ?, ?, ?, ?, datetime('now'),
        ?, 'CASCADE_RUN_STATUS_IDLE', '', 'default-cli-project', '',
        '', 0, '', '',
        0, 0, datetime('now'), -1,
        'antigravity-cli', ''
    )
    """, (
        CONV_ID,
        title,
        preview,
        step_count,
        workspace_json
    ))
    con.commit()
    con.close()

    print("\n" + "=" * 60)
    print(" [SUCCESS] Conversation imported successfully on this PC!")
    print("=" * 60)
    print("\nTo continue right now, run:")
    print(f"\n    agy --conversation {CONV_ID}\n")
    print("Or simply:")
    print("\n    agy -c\n")

if __name__ == "__main__":
    main()
