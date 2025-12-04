def load_physio(path, sub):
    """Function to preprocess the files of participants."""
import os

import mne
import neurokit2 as nk
import numpy as np

path = "C:/Users/asf25/Box/FictionEroPhysio/Rebel - FictionEroPhysio/"


# Convenience functions ======================================================================
    # Find consecutives nans in 3 groups of channels (of different sampling rates)
def consecutive_nans(raw):
    start = [0, 0, 0, 0]
    other = {"AF7": [], "ECG": [], "GYRO_X": [], "EDA":[]}
    for i, ch in enumerate(["AF7", "ECG", "GYRO_X", "EDA"]):
        nans = np.where(raw.to_data_frame()[ch].isna())[0]
        if len(nans) != 0:
            consecutive = np.split(nans, np.where(np.diff(nans) != 1)[0] + 1)
            if consecutive[0][0] == 0:
                start[i] = np.max(consecutive[0]) + 1
                consecutive = consecutive[1::]
            other[ch] = consecutive
    return np.max(start), other

# RS ==========================================================================
def load_rs(path, sub):
    sub = "sub-Ana"
    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "RS" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]
    
    rs = mne.io.read_raw_brainvision(file, preload=True)
    rs = rs.set_montage("standard_1020") # filter EEG
    rs.to_data_frame().plot(subplots=True)

    # Detect onset of RS
    events = nk.events_find(
        rs.to_data_frame()["PHOTO"],  # nk.signal_plot(rs["PHOTO"][0][0])
        threshold_keep="below",
        duration_min=int(rs.info["sfreq"] * 5),
    )

    # Note: divide duration_min by sfreq and then by 60 to get duration in minutes 
    
    nk.signal_plot(rs["GYRO_X"][0][0])
    nk.signal_plot(rs["PHOTO"][0][0])
    nk.signal_plot(rs["ECG"][0][0])

    consecutive_nans(rs)

def load_HCT(path, sub):
    sub = "sub-Ana"
    # Path to EEG data
    path_eeg = path + sub + "/eeg/"
    file = [file for file in os.listdir(path_eeg) if "HCT" in file]
    file = path_eeg + [f for f in file if ".vhdr" in f][0]
    
    hct = mne.io.read_raw_brainvision(file, preload=True)
    hct = hct.set_montage("standard_1020") # filter EEG
    hct.to_data_frame().plot(subplots=True)

    # Find events and crop just before (1 second +/-) first and after last
    events = nk.events_find(
        hct.to_data_frame()["PHOTO"], 
        threshold_keep="below",
        duration_min=15000, # 7.5 seconds at 2000 Hz
    )

    nk.signal_plot(hct["PHOTO"][0][0])


    consecutive_nans(hct)