import gc
import os

import matplotlib.pyplot as plt
import mne
import neurokit2 as nk
import numpy as np
import pandas as pd
import PIL.Image
import pyllusion as ill
import scipy.stats

# Loading functions (run this script from the analysis/ folder)
from func_load_physio import load_fiction, load_hct, load_rs

mne.set_log_level(verbose="WARNING")


# Convenience functions ======================================================================
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
    img = ill.image_text(sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig))
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
        img = ill.image_text(sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig))
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
        img = ill.image_text(sub, color="black", size=30, x=-0.82, y=0.90, image=nk.fig2img(fig))
        plot_eda.append(img)
        plt.close(fig)

    return plot_ecg, plot_rsp, plot_eda


# QC images: each participant's plots are saved straight away. At the end they are combined into one image per signal with every participant
qc_keys = ["rs_ecg", "rs_rsp", "hct_ecg", "hct_rsp", "fic_ecg", "fic_rsp", "fic_eda"]
def save_qc(images, sub):
    """Save this participant's QC images."""
    for key, imgs in images.items():
        if imgs:  # skips None and empty lists
            os.makedirs(f"signals/participants/{key}", exist_ok=True)
            imgs[-1].save(f"signals/participants/{key}/{sub}.png")

def make_qc_mosaics():
    """Combine every participant's saved QC image into one image per signal."""
    for key in qc_keys:
        folder = f"signals/participants/{key}"
        if not os.path.isdir(folder):
            continue
        imgs = []
        for f in sorted(os.listdir(folder)):
            if f.endswith(".png"):
                with PIL.Image.open(f"{folder}/{f}") as im:
                    imgs.append(im.copy())
        if len(imgs) > 0:
            ill.image_mosaic(imgs, ncols=6, nrows="auto").save(f"signals/{key}_all.png")
        del imgs
        gc.collect()


# Save each participant's data
def save_data():
    """Save everything processed so far (overwrites the files each time)."""
    df.to_csv("../data/rawdata_participants.csv", index=False)
    df_trials.to_csv("../data/rawdata_trials.csv", index=False)
    if len(hr_timecourse) > 0:
        pd.concat(hr_timecourse).to_csv("../data/rawdata_hr_timecourse.csv", index=False)


# Variables ==================================================================================
# Change the path to your local data folder.
path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/"

# Get participant list
meta = pd.read_csv(path + "participants.tsv", sep="\t")

# Initialize data ============================================================================
# resume = False starts from scratch (delete signals/participants/ first, so old QC images
# are not mixed in); True carries on from the saved files, e.g. after a crash
# resume = False

# if resume:
#     df = pd.read_csv("../data/rawdata_participants.csv")  # one row per participant
#     df_trials = pd.read_csv("../data/rawdata_trials.csv")  # one row per image (fiction)
#     hr_timecourse = []  # heart rate time course around image onset (fiction)
#     if os.path.exists("../data/rawdata_hr_timecourse.csv"):
#         hr_timecourse = [pd.read_csv("../data/rawdata_hr_timecourse.csv")]
# else:
#     df = pd.DataFrame()  # one row per participant
#     df_trials = pd.DataFrame()  # one row per image (fiction)
#     hr_timecourse = []  # heart rate time course around image onset (fiction)


# Loop through participants ==================================================================
for i, sub in enumerate(meta["participant_id"]).values[0:5]:
    # Print progress and comments
    print(sub)
    print("General Comment: " + str(meta[meta["participant_id"] == sub]["Comments_General"].values[0]))

    if "participant_id" in df.columns and sub in df["participant_id"].values:
        print("  - Already processed")
        continue

    # Path to EEG and behavioural data
    path_eeg = path + sub + "/eeg/"
    path_beh = path + sub + "/beh/"

    # Questionnaires -------------------------------------------------------------------------
    dfsub = meta[meta["participant_id"] == sub].reset_index(drop=True)

    # ___RESTING STATE (RS)___________________________________________________________________
    if sub not in []:  # No RS file
        # Preprocessing ----------------------------------------------------------------------
        print("  - RS - Preprocessing")
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_RS"].values[0]))

        # Load data
        rs = load_rs(path, sub)
        rs = rs.pick(["ECG", "RSP", "PHOTO"])  # drop unused channels (EEG etc.) to save memory 
        srate = rs.info["sfreq"]

        # Process signals
        rs, info = nk.bio_process(
            ecg=rs["ECG"][0][0],
            rsp=rs["RSP"][0][0],
            sampling_rate=srate,
        )

        # QC
        img_ecg, img_rsp, _ = qc_physio(rs, info, sub, plot_ecg=[], plot_rsp=[], plot_eda=None)
        save_qc({"rs_ecg": img_ecg, "rs_rsp": img_rsp}, sub)

        # Heart Rate Variability (HRV_RS) ----------------------------------------------------
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

    # ___HEARTBEAT COUNTING TASK (HCT)________________________________________________________
    if sub not in []:  # No photosensor
        # Preprocessing ----------------------------------------------------------------------
        print("  - HCT - Preprocessing")
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_HCT"].values[0]))

        # Load behavioral data
        file = [file for file in os.listdir(path_beh) if "HCT" in file]
        file = path_beh + [f for f in file if ".tsv" in f][0]
        hct_beh = pd.read_csv(file, sep="\t")

        # Load data
        hct = load_hct(path, sub)
        hct = hct.pick(["ECG", "RSP", "PHOTO"])  # drop unused channels (EEG etc.) to save memory
        srate = hct.info["sfreq"]

        # Find events (again as data was cropped using the photosensor)
        # and make sure there are 6 counting intervals
        events = nk.events_find(hct["PHOTO"][0][0], threshold_keep="below", duration_min=int(srate * 10))
        assert len(events["onset"]) == 6, f"Photosensor shows {len(events['onset'])} intervals, expected 6"

        # Process signals
        hct, info = nk.bio_process(
            ecg=hct["ECG"][0][0],
            rsp=hct["RSP"][0][0],
            sampling_rate=srate,
            keep=pd.DataFrame({"PHOTO": hct["PHOTO"][0][0]}),
        )

        # QC
        img_ecg, img_rsp, _ = qc_physio(hct, info, sub, plot_ecg=[], plot_rsp=[], plot_eda=None)
        save_qc({"hct_ecg": img_ecg, "hct_rsp": img_rsp}, sub)

        # Analysis ---------------------------------------------------------------------------
        # Make epochs, i.e., cut the continuous signals into the 6 counting intervals
        epochs = nk.epochs_create(
            hct,
            events,
            sampling_rate=srate,
            epochs_start=0,
            epochs_end="from_events",
        )

        # Count R peaks in each interval and compute accuracy (a count of 0 is a real answer)
        hct_beh["N_R_peaks"] = [epoch["ECG_R_Peaks"].sum() for j, epoch in epochs.items()]
        peaks = hct_beh["N_R_peaks"].values
        hct_beh["HCT_Accuracy"] = 1 - (np.abs(hct_beh["HCT_count"] - peaks) / peaks)

        # Missing counts (NaN) are left out of the awareness correlation
        valid = hct_beh["HCT_count"].notna()

        # Compute interoception scores (Garfinkel et al., 2015) ------------------------------
        dfsub["HCT_Accuracy"] = np.nanmean(hct_beh["HCT_Accuracy"])
        dfsub["HCT_Sensibility"] = np.nanmean(hct_beh["HCT_confidence"])
        dfsub["HCT_Awareness"] = scipy.stats.spearmanr(
            hct_beh["HCT_confidence"][valid], hct_beh["HCT_Accuracy"][valid]
        ).statistic

        # HRV_HCT (time-domain only) ---------------------------------------------------------
        # Intervals (20-45 s) are too short for frequency-domain and nonlinear HRV measures
        hrv = pd.concat(
            [nk.hrv_time(e["ECG_R_Peaks"].values.nonzero()[0], sampling_rate=srate) for e in epochs.values()]
        )
        hrv = hrv[["HRV_" + s for s in ["MeanNN", "SDNN", "RMSSD"]]].mean(axis=0)
        hrv.index = [s + "_HCT" for s in hrv.index]
        dfsub = pd.concat([dfsub, pd.DataFrame(hrv).T], axis=1)

    # ___FICTION (FIC)________________________________________________________________________
    # Trial-level rather than participant-level: one row per image
    if sub not in []:
        # Preprocessing ----------------------------------------------------------------------
        print("  - FIC - Preprocessing")
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_Fiction"].values[0]))

        # Load behavioral data
        file = [file for file in os.listdir(path_beh) if "FIC" in file]
        file = path_beh + [f for f in file if ".tsv" in f][0]
        fic_beh = pd.read_csv(file, sep="\t")
        # Order rows as presented in phase 1, so they line up with the events
        fic_beh = fic_beh.sort_values("Trial_Order_Phase1").reset_index(drop=True)

        # Load data
        fic = load_fiction(path, sub)
        fic = fic.pick(["ECG", "RSP", "EDA", "PHOTO"])  # drop unused channels (EEG etc.) to save memory
        srate = fic.info["sfreq"]

        # Find events (again as data was cropped); only phase 1 is recorded.
        # Minimum duration = 2 s: images last 4 s, the startup blip is shorter
        events = nk.events_find(fic["PHOTO"][0][0], threshold_keep="below", duration_min=int(srate * 2))

        # Make sure the number of events matches the number of trials in the behavioral data
        print(f"   - {len(events['onset'])} events found, {len(fic_beh)} trials in behavioral data")
        assert len(events["onset"]) == len(fic_beh), "Number of events and trials differ"

        # Process signals
        fic, info = nk.bio_process(
            ecg=fic["ECG"][0][0],
            rsp=fic["RSP"][0][0],
            eda=fic["EDA"][0][0],
            sampling_rate=srate,
            keep=pd.DataFrame({"PHOTO": fic["PHOTO"][0][0]}),
        )

        # QC
        img_ecg, img_rsp, img_eda = qc_physio(fic, info, sub, plot_ecg=[], plot_rsp=[], plot_eda=[])
        save_qc({"fic_ecg": img_ecg, "fic_rsp": img_rsp, "fic_eda": img_eda}, sub)

        # Analysis ---------------------------------------------------------------------------
        # ECG: -2 to 5 s, covers the 4 s image plus 1 s after offset
        epochs_ecg = nk.epochs_create(
            fic,
            events,
            sampling_rate=srate,
            epochs_start=-2,
            epochs_end=5,
        )
        # EDA (and RSP): -2 to 8 s, slower signals, so the skin conductance response
        # has time to peak after the 4 s image
        epochs_eda = nk.epochs_create(
            fic,
            events,
            sampling_rate=srate,
            epochs_start=-2,
            epochs_end=8,
        )

        # Extract one row of features per trial, corrected for the value at image onset
        # (epochs are in event order, which matches the sorted fic_beh rows)
        features = []
        hr_sub = []  # heart rate time course of each trial
        for k, (epoch_ecg, epoch_eda) in enumerate(zip(epochs_ecg.values(), epochs_eda.values())):
            # Baseline = the value at image onset (the sample closest to 0 s)
            onset_ecg = epoch_ecg.iloc[np.argmin(np.abs(epoch_ecg.index))]
            onset_eda = epoch_eda.iloc[np.argmin(np.abs(epoch_eda.index))]
            resp_ecg = epoch_ecg[epoch_ecg.index >= 0]
            resp_eda = epoch_eda[epoch_eda.index >= 0]
            features.append(
                {
                    "ECG_Rate_Baseline": onset_ecg["ECG_Rate"],
                    "ECG_Rate_Mean": resp_ecg["ECG_Rate"].mean(),
                    "ECG_Rate_Min": resp_ecg["ECG_Rate"].min(),
                    "ECG_Rate_Change": resp_ecg["ECG_Rate"].mean() - onset_ecg["ECG_Rate"],
                    "RSP_Rate_Change": resp_eda["RSP_Rate"].mean() - onset_eda["RSP_Rate"],
                    "RSP_Amplitude_Mean": resp_eda["RSP_Amplitude"].mean(),
                    "EDA_Tonic_Baseline": onset_eda["EDA_Tonic"],
                    "EDA_Phasic_Max": resp_eda["EDA_Phasic"].max() - onset_eda["EDA_Phasic"],
                    "EDA_Phasic_Mean": resp_eda["EDA_Phasic"].mean() - onset_eda["EDA_Phasic"],
                }
            )

            # Heart rate time course (change from the value at image onset), in 0.1 s bins
            hr = epoch_ecg["ECG_Rate"] - onset_ecg["ECG_Rate"]
            hr = hr.groupby((hr.index * 10).round() / 10).mean()
            hr_sub.append(
                pd.DataFrame(
                    {
                        "participant_id": sub,
                        "Condition": fic_beh["Condition"].values[k],
                        "Time": hr.index,
                        "ECG_Rate_Change": hr.values,
                    }
                )
            )

        # One row of physiological features per trial
        features = pd.DataFrame(features)

        # Add this participant's trials to the main trial-level dataframe
        trials = fic_beh.join(features)
        trials["participant_id"] = sub
        df_trials = pd.concat([df_trials, trials], axis=0)

        # Add this participant's heart rate time course
        hr_timecourse += hr_sub

    # Add participant-level data (questionnaires, RS, HCT) to the main dataframe ------------
    dfsub["participant_id"] = sub
    df = pd.concat([df, dfsub], axis=0)

    # Save everything processed so far (overwrites the files each time)
    save_data()

    # Free memory before the next participant
    for name in ["rs", "hct", "fic", "epochs", "epochs_ecg", "epochs_eda"]:
        globals().pop(name, None)
    plt.close("all")
    gc.collect()


# QC: one image per signal with every participant saved so far ==============================
make_qc_mosaics()


# Heart rate time course: AI-generated vs Photograph =========================================
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
    ax.set_ylabel("Heart rate change from image onset (bpm)")
    ax.set_title(f"N = {n_participants} participants")
    ax.legend()
    os.makedirs("signals", exist_ok=True)
    fig.savefig("signals/fic_hr_timecourse.png", dpi=150)

print("Done!")
