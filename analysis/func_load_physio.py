# def load_physio(path, sub):
# """Function to preprocess the files of participants."""
import os

import mne
import neurokit2 as nk
import numpy as np

sub = "sub-001"

path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/" + sub 



# Convenience functions ======================================================================
# Find consecutives nans in 3 groups of channels (of different sampling rates)
def consecutive_nans(raw):
    start = [0, 0, 0]
    other = {"AF7": [], "ECG": [], "PPG_Muse": []}
    for i, ch in enumerate(["AF7", "ECG", "PPG_Muse"]):
        nans = np.where(raw.to_data_frame()[ch].isna())[0]
    if len(nans) != 0:
        consecutive = np.split(nans, np.where(np.diff(nans) != 1)[0] + 1)
        if consecutive[0][0] == 0:
            start[i] = np.max(consecutive[0]) + 1
            consecutive = consecutive[1::]
        other[ch] = consecutive
        
    return np.max(start), other

# RS =============================================================

def load_rs(path, sub):

    # Path to EEG data
    path_eeg = path + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "RS" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]

    rs = mne.io.read_raw_brainvision(file, preload=True)
    rs = rs.set_channel_types({"ECG": "ecg","RSP": "resp"})
    rs = rs.set_montage("standard_1020")
    # rs.to_data_frame().plot(subplots=True)

    df_rs = rs.to_data_frame(time_format=None)   # 'time' column in seconds

    df_rs.plot(x="time", y=["ECG", "RSP", "EDA", "PHOTO", "AF7", "AF8", "TP9", "TP10", "GYRO"],
        subplots=True, figsize=(14, 8), sharex=True)
    
    # Detect onset of RS
    events = nk.events_find(
        rs.to_data_frame()["PHOTO"],  # nk.signal_plot(rs["PHOTO"][0][0])
        threshold_keep="below",
        duration_min=int(rs.info["sfreq"] * 5),
    )
    
    rs = nk.mne_crop(rs, smin=events["onset"][0], smax=events["onset"][0] + events["duration"][0])


# HTC ================================================

def load_hct(path, sub):
        # Open HCT file
        path_eeg = path + sub + "/eeg/"
        file = [file for file in os.listdir(path_eeg) if "HCT" in file]
        file = path_eeg + [f for f in file if ".vhdr" in f][0]
       
        hct = mne.io.read_raw_brainvision(file, preload=True, verbose=False)
        # Filter EEG
        hct = hct.set_channel_types({"ECG": "ecg","RSP": "resp"})
        hct = hct.set_montage("standard_1020")
        
    
        #Find events and crop just before (1 second +/-) first and after last
        events = nk.events_find(
            hct["PHOTO"][0][0], threshold_keep="below", duration_min=15000
        )
        
        # Get new start and end of the recording
        start_end = [events["onset"][0], events["onset"][-1] + events["duration"][-1]]