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

# Initialize data
df = pd.DataFrame()
#df = pd.read_csv("../data/rawdata_participants.csv")

# Trial-level data (fiction task only)
df_trials = pd.DataFrame()

# Heart rate time course around image onset (fiction task only)
hr_timecourse = []

qc = {
    "rs_ecg": [], "rs_rsp": [],
    "hct_ecg": [], "hct_rsp": [],
    "fic_ecg": [], "fic_rsp": [], "fic_eda": [],
}

# Loop through participants ==================================================================
subs = meta["participant_id"].values[0:30]  # change the slice to choose participants

for i, sub in enumerate(subs):
    
    if sub in ["sub-003"]: # sub-003: split recording, handle separately
        continue 
    
    # Print progress and comments
    print(sub)
    print("General Comment: " + str(meta[meta["participant_id"] == sub]["Comments_General"].values[0]))

    
    if "participant_id" in df.columns and sub in df["participant_id"].values:
        print("  - Already processed")
        continue

    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    path_beh = path + sub + "/beh/"

    # Questionnaires -------------------------------------------------------------------------
    dfsub = meta[meta["participant_id"] == sub].reset_index(drop=True)

    # Resting State ==========================================================================
    if sub not in []:  # No RS file
        # Preprocessing --------------------------------------------------------------------------
        print("  - RS - Preprocessing")
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_RS"].values[0]))


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
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_HCT"].values[0]))

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

        # Only run the duration check if interval data is available (first 19 ppts don't have that info on the interval/duration columns)
        if not hct_beh["Duration_Interval"].isna().all():
            durations = events["duration"] / srate
            assert np.max(np.abs(durations - hct_beh["Duration_Interval"].values)) < 0.50

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
            epoch["ECG_R_Peaks"].sum() for i, epoch in epochs.items()
        ]

        peaks = hct_beh["N_R_peaks"].values

        # Compute accuracy based on response and acutal r-peaks 
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
        print("   Comment:" + str(meta[meta["participant_id"] == sub]["Comments_Fiction"].values[0]))


        fic = load_fiction(path, sub)
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
        # sub-003: split recording, handle separately

        # ==================

        # Startup blip before the first trial (seen in sub-001, 002, 004, 007):
        # drop it if there is one extra event and it is shorter than an image
        if len(events["onset"]) == len(fic_beh) + 1 and events["duration"][0] < srate * 3:
            for key in events:
                events[key] = events[key][1:]

        # Missing photosensor marker: sub-005 has no marker for trial 23 (the gap
        # between events 22 and 23 equals the predicted duration of two trials)
        if sub == "sub-005":
            fic_beh = fic_beh[fic_beh["Trial_Order_Phase1"] != 23].reset_index(drop=True)

        # Make sure the number of events matches the number of trials
        assert len(events["onset"]) == len(fic_beh)

        # Cross-validate photosensor with behavioural data: each image lasts 4 s
        # (0.3 s tolerance: sub-001 has one image at 4.20 s)
        durations = events["duration"] / srate
        assert np.max(np.abs(durations - fic_beh["Trial_Duration_Phase1"].values)) < 0.3

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
        
        # check plots
        # if len(qc["fic_ecg"]) > 0:
        #     ill.image_mosaic(qc["fic_ecg"], ncols=6, nrows="auto").show()
        # if len(qc["fic_rsp"]) > 0:
        #     ill.image_mosaic(qc["fic_rsp"], ncols=6, nrows="auto").show()
        # if len(qc["fic_eda"]) > 0:
        #     ill.image_mosaic(qc["fic_eda"], ncols=6, nrows="auto").show()
        

        # Analysis --------------------------------------------------------------------------
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
        # (epochs are in event order, which matches the sorted fic_beh rows)
        features = []
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
            hr_timecourse.append(
                pd.DataFrame(
                    {
                        "participant_id": sub,
                        "Condition": fic_beh["Condition"].values[k],
                        "Time": hr.index,
                        "ECG_Rate_Change": hr.values,
                    }
                )
            )

        features = pd.DataFrame(features)
        features["participant_id"] = sub

        trials = pd.concat([fic_beh.reset_index(drop=True), features], axis=1)
        df_trials = pd.concat([df_trials, trials], axis=0)

    # Append participant to rest --------------------------------------------------------------
    dfsub["participant_id"] = sub
    df = pd.concat([df, dfsub], axis=0)

    del rs, hct, fic, epochs, epochs_ecg, epochs_eda
    plt.close("all")
    gc.collect()

    # Save data ==============================================================================

    if i in [9, 29, 59, 89, 119, len(subs) - 1]:
        print("**SAVING DATA**")
        pd.merge(meta, df, on="participant_id", suffixes=("", "_DUP")).filter(
            regex="^(?!.*_DUP)"
        ).to_csv("../data/rawdata_participants.csv", index=False)

        df_trials.to_csv("../data/rawdata_trials.csv", index=False)
        pd.concat(hr_timecourse).to_csv("../data/rawdata_hr_timecourse.csv", index=False)

        # Save figures
        for key in qc.keys():
            if len(qc[key]) > 0:
                ill.image_mosaic(qc[key], ncols=6, nrows="auto").save(
                    f"signals/{key}_{i+1}.png"
                )

        # Reset
        qc = {k: [] for k in qc}


# Heart rate time course: AI-generated vs Photograph ========================================
# Average within each participant first, then across participants
hr = pd.concat(hr_timecourse)
hr = hr.groupby(["participant_id", "Condition", "Time"])["ECG_Rate_Change"].mean()
hr = hr.groupby(["Condition", "Time"]).mean().reset_index()

fig, ax = plt.subplots()
for cond, label in {"Fiction": "AI-generated", "Reality": "Photograph"}.items():
    d = hr[hr["Condition"] == cond]
    ax.plot(d["Time"], d["ECG_Rate_Change"], label=label)
ax.axvline(0, linestyle="--", color="black")  # Image onset
ax.set_xlabel("Time from image onset (s)")
ax.set_ylabel("Heart rate change from baseline (bpm)")
ax.legend()
os.makedirs("signals", exist_ok=True)
fig.savefig("signals/fic_hr_timecourse.png", dpi=150)

print("Done!")