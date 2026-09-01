import os

import matplotlib.pyplot as plt
import mne
import neurokit2 as nk
import numpy as np

path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/"


# Convenience functions ======================================================================
# Find consecutive nans in each group of channels (devices stream independently,
# so one representative channel per device is enough)
def consecutive_nans(raw):
    """Find NaN gaps: AF7 represents the Muse, ECG represents the BITalino."""
    start = [0, 0]
    other = {"AF7": [], "ECG": []}
    df = raw.to_data_frame()
    for i, ch in enumerate(["AF7", "ECG"]):
        nans = np.where(df[ch].isna())[0]
        if len(nans) != 0:
            consecutive = np.split(nans, np.where(np.diff(nans) != 1)[0] + 1)
            if consecutive[0][0] == 0:
                start[i] = np.max(consecutive[0]) + 1
                consecutive = consecutive[1::]
            other[ch] = consecutive
    return np.max(start), other


# RS =============================================================

def load_rs(path, sub):
    """Load resting state and crop to the 8-minute rest period."""

    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "RS" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]

    
    rs = mne.io.read_raw_brainvision(file, preload=True)
    rs = rs.set_channel_types({"ECG": "ecg","RSP": "resp"})
    rs = rs.set_montage("standard_1020")
    # rs.to_data_frame().plot(subplots=True)
    sfreq = rs.info["sfreq"]

    # Detect onset of RS (5 s floor)
    events = nk.events_find(
            rs["PHOTO"][0][0],  
            threshold_keep="below",
            duration_min=int(rs.info["sfreq"] * 5),
        )


    #if len(events["onset"]) == 0:
    # raise ValueError(f"{sub}: no PHOTO event detected in RS. Plot PHOTO to check.")

    # Crop 
    rs = nk.mne_crop(
            rs, smin=events["onset"][0], smax=events["onset"][0] + events["duration"][0]
        )
    
    
    return rs


# HCT ================================================

def load_hct(path, sub):
    """Load HCT and crop from the first to the last counting interval."""

    # Open HCT file
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "HCT" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]
    
    
    hct = mne.io.read_raw_brainvision(file, preload=True, verbose=False)
    hct = hct.set_channel_types({"ECG": "ecg","RSP": "resp"})
    hct = hct.set_montage("standard_1020")
    # hct.to_data_frame().plot(subplots=True)
    sfreq = hct.info["sfreq"]


    # Find events and crop just before (1 second +/-) first and after last
    events = nk.events_find(
        hct["PHOTO"][0][0], 
        threshold_keep="below", 
        duration_min= int(sfreq * 10)
        )
    # nk.signal_plot(hct["PHOTO"][0][0])
    start_end = [events["onset"][0], events["onset"][-1] + events["duration"][-1]]
    hct = nk.mne_crop(hct, smin=start_end[0] - 2000, smax=start_end[1] + 2000)
    
    return hct


# TAP ================================================


def load_tap(path, sub):
    """Load TAP and crop to the task period.

    The photosensor marks two very different things:
    clock trials go dark from trial start until the spacebar is pressed (roughly
    0.5-6 s), while rhythmic tapping trials go dark for 60 ms only. No single
    duration_min catches 60 ms events without also catching sensor noise, so the
    photosensor is used HERE ONLY to find the task boundaries for cropping.
    Individual tapping events should come from task-TAP_beh.tsv, which already
    has every reaction time.

    Plot PHOTO before trusting this: 60 ms is 3-4 frames at 60 Hz, so those
    markers may be weak or intermittent.
    """

    # Open TAP file
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "TAP" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]
    
    
    tap = mne.io.read_raw_brainvision(file, preload=True, verbose=False)
    tap = tap.set_channel_types({"ECG": "ecg","RSP": "resp"})
    tap = tap.set_montage("standard_1020")
    # tap.to_data_frame().plot(subplots=True)
    sfreq = tap.info["sfreq"]

    # Find events with a very low floor, for cropping purposes only
    events = nk.events_find(
        tap["PHOTO"][0][0],
        threshold_keep="below",
        duration_min=int(sfreq * 0.05),
    )

    start_end = [events["onset"][0], events["onset"][-1] + events["duration"][-1]]
    tap = nk.mne_crop(tap, smin=start_end[0] - 2000, smax=start_end[1] + 2000)
    
    return tap


# Fiction ================================================


def load_fiction(path, sub, pad_start=10, pad_end=20):
    """Load the fiction task and crop to the task period.

    Images are shown for 4 s in phase 1 and 1 s in phase 2, so a 0.5 s floor
    catches both while rejecting flicker. The two phases separate cleanly by
    duration, which gives a free check against task-FIC_beh.tsv.
    """

    # Open Fiction file
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "FIC" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]
        
    
    fic = mne.io.read_raw_brainvision(file, preload=True, verbose=False)
    fic = fic.set_channel_types({"ECG": "ecg","RSP": "resp"})
    fic = fic.set_montage("standard_1020")
    # fic.to_data_frame().plot(subplots=True)
    sfreq = fic.info["sfreq"]
    

    # Find events, keeping anything over 0.5 s (catches 4 s and 1 s images)
    events = nk.events_find(
        fic["PHOTO"][0][0],
        threshold_keep="below",
        duration_min=int(sfreq * 0.5),
    )

    start_end = [events["onset"][0], events["onset"][-1] + events["duration"][-1]]
    fic = nk.mne_crop(fic, smin=start_end[0] - 2000, smax=start_end[1] + 2000)
       
    return fic
   
    