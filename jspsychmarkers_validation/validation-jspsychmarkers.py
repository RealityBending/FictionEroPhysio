import pyxdf
import numpy as np
import matplotlib.pyplot as plt


# --- Load XDF ---
filename = r"C:\Users\olive\Documents\GitHub\FictionEroPhysio\jspsychmarkers_validation\jspsychmarkers-bw-test.xdf"
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

import neurokit2 as nk
import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal

# ============================================================
# --- Convert jsPsychMarkers ---
# ============================================================
js_data = np.array(js_stream["time_series"]).astype(str).flatten()
js_ts = np.array(js_stream["time_stamps"])

print(f"N jsPsych markers: {len(js_ts)}")

# ============================================================
# --- Extract LUX ---
# ============================================================
os_data = np.array(os_stream["time_series"], dtype=float)
os_ts = np.array(os_stream["time_stamps"])

# Detect LUX channel (same logic as your other script)
lux_channel_index = None
try:
    channels = [
        c["label"][0]
        for c in os_stream["info"]["desc"][0]["channels"][0]["channel"]
    ]
    if "LUX0" in channels:
        lux_channel_index = channels.index("LUX0")
except:
    pass

if lux_channel_index is None:
    lux_channel_index = np.argmax(os_data.var(axis=0))
    print(f"Using high-variance channel {lux_channel_index} as LUX")

lux = os_data[:, lux_channel_index]
lux_ts = os_ts

# Normalize for event detection
lux_norm = (lux - np.min(lux)) / (np.max(lux) - np.min(lux))

# ============================================================
# --- Event extraction (same style as Muse script) ---
# ============================================================

# For LUX: transitions from bright → dark
events_lux = nk.events_find(
    lux_norm,
    threshold_keep="below",
    duration_min=5
)

print(f"N LUX events detected: {len(events_lux['onset'])}")

onsets_lux = lux_ts[events_lux["onset"]]

# ============================================================
# --- Align jsPsych markers with nearest LUX events ---
# ============================================================

js_aligned_to_lux = nk.find_closest(onsets_lux, js_ts)

# Difference (LUX – jsPsych)
diff_sec = onsets_lux - js_aligned_to_lux[:len(onsets_lux)]
diff_ms = diff_sec * 1000

print("Median difference (ms):", np.median(diff_ms))

# ============================================================
# --- Filter outliers ---
#   Keep differences within ±500 ms
# ============================================================
mask = (diff_ms >= -500) & (diff_ms <= 500)

filtered_lux_onsets = onsets_lux[mask]
filtered_diff_ms = diff_ms[mask]

print(f"Keeping {len(filtered_diff_ms)} aligned events")

# ============================================================
# --- Plot filtered differences ---
# ============================================================

plt.figure(figsize=(10, 6))
plt.plot(filtered_lux_onsets, filtered_diff_ms, marker="o", linestyle="None")
plt.axhline(0, color="black")
plt.title("Time Difference Between LUX and jsPsych Markers")
plt.xlabel("Time (s)")
plt.ylabel("Difference (ms) (LUX - jsPsych)")
plt.grid(True)
plt.show()



# ============================================================
# --- Convert jsPsych markers into numeric codes ---
# ============================================================

js_unique = np.unique(js_data)
js_mapping = {label: i for i, label in enumerate(js_unique)}

print("Marker → numeric mapping:", js_mapping)

# Convert marker strings to integers
js_numeric = np.array([js_mapping[m] for m in js_data])

# Compute differences between consecutive markers
js_diff = np.diff(js_numeric)
js_diff_ts = js_ts[1:]  # timestamps aligned with diff

# ============================================================
# --- PLOT: Difference Between jsPsych Markers ---
# ============================================================

plt.figure(figsize=(16, 6))
plt.plot(js_diff_ts, np.abs(js_diff), color="darkgreen")
plt.title("Absolute Differences Between jsPsych Marker Codes")
plt.xlabel("Time (s)")
plt.ylabel("|Δ Marker Code|")
plt.grid(True)
plt.tight_layout()
plt.show()

# ============================================================
# --- Detect jsPsych events (marker changes) ---
# ============================================================

# js_data  = array of marker labels (strings)
# js_ts    = array of timestamps for each jsPsych marker sample

# 1. Convert marker strings → numeric codes
js_unique = np.unique(js_data)
js_mapping = {label: i for i, label in enumerate(js_unique)}
js_numeric = np.array([js_mapping[m] for m in js_data])

# 2. Differences between consecutive markers
js_diff = np.diff(js_numeric)

# 3. Event indices = where marker changes
js_event_indices = np.where(js_diff != 0)[0]

# 4. Event timestamps
js_event_ts = js_ts[js_event_indices + 1]   # +1 aligns with diff timestamps

print(f"Detected {len(js_event_ts)} jsPsych events.")

# ============================================================
# --- Compute jsPsych event intervals ---
# ============================================================

if len(js_event_ts) < 2:
    raise RuntimeError("Not enough jsPsych events to compute intervals.")

# Compute intervals between consecutive jsPsych events
js_intervals = np.diff(js_event_ts)       # seconds
js_intervals_ms = js_intervals * 1000     # convert to ms

print(f"Computed {len(js_intervals)} jsPsych event intervals.")

plt.figure(figsize=(16, 5))
plt.plot(js_event_ts[1:], js_intervals_ms, marker="o", color="red")

plt.title("jsPsych Event Intervals Over Time")
plt.xlabel("Time (s)")
plt.ylabel("Interval (ms)")
plt.grid(True)
plt.tight_layout()
plt.show()



import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial import KDTree







# ============================================================
# --- DETECT jsPsych EVENTS ---
# ============================================================

# Convert marker strings → integer codes
js_unique = np.unique(js_data)
js_mapping = {label: i for i, label in enumerate(js_unique)}
js_numeric = np.array([js_mapping[m] for m in js_data])

# Differences between consecutive jsPsych markers
js_diff = np.diff(js_numeric)

# Where a marker change occurs
js_event_indices = np.where(js_diff != 0)[0]

# Event timestamps
js_event_ts = js_ts[js_event_indices + 1]

print(f"Detected {len(js_event_ts)} jsPsych events.")


# ============================================================
# --- DETECT LUX EVENTS ---
# ============================================================

# differences between consecutive LUX samples
lux_diff = np.diff(lux)
lux_diff_ts = lux_ts[1:]

# event threshold = top 10% largest changes
threshold = np.percentile(np.abs(lux_diff), 90)
lux_event_indices = np.where(np.abs(lux_diff) > threshold)[0]

lux_event_ts = lux_diff_ts[lux_event_indices]

print(f"Detected {len(lux_event_ts)} LUX events.")


# ============================================================
# --- ALIGN: nearest jsPsych event for each LUX event ---
# ============================================================

# Build fast search tree
tree = KDTree(js_event_ts.reshape(-1, 1))

# Query nearest jsPsych event for each LUX event
distances, idx = tree.query(lux_event_ts.reshape(-1, 1))

# Timing difference (in seconds)
# + value → LUX occurred AFTER jsPsych
# - value → LUX occurred BEFORE jsPsych
time_diff_sec = lux_event_ts - js_event_ts[idx]
time_diff_ms = time_diff_sec * 1000


# ============================================================
# --- PLOT: LUX vs jsPsych timing differences ---
# ============================================================

plt.figure(figsize=(16, 6))
plt.plot(lux_event_ts, time_diff_ms, marker="o", linestyle="-", color="purple")

plt.axhline(0, color="black", linewidth=1)
plt.title("Timing Difference Between LUX Events and Nearest jsPsych Events")
plt.xlabel("Time (s)")
plt.ylabel("Difference (ms)   (LUX - jsPsych)")
plt.grid(True)
plt.tight_layout()
plt.show()



# ============================================================
# --- ALIGN: nearest jsPsych event for each LUX event ---
# ============================================================

from scipy.spatial import KDTree

# Build fast search tree
tree = KDTree(js_event_ts.reshape(-1, 1))

# Query nearest jsPsych event for each LUX event
distances, idx = tree.query(lux_event_ts.reshape(-1, 1))

# ============================================================
# --- IMPORTANT: updated formula (jsPsych - LUX) ---
# ============================================================

time_diff_sec = js_event_ts[idx] - lux_event_ts
time_diff_ms = time_diff_sec * 1000


# ============================================================
# --- PLOT: Timing Difference (jsPsych - LUX) ---
# ============================================================

plt.figure(figsize=(16, 6))
plt.plot(lux_event_ts, time_diff_ms, marker="o", linestyle="-", color="purple")

plt.axhline(0, color="black", linewidth=1)
plt.title("Timing Difference: jsPsych Event - LUX Event")
plt.xlabel("Time (s)")
plt.ylabel("Difference (ms)  (jsPsych - LUX)")
plt.grid(True)
plt.tight_layout()
plt.show()
