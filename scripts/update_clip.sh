#!/bin/bash
# clip_updater_daemon.sh

CLIPS_DIR="/path/to/clips"

while true; do
    for clip_dir in "$CLIPS_DIR"/*; do
        if [[ -f "$clip_dir/.status" ]]; then
            status=$(cat "$clip_dir/.status")
            if [[ "$status" == "started" ]]; then
                clip_name=$(basename "$clip_dir")
                ./clip_manager.sh update "$clip_name"
            fi
        fi
    done
    sleep 2
done