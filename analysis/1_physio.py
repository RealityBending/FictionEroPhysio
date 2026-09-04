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
    fig.set_size_inches(fig.get_size_inches() * 0.7)

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
        fig.set_size_inches(fig.get_size_inches() * 0.7)

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
        fig.set_size_inches(fig.get_size_inches() * 0.7)

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

# Initialize data
df = pd.DataFrame()
#df = pd.read_csv("../data/rawdata_participants.csv")

# Trial-level data (fiction task only)
df_trials = pd.DataFrame()

qc = {
    "rs_ecg": [], "rs_rsp": [],
    "hct_ecg": [], "hct_rsp": [],
    "fic_ecg": [], "fic_rsp": [], "fic_eda": [],
}

# Loop through participants ==================================================================
for i, sub in enumerate(meta["participant_id"].values):

    # Print progress and comments
    print(sub)
    print("  * " + str(meta[meta["participant_id"] == sub]["Comments_General_y"].values[0]))

    if "participant_id" in df.columns and sub in df["participant_id"].values:
        print("  - Already processed")
        continue

    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    path_beh = path + sub + "/beh/"

    # Questionnaires -------------------------------------------------------------------------
    file = [file for file in os.listdir(path_beh) if "Questionnaires" in file]
    file = path_beh + [f for f in file if ".tsv" in f][0]
    dfsub = pd.read_csv(file, sep="\t")

    # Resting State ==========================================================================
    if sub not in []:  # No RS file
        # Preprocessing --------------------------------------------------------------------------
        print("  - RS - Preprocessing")

        rs = load_rs(path, sub)  # Function loaded from script at URL
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

        # Hear Rate Variability (HRV) -------------------------------------------------------------
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

    # Heartbeat Counting Task (HCT) ===========================================================
    if sub not in []:  # No photosensor
        # Preprocessing --------------------------------------------------------------------------
        print("  - HCT - Preprocessing")

        hct = load_hct(path, sub)
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
        assert len(events["onset"]) == 6

        # Make sure they are of expected duration
        durations = events["duration"] / srate
        assert np.max(np.abs(durations - hct_beh["interval"].values)) < 0.50

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

        # Analysis --------------------------------------------------------------------------
        # Make epochs
        epochs = nk.epochs_create(
            hct,
            events,
            sampling_rate=srate,
            epochs_start=0,
            epochs_end="from_events",
        )

        # Count R peaks in each epoch
        hct_beh["N_R_peaks"] = [
            epoch["ECG_R_Peaks"].sum() for i, epoch in epochs.items()
        ]

        peaks = hct_beh["N_R_peaks"].values

        # Compute accuracy
        hct_beh["HCT_Accuracy"] = 1 - ((np.abs(hct_beh["HCT_count"] - peaks)) / peaks)

        # Replace zeros with nans
        if 0 in hct_beh["HCT_count"].values:
            hct_beh["HCT_count"] = hct_beh["HCT_count"].replace(0, np.nan)

        valid = hct_beh["HCT_count"].notna()

        # Compute interoception scores (Garfinkel et al., 2015) -----------------------------------
        dfsub["HCT_Accuracy"] = np.nanmean(hct_beh["HCT_Accuracy"])
        dfsub["HCT_Sensibility"] = np.nanmean(hct_beh["HCT_confidence"])
        dfsub["HCT_Awareness"] = scipy.stats.spearmanr(
            hct_beh["HCT_confidence"][valid], hct_beh["HCT_Accuracy"][valid]
        ).statistic

        # Hear Rate Variability (HRV) -------------------------------------------------------------
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

    # Fiction (FIC) ===========================================================================
    # Trial-level rather than participant-level: one row per image
    if sub not in []:
        # Preprocessing --------------------------------------------------------------------------
        print("  - FIC - Preprocessing")

        fic = load_fiction(path, sub)
        srate = fic.info["sfreq"]

        # Load behavioral data
        file = [file for file in os.listdir(path_beh) if "FIC" in file]
        file = path_beh + [f for f in file if ".tsv" in f][0]
        fic_beh = pd.read_csv(file, sep="\t")

        # Find events (again as data was cropped)
        events = nk.events_find(
            fic["PHOTO"][0][0], threshold_keep="below", duration_min=int(srate * 2)
        )

        # Make sure the number of events matches the number of trials
        assert len(events["onset"]) == len(fic_beh)

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

        # Analysis --------------------------------------------------------------------------
        # Epoch: -2 s gives a pre-stimulus baseline, +8 s runs past the 4 s image
        # so the skin conductance response has time to peak
        epochs = nk.epochs_create(
            fic,
            events,
            sampling_rate=srate,
            epochs_start=-2,
            epochs_end=8,
        )

        # Extract one row of features per trial, baseline-corrected
        features = []
        for j, epoch in epochs.items():
            base = epoch[epoch.index < 0]
            resp = epoch[(epoch.index >= 0) & (epoch.index <= 6)]
            features.append(
                {
                    "ECG_Rate_Baseline": base["ECG_Rate"].mean(),
                    "ECG_Rate_Mean": resp["ECG_Rate"].mean(),
                    "ECG_Rate_Min": resp["ECG_Rate"].min(),
                    "ECG_Rate_Change": resp["ECG_Rate"].mean() - base["ECG_Rate"].mean(),
                    "RSP_Rate_Change": resp["RSP_Rate"].mean() - base["RSP_Rate"].mean(),
                    "RSP_Amplitude_Mean": resp["RSP_Amplitude"].mean(),
                    "EDA_Tonic_Baseline": base["EDA_Tonic"].mean(),
                    "EDA_Phasic_Max": resp["EDA_Phasic"].max() - base["EDA_Phasic"].mean(),
                    "EDA_Phasic_Mean": resp["EDA_Phasic"].mean() - base["EDA_Phasic"].mean(),
                }
            )

        features = pd.DataFrame(features)
        features["participant_id"] = sub

        trials = pd.concat([fic_beh.reset_index(drop=True), features], axis=1)
        df_trials = pd.concat([df_trials, trials], axis=0)

    # Append participant to rest --------------------------------------------------------------
    dfsub["participant_id"] = sub
    df = pd.concat([df, dfsub], axis=0)

    del rs, hct, fic, epochs
    plt.close("all")
    gc.collect()

    # Save data ==============================================================================
    if i in [29, 59, 89, 119, len(meta["participant_id"].values) - 1]:
        print("**SAVING DATA**")
        pd.merge(meta, df, on="participant_id", suffixes=("", "_DUP")).filter(
            regex="^(?!.*_DUP)"
        ).to_csv("../data/rawdata_participants.csv", index=False)

        df_trials.to_csv("../data/rawdata_trials.csv", index=False)

        # Save figures
        for key in qc.keys():
            if len(qc[key]) > 0:
                ill.image_mosaic(qc[key], ncols=6, nrows="auto").save(
                    f"signals/{key}_{i+1}.png"
                )

        # Reset
        qc = {k: [] for k in qc}


print("Done!")