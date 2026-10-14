import html

import numpy as np
import pandas as pd

# Tasks in the report: code -> (title, session comment column in participants.tsv)
TASKS = {
    "RS": ("Resting state", "Comments_RS"),
    "HCT": ("Heartbeat Counting Task", "Comments_HCT"),
    "FIC": ("Fiction task (Phase 1)", "Comments_Fiction"),
}

STATUS_COLOURS = {
    "Processed": "#d9f2e3",
    "Excluded": "#fff1c2",
    "Failed": "#f9d6d5",
    "Not run": "#ececec",
}

LOG_COLUMNS = ["participant_id", "task", "status", "reason", "trials", "last_run"]


# Processing log ===============================================================================
def load_log(file, df=None, df_trials=None):
    """Load the processing log, or start one from data saved before the log existed."""
    try:
        return pd.read_csv(file, dtype=str).fillna("")
    except FileNotFoundError:
        pass

    rows = []
    if df is not None and "participant_id" in df.columns:
        fic_subs = set()
        if df_trials is not None and "participant_id" in df_trials.columns:
            fic_subs = set(df_trials["participant_id"])
        for sub, row in df.set_index("participant_id").iterrows():
            done = {
                "RS": pd.notna(row.get("HRV_RMSSD_RS", np.nan)),
                "HCT": pd.notna(row.get("HCT_Accuracy", np.nan)),
                "FIC": sub in fic_subs,
            }
            for task, ok in done.items():
                if ok:
                    rows.append([sub, task, "Processed", "Processed before the log existed", "", ""])
    return pd.DataFrame(rows, columns=LOG_COLUMNS)


def log_task(log, sub, task, status, reason="", trials=""):
    """Record what happened to one task for one participant (replaces any earlier entry)."""
    log = log[~((log["participant_id"] == sub) & (log["task"] == task))]
    new = pd.DataFrame(
        [[sub, task, status, reason, trials, pd.Timestamp.now().strftime("%Y-%m-%d %H:%M")]],
        columns=LOG_COLUMNS,
    )
    return pd.concat([log, new], ignore_index=True)


# HTML report ==================================================================================
def _cell(text):
    text = "" if text is None or (isinstance(text, float) and np.isnan(text)) else str(text)
    return html.escape(text)


def write_report(log, meta, exclusions, missing_trials, file="processing_report.html"):
    """Write an HTML summary: one table per task, plus trial-level exclusions."""
    subs = list(meta["participant_id"])
    now = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M")

    # Status of every participant x task, including planned exclusions not reached yet
    status = {}
    for sub in subs:
        excl = exclusions.get(sub, {})
        for task in TASKS:
            entry = log[(log["participant_id"] == sub) & (log["task"] == task)]
            if len(entry) > 0:
                e = entry.iloc[-1]
                status[(sub, task)] = (e["status"], e["reason"], e["trials"], e["last_run"])
            elif "ALL" in excl or task in excl:
                status[(sub, task)] = ("Excluded", excl.get(task, excl.get("ALL", "")), "", "")
            else:
                status[(sub, task)] = ("Not run", "", "", "")

    # Summary ---------------------------------------------------------------------------------
    summary = '<table><tr><th>Task</th>' + "".join(
        f'<th style="background:{c}">{s}</th>' for s, c in STATUS_COLOURS.items()
    ) + "</tr>"
    for task, (title, _) in TASKS.items():
        counts = pd.Series([status[(s, task)][0] for s in subs]).value_counts()
        summary += f"<tr><td>{title}</td>" + "".join(
            f"<td>{counts.get(s, 0)}</td>" for s in STATUS_COLOURS
        ) + "</tr>"
    summary += "</table>"

    # Trial-level exclusions (shown in the fiction tab) ---------------------------------------------
    trial_rows = "".join(
        f"<tr><td>{_cell(sub)}</td><td>Fiction</td><td>{_cell(trial)}</td><td>{_cell(reason)}</td></tr>"
        for sub, trials in missing_trials.items()
        for trial, reason in trials.items()
    )
    trial_table = (
        "<h3>Trial-level exclusions</h3>"
        "<p>These trials keep their behavioural data but have NA for every physiological feature.</p>"
        "<table><tr><th>Participant</th><th>Task</th><th>Trial (Phase 1 order)</th><th>Reason</th></tr>"
        + (trial_rows or '<tr><td colspan="4">None</td></tr>')
        + "</table>"
    )

    # One tab per task ------------------------------------------------------------------------
    buttons = ""
    panels = ""
    for t, (task, (title, comment_col)) in enumerate(TASKS.items()):
        trials_col = task == "FIC"
        rows = ""
        for sub in subs:
            st, reason, trials, last_run = status[(sub, task)]
            comment = meta.loc[meta["participant_id"] == sub, comment_col].values
            comment = comment[0] if len(comment) > 0 else ""
            rows += (
                f'<tr><td class="sub">{_cell(sub)}</td>'
                f'<td style="background:{STATUS_COLOURS.get(st, "#fff")}"><b>{_cell(st)}</b></td>'
                f"<td>{_cell(reason)}</td>"
                + (f"<td>{_cell(trials)}</td>" if trials_col else "")
                + f'<td class="time">{_cell(last_run)}</td>'
                f'<td class="comment">{_cell(comment)}</td></tr>'
            )
        # Tab button
        active = " active" if t == 0 else ""
        buttons += f'<button class="tab{active}" data-tab="{task}">{title}</button>'

        panels += (
            f'<div class="panel{active}" id="{task}"><table><tr><th>Participant</th><th>Status</th>'
            "<th>Reason / notes</th>"
            + ("<th>Trials with physiology</th>" if trials_col else "")
            + "<th>Last run</th><th>Session comment</th></tr>"
            + rows
            + "</table>"
            + (trial_table if task == "FIC" else "")
            + "</div>"
        )

    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Physio Processing Report</title>
<style>
  body {{ font-family: Segoe UI, Helvetica, Arial, sans-serif; margin: 24px; color: #222; background: #fff; }}
  h1 {{ margin-bottom: 4px; }}
  h2 {{ margin-top: 32px; border-bottom: 2px solid #6a596a; padding-bottom: 4px; }}
  table {{ border-collapse: collapse; font-size: 14px; }}
  th, td {{ border: 1px solid #ccc; padding: 4px 8px; text-align: left; vertical-align: top; }}
  th {{ background: #f3f0f3; }}
  td.sub {{ white-space: nowrap; font-weight: 600; }}
  td.time {{ white-space: nowrap; color: #666; }}
  td.comment {{ color: #555; max-width: 520px; }}
  .meta {{ color: #666; }}
  .tabs {{ display: flex; gap: 4px; margin-top: 28px; border-bottom: 2px solid #6a596a; flex-wrap: wrap; }}
  .tab {{ font: inherit; font-size: 15px; padding: 8px 16px; border: 1px solid #ccc; border-bottom: none;
          border-radius: 8px 8px 0 0; background: #f3f0f3; color: #444; cursor: pointer; }}
  .tab.active {{ background: #6a596a; color: #fff; border-color: #6a596a; }}
  .panel {{ display: none; padding-top: 16px; }}
  .panel.active {{ display: block; }}
  h3 {{ margin-top: 28px; }}
</style></head><body>
<h1>Physio processing report</h1>
<p class="meta">Updated {now} by 1_physio.py. Statuses: <b>Processed</b> ran without errors;
<b>Excluded</b> skipped on purpose (see reason); <b>Failed</b> stopped with an error (see reason);
<b>Not run</b> not processed yet.</p>
<h2>Summary</h2>{summary}
<div class="tabs">{buttons}</div>
{panels}
<script>
  // Switch tabs, and remember the last one opened (if the browser allows it)
  function show(task) {{
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === task));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === task));
    try {{ localStorage.setItem("physioReportTab", task); }} catch (e) {{}}
  }}
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => show(b.dataset.tab)));
  try {{
    const last = localStorage.getItem("physioReportTab");
    if (last && document.getElementById(last)) show(last);
  }} catch (e) {{}}
</script>
</body></html>"""

    with open(file, "w", encoding="utf-8") as f:
        f.write(page)
