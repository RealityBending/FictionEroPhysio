import pandas as pd

from func_report import LOG_COLUMNS, TASKS, write_report

# Builds processing_report.html from the statuses typed in below (no processing log needed).
# After each batch of participants, add them under a new date and run this script.

# Change the path to your local data folder.
path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/"
meta = pd.read_csv(path + "participants.tsv", sep="\t")

# Statuses =====================================================================================
# batch date -> participant -> {task: status}
# Tasks: "RS" (resting state), "HCT" (heartbeat counting), "FIC" (fiction phase 1)
# "ALL" sets every task; a task listed next to it overrides it for that task.
# A status is either "Processed" / "Excluded" / "Failed", or a tuple with notes:
#   (status, reason)  or, for FIC, (status, reason, trials with physiology)
HCT_NO_DURATION = "Interval lengths not saved in behavioural file; duration check skipped"

batches = {
    "2026-10-14": {
        "sub-001": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-002": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-003": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION),
            "FIC": ("Excluded", "Recording split into two files at the break (FP1b), not handled yet"),
        },
        "sub-004": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-005": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION),
            "FIC": ("Processed", "Missing trial(s) 23 kept with NA", "49/50"),
        },
        "sub-006": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION),
            "FIC": ("Processed", "Missing trial(s) 1 kept with NA", "49/50"),
        },
        "sub-007": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
    },
    "2026-10-15": {
        "sub-008": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-009": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-010": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION + "; 1 interval(s) with a count of 0 (excluded from awareness)"),
            "FIC": ("Processed", "", "50/50"),
        },
        "sub-011": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-012": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION),
            "FIC": ("Excluded", "Only a few images recorded (Muse battery died, recording not resumed)"),
        },
        "sub-013": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-014": {
            "ALL": "Processed",
            "HCT": ("Processed", HCT_NO_DURATION),
            "FIC": ("Excluded", "Recording split into two files at the break, not handled yet"),
        },
        "sub-015": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-016": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-017": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-018": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-019": {"ALL": "Processed", "HCT": ("Processed", HCT_NO_DURATION), "FIC": ("Processed", "", "50/50")},
        "sub-020": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-021": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-022": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-023": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-024": {
            "ALL": "Processed",
            "HCT": (
                "Processed",
                "Interval 1 photosensor is 34.23 s vs 35 s programmed (screen appeared late); "
                "duration tolerance raised to 1 s",
            ),
            "FIC": ("Processed", "", "50/50"),
        },
        "sub-025": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-026": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-027": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-028": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-029": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
        "sub-030": {"ALL": "Processed", "FIC": ("Processed", "", "50/50")},
    },
}

# Exclusions (keep in sync with the physio script) =============================================
# Planned whole-task exclusions: shown as "Excluded" for participants not in a batch yet
exclusions = {
    "sub-003": {"FIC": "Split recording, handle separately"},
    "sub-012": {"FIC": "Only a few images recorded (Muse battery died, recording not resumed)"},
    "sub-014": {"FIC": "Recording split into two files at the break, not handled yet"},
}

# Trial-level exclusions (fiction): participant -> {trial (Phase 1 order): reason}
missing_trials = {
    "sub-005": {23: "No photosensor marker (gap between events 22 and 23 equals two trials)"},
    "sub-006": {1: "Not recorded (participant started before the recording)"},
}


# Build the report =============================================================================
rows = []
for date, subs in batches.items():
    for sub, tasks in subs.items():
        for task in TASKS:
            entry = tasks.get(task, tasks.get("ALL"))
            if entry is None:
                continue
            if isinstance(entry, str):
                entry = (entry,)
            status, reason, trials = (list(entry) + ["", ""])[:3]
            rows.append([sub, task, status, reason, trials, date])

log = pd.DataFrame(rows, columns=LOG_COLUMNS)
write_report(log, meta, exclusions, missing_trials, file="processing_report.html")
print(f"Report written: {len(log['participant_id'].unique())} participants")
