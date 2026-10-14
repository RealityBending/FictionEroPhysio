import os

import matplotlib.pyplot as plt
import mne
import neurokit2 as nk
import numpy as np
import pandas as pd
import PIL
import pyllusion as ill
import requests
import scipy.stats
import gc

from func_report import load_log, log_task, write_report


mne.set_log_level(verbose="WARNING")

# Convenience functions ======================================================================
# Download the load_physio() functions
exec(
    requests.get(
        "https://raw.githubusercontent.com/RealityBending/FictionEroPhysio/main/analysis/func_load_physio.py"
    ).text
)

# Summary plots for ECG, RSP, and EDA 
def qc_physio(df, info, sub, plot_ecg=[], plot_rsp=[], plot_eda=[]):
    """Quality control (QC) of physiological signals."""

    # ECG ------------------------------------------------------------------------------------
    nk.ecg_plot(df, info)  # Save ECG plot
    fig = plt.gcf()

    # Remove legend and resize
    [ax.legend().set_visible(False) for ax in fig.axes]
    fig.set_size_inches(fig.get_size_inches() * 1.5)

    # Add text
    img = ill.image_text(
        sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig)
    )
    plt.close(fig)  # Do not show the plot in the console
    plot_ecg.append(img)

    # RSP ------------------------------------------------------------------------------------
    if plot_rsp is not None:
        nk.rsp_plot(df, info)  # Save RSP plot
        fig = plt.gcf()

        # Remove legend and resize
        [ax.legend().set_visible(False) for ax in fig.axes]
        fig.set_size_inches(fig.get_size_inches() * 1.5)

        # Add text
        img = ill.image_text(
            sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig)
        )
        plot_rsp.append(img)
        plt.close(fig)

    # EDA ------------------------------------------------------------------------------------
    # Only present for the fiction task
    if plot_eda is not None and "EDA_Clean" in df.columns:
        nk.eda_plot(df, info)  # Save EDA plot
        fig = plt.gcf()

        # Remove legend and resize
        [ax.legend().set_visible(False) for ax in fig.axes]
        fig.set_size_inches(fig.get_size_inches() * 1.5)

        # Add text
        img = ill.image_text(
            sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig)
        )
        plot_eda.append(img)
        plt.close(fig)

    return plot_ecg, plot_rsp, plot_eda


# Variables ==================================================================================
# Change the path to your local data folder.
path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/"

# Get participant list
meta = pd.read_csv(path + "participants.tsv", sep="\t")

# Exclusions =================================================================================
# Whole-task exclusions: participant -> {task: reason}. "ALL" skips every task.
# Tasks: "RS" (resting state), "HCT" (heartbeat counting), "FIC" (fiction phase 1)
exclusions = {
    "sub-003": {"ALL": "Split recording, handle separately"},
    "sub-012": {"FIC": "Only a few images recorded (Muse battery died, recording not resumed)"},
    "sub-014": {"FIC": "Recording split into two files at the break, not handled yet"},
}

# Trial-level exclusions (fiction): participant -> {trial (Phase 1 order): reason}
# These trials are kept, with NA for the physiological features
missing_trials = {
    "sub-005": {23: "No photosensor marker (gap between events 22 and 23 equals two trials)"},
    "sub-006": {1: "Not recorded (participant started before the recording)"},
}

# Adjustments that do not exclude data (shown as notes in the report)
notes = {
    "sub-024": {"HCT": "Interval 1 photosensor is 34.23 s vs 35 s programmed (screen appeared late); duration tolerance raised to 1 s"},
}

# Initialize data ============================================================================
# resume = True carries on from the saved files; False starts again from scratch
resume = True

if resume and os.path.exists("../data/rawdata_participants.csv"):
    df = pd.read_csv("../data/rawdata_participants.csv")
    df_trials = pd.read_csv("../data/rawdata_trials.csv")  # one row per image (fiction)
    hr_timecourse = [pd.read_csv("../data/rawdata_hr_timecourse.csv")]
else:
    df = pd.DataFrame()  # one row per participant
    df_trials = pd.DataFrame()  # one row per image (fiction)
    hr_timecourse = []  # heart rate time course around image onset (fiction)

# Processing log: what happened to each task for each participant (feeds the HTML report)
log_file = "../data/processing_log.csv"
log = load_log(log_file, df if resume else None, df_trials if resume else None)

qc = {
    "rs_ecg": [], "rs_rsp": [],
    "hct_ecg": [], "hct_rsp": [],
    "fic_ecg": [], "fic_rsp": [], "fic_eda": [],
}


def drop_sub(d, sub):
    """Remove a participant's rows (used before re-processing them)."""
    if "participant_id" in d.columns:
        return d[d["participant_id"] != sub]
    return d


def save_data(qc, label):
    """Save the data files and the QC figures, then empty the QC lists."""
    print("**SAVING DATA**")
    if "participant_id" in df.columns:
        pd.merge(meta, df, on="participant_id", suffixes=("", "_DUP")).filter(
            regex="^(?!.*_DUP)"
        ).to_csv("../data/rawdata_participants.csv", index=False)
    df_trials.to_csv("../data/rawdata_trials.csv", index=False)
    if len(hr_timecourse) > 0:
        pd.concat(hr_timecourse).to_csv("../data/rawdata_hr_timecourse.csv", index=False)

    # Save figures
    os.makedirs("signals", exist_ok=True)
    for key in qc.keys():
        if len(qc[key]) > 0:
            ill.image_mosaic(qc[key], ncols=6, nrows="auto").save(f"signals/{key}_{label}.png")
    return {k: [] for k in qc}


def update_report():
    """Save the processing log and rewrite the HTML report."""
    log.to_csv(log_file, index=False)
    write_report(log, meta, exclusions, missing_trials, file="processing_report.html")


# Loop through participants ==================================================================
subs = meta["participant_id"].values[14:20]

for i, sub in enumerate(subs):

    excl = exclusions.get(sub, {})
    note = notes.get(sub, {})

    # Whole-participant exclusions
    if "ALL" in excl:
        print(f"{sub} - excluded: {excl['ALL']}")
        for task in ["RS", "HCT", "FIC"]:
            log = log_task(log, sub, task, "Excluded", excl["ALL"])
        update_report()
        continue

    # Skip participants whose tasks are all processed or excluded already
    done = log.loc[
        (log["participant_id"] == sub) & log["status"].isin(["Processed", "Excluded"]), "task"
    ]
    if {"RS", "HCT", "FIC"} <= set(done):
        print(f"{sub} - Already processed")
        continue

    # Re-processing: remove any earlier (partial) results for this participant
    df = drop_sub(df, sub)
    df_trials = drop_sub(df_trials, sub)
    hr_timecourse = [drop_sub(h, sub) for h in hr_timecourse]

    # Print progress and comments
    print(sub)
    print("General Comment: " + str(meta[meta["participant_id"] == sub]["Comments_General"].values[0]))

    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    path_beh = path + sub + "/beh/"

    # Questionnaires -------------------------------------------------------------------------
    dfsub = meta[meta["participant_id"] == sub].reset_index(drop=True)

    # Resting State ==========================================================================
    if "RS" in excl:
        log = log_task(log, sub, "RS", "Excluded", excl["RS"])
    else:
        try:
            # Preprocessing ----------------------------------------------------------------------
            print("  - RS - Preprocessing")
            print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_RS"].values[0]))

            rs = load_rs(path, sub)
            rs = rs.pick(["ECG", "RSP", "PHOTO"])  # drop unused channels (EEG etc.) to save memory
            srate = rs.info["sfreq"]
            rs, info = nk.bio_process(
                ecg=rs["ECG"][0][0],
                rsp=rs["RSP"][0][0],
                sampling_rate=srate,
            )

            # QC
            qc["rs_ecg"], qc["rs_rsp"], _ = qc_physio(
                rs, info, sub, plot_ecg=qc["rs_ecg"], plot_rsp=qc["rs_rsp"], plot_eda=None
            )

            # Hear Rate Variability (HRV) ---------------------------------------------------------
            hrv = nk.hrv(rs["ECG_R_Peaks"].values.nonzero()[0], sampling_rate=srate)
            idx = [
                "MeanNN",
                "SDNN",
                "RMSSD",
                "SampEn",
                "HF",
                "HFD",
                "LFHF",
                "IALS",
                "Ca",
                "AI",
            ]
            hrv = hrv[["HRV_" + s for s in idx]]
            hrv.columns = [s + "_RS" for s in hrv.columns]
            dfsub = pd.concat([dfsub, hrv], axis=1)

            log = log_task(log, sub, "RS", "Processed", note.get("RS", ""))
        except Exception as e:
            print(f"  ! RS failed: {type(e).__name__}: {e}")
            log = log_task(log, sub, "RS", "Failed", f"{type(e).__name__}: {e}")

    # Heartbeat Counting Task (HCT) ===========================================================
    if "HCT" in excl:
        log = log_task(log, sub, "HCT", "Excluded", excl["HCT"])
    else:
        try:
            hct_notes = [note["HCT"]] if "HCT" in note else []

            # Preprocessing ----------------------------------------------------------------------
            print("  - HCT - Preprocessing")
            print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_HCT"].values[0]))

            hct = load_hct(path, sub)
            hct = hct.pick(["ECG", "RSP", "PHOTO"])  # drop unused channels (EEG etc.) to save memory
            srate = hct.info["sfreq"]

            # Load behavioral data
            file = [file for file in os.listdir(path_beh) if "HCT" in file]
            file = path_beh + [f for f in file if ".tsv" in f][0]
            hct_beh = pd.read_csv(file, sep="\t")

            # Find events (again as data was cropped) and epoch
            events = nk.events_find(
                hct["PHOTO"][0][0], threshold_keep="below", duration_min=int(srate * 10)
            )

            # Make sure there are 6 events
            n_events = len(events["onset"])
            assert n_events == 6, f"Photosensor shows {n_events} counting intervals, expected 6"

            # Only run the duration check if interval data is available (first 19 ppts don't have that info on the interval/duration columns)
            if not hct_beh["Duration_Interval"].isna().all():
                durations = events["duration"] / srate
                # sub-024: interval 1 photosensor is 34.23 s vs 35 s programmed (one clean
                # dark period, so the screen appeared late); the photosensor is kept
                tolerance = 1.0 if sub == "sub-024" else 0.50
                max_err = np.max(np.abs(durations - hct_beh["Duration_Interval"].values))
                assert max_err < tolerance, (
                    f"Interval length differs from the programmed length by {max_err:.2f} s "
                    f"(tolerance {tolerance} s)"
                )
            else:
                hct_notes.append("Interval lengths not saved in behavioural file; duration check skipped")

            # Process signals
            hct, info = nk.bio_process(
                ecg=hct["ECG"][0][0],
                rsp=hct["RSP"][0][0],
                sampling_rate=srate,
                keep=pd.DataFrame({"PHOTO": hct["PHOTO"][0][0]}),
            )

            # QC
            qc["hct_ecg"], qc["hct_rsp"], _ = qc_physio(
                hct, info, sub, plot_ecg=qc["hct_ecg"], plot_rsp=qc["hct_rsp"], plot_eda=None
            )

            # Analysis ---------------------------------------------------------------------------
            # Make epochs
            # i.e., cutting continuous HCT psignals into 6 seperate segments (6 dfs)
            epochs = nk.epochs_create(
                hct,
                events,
                sampling_rate=srate,
                epochs_start=0,
                epochs_end="from_events",
            )

            # Count R peaks in each epoch
            hct_beh["N_R_peaks"] = [
                epoch["ECG_R_Peaks"].sum() for j, epoch in epochs.items()
            ]

            peaks = hct_beh["N_R_peaks"].values

            # Compute accuracy based on response and acutal r-peaks
            hct_beh["HCT_Accuracy"] = 1 - ((np.abs(hct_beh["HCT_count"] - peaks)) / peaks)

            # Replace zeros with nans
            n_zero = int((hct_beh["HCT_count"] == 0).sum())
            if n_zero > 0:
                hct_beh["HCT_count"] = hct_beh["HCT_count"].replace(0, np.nan)
                hct_notes.append(f"{n_zero} interval(s) with a count of 0 (excluded from awareness)")

            valid = hct_beh["HCT_count"].notna()

            # Compute interoception scores (Garfinkel et al., 2015) ------------------------------
            dfsub["HCT_Accuracy"] = np.nanmean(hct_beh["HCT_Accuracy"])
            dfsub["HCT_Sensibility"] = np.nanmean(hct_beh["HCT_confidence"])
            dfsub["HCT_Awareness"] = scipy.stats.spearmanr(
                hct_beh["HCT_confidence"][valid], hct_beh["HCT_Accuracy"][valid]
            ).statistic

            # Hear Rate Variability (HRV) ---------------------------------------------------------
            print("  - HCT - HRV")

            hrv = pd.concat(
                [
                    nk.hrv_time(
                        e["ECG_R_Peaks"].values.nonzero()[0],
                        sampling_rate=srate,
                    )
                    for e in epochs.values()
                ]
            )
            hrv = hrv[["HRV_" + s for s in ["MeanNN", "SDNN", "RMSSD"]]].mean(axis=0)
            hrv.index = [s + "_HCT" for s in hrv.index]
            dfsub = pd.concat([dfsub, pd.DataFrame(hrv).T], axis=1)

            log = log_task(log, sub, "HCT", "Processed", "; ".join(hct_notes))
        except Exception as e:
            print(f"  ! HCT failed: {type(e).__name__}: {e}")
            log = log_task(log, sub, "HCT", "Failed", f"{type(e).__name__}: {e}")

    # Fiction (FIC) ===========================================================================
    # Trial-level rather than participant-level: one row per image
    if "FIC" in excl:
        log = log_task(log, sub, "FIC", "Excluded", excl["FIC"])
    else:
        try:
            # Preprocessing ----------------------------------------------------------------------
            print("  - FIC - Preprocessing")
            print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_Fiction"].values[0]))

            fic = load_fiction(path, sub)
            fic = fic.pick(["ECG", "RSP", "EDA", "PHOTO"])  # drop unused channels (EEG etc.) to save memory
            srate = fic.info["sfreq"]

            # Load behavioral data
            file = [file for file in os.listdir(path_beh) if "FIC" in file]
            file = path_beh + [f for f in file if ".tsv" in f][0]
            fic_beh = pd.read_csv(file, sep="\t")
            # Order rows as presented in phase 1, so they line up with the events
            fic_beh = fic_beh.sort_values("Trial_Order_Phase1").reset_index(drop=True)

            # Find events (again as data was cropped); only phase 1 is recorded
            events = nk.events_find(
                fic["PHOTO"][0][0], threshold_keep="below", duration_min=int(srate * 0.5)
            )

            # FICTION NOTES ====
            # sub-002 as a 6 minute gap between trials 7 and 8 (eda was re-fitted)
            # ==================

            # Trials with no photosensor marker (see missing_trials at the top); kept with NA
            fic_rec = fic_beh[
                ~fic_beh["Trial_Order_Phase1"].isin(list(missing_trials.get(sub, {})))
            ]  # recorded trials only, keeping their row index

            # Startup blip before the first trial (seen in sub-001, 002, 004, 007):
            # drop it if there is one extra event and it is shorter than an image (image lasts 4 seconds)
            if len(events["onset"]) == len(fic_rec) + 1 and events["duration"][0] < srate * 3:
                for key in events:
                    events[key] = events[key][1:]

            # Make sure the number of events matches the number of recorded trials
            n_events = len(events["onset"])
            assert n_events == len(fic_rec), (
                f"Photosensor shows {n_events} images but {len(fic_rec)} recorded trials expected "
                "(check for missing markers and add them to missing_trials)"
            )

            # Cross-validate photosensor with behavioural data: each image lasts 4 s
            # (0.3 s tolerance: sub-001 has one image at 4.20 s)
            durations = events["duration"] / srate
            max_err = np.max(np.abs(durations - fic_rec["Trial_Duration_Phase1"].values))
            assert max_err < 0.3, (
                f"Image duration differs from 4 s by {max_err:.2f} s (tolerance 0.3 s)"
            )

            # Process signals
            fic, info = nk.bio_process(
                ecg=fic["ECG"][0][0],
                rsp=fic["RSP"][0][0],
                eda=fic["EDA"][0][0],
                sampling_rate=srate,
                keep=pd.DataFrame({"PHOTO": fic["PHOTO"][0][0]}),
            )

            # QC
            qc["fic_ecg"], qc["fic_rsp"], qc["fic_eda"] = qc_physio(
                fic, info, sub,
                plot_ecg=qc["fic_ecg"], plot_rsp=qc["fic_rsp"], plot_eda=qc["fic_eda"]
            )

            # Analysis ---------------------------------------------------------------------------
            # Both epochs start at -2 s for a pre-stimulus baseline
            # ECG: -2 to 5 s, covers the 4 s image plus 1 s after offset
            epochs_ecg = nk.epochs_create(
                fic,
                events,
                sampling_rate=srate,
                epochs_start=-2,
                epochs_end=5,
            )
            # EDA (and RSP): -2 to 8 s, slower signals, so the skin conductance
            # response has time to peak after the 4 s image
            epochs_eda = nk.epochs_create(
                fic,
                events,
                sampling_rate=srate,
                epochs_start=-2,
                epochs_end=8,
            )

            # Extract one row of features per trial, baseline-corrected
            # (epochs are in event order, which matches the sorted fic_rec rows)
            features = []
            hr_sub = []  # added to hr_timecourse only if the whole task succeeds
            for k, (epoch_ecg, epoch_eda) in enumerate(
                zip(epochs_ecg.values(), epochs_eda.values())
            ):
                base_ecg = epoch_ecg[epoch_ecg.index < 0]
                resp_ecg = epoch_ecg[epoch_ecg.index >= 0]
                base_eda = epoch_eda[epoch_eda.index < 0]
                resp_eda = epoch_eda[epoch_eda.index >= 0]
                features.append(
                    {
                        "ECG_Rate_Baseline": base_ecg["ECG_Rate"].mean(),
                        "ECG_Rate_Mean": resp_ecg["ECG_Rate"].mean(),
                        "ECG_Rate_Min": resp_ecg["ECG_Rate"].min(),
                        "ECG_Rate_Change": resp_ecg["ECG_Rate"].mean() - base_ecg["ECG_Rate"].mean(),
                        "RSP_Rate_Change": resp_eda["RSP_Rate"].mean() - base_eda["RSP_Rate"].mean(),
                        "RSP_Amplitude_Mean": resp_eda["RSP_Amplitude"].mean(),
                        "EDA_Tonic_Baseline": base_eda["EDA_Tonic"].mean(),
                        "EDA_Phasic_Max": resp_eda["EDA_Phasic"].max() - base_eda["EDA_Phasic"].mean(),
                        "EDA_Phasic_Mean": resp_eda["EDA_Phasic"].mean() - base_eda["EDA_Phasic"].mean(),
                    }
                )

                # Heart rate time course (change from baseline), in 0.1 s bins
                hr = epoch_ecg["ECG_Rate"] - base_ecg["ECG_Rate"].mean()
                hr = hr.groupby((hr.index * 10).round() / 10).mean()
                hr_sub.append(
                    pd.DataFrame(
                        {
                            "participant_id": sub,
                            "Condition": fic_rec["Condition"].values[k],
                            "Time": hr.index,
                            "ECG_Rate_Change": hr.values,
                        }
                    )
                )

            # Match features to recorded trials by row index; trials with no
            # recording (missing_trials) get NA for every physiological feature
            features = pd.DataFrame(features, index=fic_rec.index)

            trials = fic_beh.join(features).reset_index(drop=True)
            trials["participant_id"] = sub
            df_trials = pd.concat([df_trials, trials], axis=0)
            hr_timecourse.extend(hr_sub)

            fic_notes = [note["FIC"]] if "FIC" in note else []
            if sub in missing_trials:
                fic_notes.append(
                    "Missing trial(s) " + ", ".join(str(t) for t in missing_trials[sub]) + " kept with NA"
                )
            log = log_task(
                log, sub, "FIC", "Processed", "; ".join(fic_notes), f"{len(fic_rec)}/{len(fic_beh)}"
            )
        except Exception as e:
            print(f"  ! FIC failed: {type(e).__name__}: {e}")
            log = log_task(log, sub, "FIC", "Failed", f"{type(e).__name__}: {e}")

    # Append participant to rest --------------------------------------------------------------
    dfsub["participant_id"] = sub
    df = pd.concat([df, dfsub], axis=0)

    # Free memory (some variables are missing for tasks that were skipped or failed)
    for name in ["rs", "hct", "fic", "epochs", "epochs_ecg", "epochs_eda"]:
        globals().pop(name, None)
    plt.close("all")
    gc.collect()

    # Update the processing log and the HTML report after every participant
    update_report()

    # Save data at checkpoints ================================================================
    if i in [9, 29, 59, 89, 119]:
        qc = save_data(qc, sub)

# Final save (covers the last participants after the last checkpoint)
qc = save_data(qc, subs[-1])
update_report()


# Heart rate time course: AI-generated vs Photograph ========================================
# Average within each participant first, then across participants
if len(hr_timecourse) > 0:
    hr = pd.concat(hr_timecourse)
    n_participants = hr["participant_id"].nunique()
    hr = hr.groupby(["participant_id", "Condition", "Time"])["ECG_Rate_Change"].mean()
    hr = hr.groupby(["Condition", "Time"]).mean().reset_index()

    fig, ax = plt.subplots()
    for cond, label in {"Fiction": "AI-generated", "Reality": "Photograph"}.items():
        d = hr[hr["Condition"] == cond]
        ax.plot(d["Time"], d["ECG_Rate_Change"], label=label)
    ax.axvline(0, linestyle="--", color="black")  # Image onset
    ax.set_xlabel("Time from image onset (s)")
    ax.set_ylabel("Heart rate change from baseline (bpm)")
    ax.set_title(f"N = {n_participants} participants")
    ax.legend()
    os.makedirs("signals", exist_ok=True)
    fig.savefig("signals/fic_hr_timecourse.png", dpi=150)

print("Done!")
