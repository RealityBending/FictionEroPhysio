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


# Convenience functions ======================================================================
# Download the load_physio() function
exec(
    requests.get(
        "https://raw.githubusercontent.com/RealityBending/FictionEroPhysio/main/analysis/func_load_physio.py"
    ).text
)


def qc_physio(df, info, sub, plot_ecg = [], plot_rsp = [], plot_eda = []):
    """ Quality control  (QC) of physiological data. Plots ECG, RSP, and EDA signals for visual inspection."""
    
    # ECG -------------------------------------
    
    nk.ecg_plot(df, info) # Save ECG plot for visual inspection
    fig = plt.gcf()
    
    # Remove legend and resize figure
    [ax.legend().set_visible(False) for ax in fig.axes]
    fig.set_size_inches(fig.get_size_inches()*0.4)
    
    # Add text
    img = ill.image_text(
        sub, color="black", size=30, x =-.82, y = 0.9, image=nk.fig2img(fig))
    
    #plt.close(fig)
    plot_ecg.append(img)
    
    # RSP -------------------------------------
    
    nk.rsp_plot(df, info) # Save RSP plot for visual inspection
    fig = plt.gcf()
    
    # Remove legend and resize figure
    [ax.legend().set_visible(False) for ax in fig.axes]
    fig.set_size_inches(fig.get_size_inches()*0.4)
    
    # Add text
    img = ill.image_text(
        sub, color="black", size=30, x =-.82, y = 0.9, image=nk.fig2img(fig))
    
    #plt.close(fig)
    plot_rsp.append(img)
    
    # EDA -------------------------------------
    
    nk.eda_plot(df, info) # Save EDA plot for visual inspection
    fig = plt.gcf()
    
    # Remove legend and resize figure
    [ax.legend().set_visible(False) for ax in fig.axes]
    fig.set_size_inches(fig.get_size_inches()*0.4)
    
    # Add text
    img = ill.image_text(
        sub, color="black", size=30, x =-.82, y = 0.9, image=nk.fig2img(fig))
    
    #plt.close(fig)
    plot_eda.append(img)
    
    return plot_ecg, plot_rsp, plot_eda


# Variables ========================================--

path = "C:/Users/asf25/Box/FIctionEroPhysio/Reality Bending Lab - FictionEroPhysio/"

# Get participant list
meta = pd.read_csv(path + "participants.tsv", sep="\t")

# Initialize variables
df = pd.DataFrame()
df = pd.read_csv("../data/rawdata_participants.csv")