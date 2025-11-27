import pyxdf
import numpy as np
import matplotlib.pyplot as plt


# --- Load XDF ---
filename = r"C:\Users\olive\Documents\GitHub\FictionEroPhysio\data\RS-jspsychmarkers.xdf"
streams, header = pyxdf.load_xdf(filename, synchronize_clocks=True)

# --- Identify streams ---
js_stream = None
os_stream = None

for s in streams:
    name = s["info"]["name"][0]
    if name == "jsPsychMarkers":
        js_stream = s
    elif name == "OpenSignals":
        os_stream = s

if js_stream is None:
    raise RuntimeError("jsPsychMarkers stream not found")
if os_stream is None:
    raise RuntimeError("OpenSignals stream not found")

# ============================================================
# --- Convert jsPsychMarkers to numpy ---
# ============================================================
js_data = np.array(js_stream["time_series"]).astype(str).flatten()
js_ts = np.array(js_stream["time_stamps"])

# ============================================================
# --- Convert OpenSignals to numpy ---
# ============================================================
os_data = np.array(os_stream["time_series"], dtype=float)
os_ts = np.array(os_stream["time_stamps"])

print("OpenSignals shape:", os_data.shape)


# ============================================================
# --- Detect LUX channel inside OpenSignals ---
# ============================================================
lux_channel_index = None

# Try channel labels
try:
    channels = [
        c["label"][0]
        for c in os_stream["info"]["desc"][0]["channels"][0]["channel"]
    ]
    print("Channels found:", channels)

    if "LUX0" in channels:
        lux_channel_index = channels.index("LUX0")
except:
    print("No valid channel labels in OpenSignals.")

# If labels missing → fallback: highest variance channel
if lux_channel_index is None:
    variances = os_data.var(axis=0)
    lux_channel_index = np.argmax(variances)
    print("Fallback: Using column", lux_channel_index, "as LUX")

# Extract LUX
lux = os_data[:, lux_channel_index]
lux_ts = os_ts

# Normalize for plotting
lux = (lux - lux.min()) / (lux.max() - lux.min())


# ============================================================
# --- PLOT 1: LUX + jsPsychMarkers ---
# ============================================================

plt.figure(figsize=(16, 6))

# LUX
plt.plot(lux_ts, lux, color="blue", label="LUX (OpenSignals)")

# jsPsych markers
for t, marker in zip(js_ts, js_data):
    plt.axvline(x=t, color="red", linestyle="--", alpha=0.8)
    plt.text(t, 1.05, marker, rotation=90, color="red", va="bottom")

plt.title("LUX (blue) + jsPsychMarkers (red)")
plt.xlabel("Time (s)")
plt.ylabel("Normalized LUX")
plt.legend()
plt.tight_layout()
plt.show()


# ============================================================
# --- COMPUTE TIMING DIFFERENCES ---
# ============================================================

# Find closest LUX sample for each marker
closest_indices = np.searchsorted(lux_ts, js_ts, side="left")

# Fix out-of-bounds indices
closest_indices = np.clip(closest_indices, 0, len(lux_ts)-1)

closest_lux_ts = lux_ts[closest_indices]

# Difference: LUX_time – Marker_time
time_differences = closest_lux_ts - js_ts

print("Timing differences (s):", time_differences)


# ============================================================
# --- PLOT 2: Timing difference between LUX and jsPsychMarkers ---
# ============================================================

plt.figure(figsize=(12, 6))
plt.plot(js_ts, time_differences, marker='o', linestyle='-', color='purple')

plt.title("Timing Difference: LUX_time - jsPsychMarker_time")
plt.xlabel("jsPsych Marker Timestamp (s)")
plt.ylabel("Time Difference (s)")
plt.grid(True)
plt.tight_layout()
plt.show()