// -----------------------
// LSL bridge (promise-based)
// -----------------------
var lslBaseTime = null

function syncLSL() {
    return new Promise(async function (resolve, reject) {
        try {
            let offsets = []
            for (let i = 0; i < 3; i++) {
                var startPerf = performance.now()
                let resp = await fetch("http://192.168.0.18:5000/sync", { cache: "no-store" }) // change IPv4 address as appropriate
                let text = await resp.text()
                var lslTime = parseFloat(text)
                var endPerf = performance.now()
                var perfMid = (startPerf + endPerf) / 2
                offsets.push(lslTime - perfMid / 1000)
                await new Promise((r) => setTimeout(r, 100)) // Short delay between syncs
            }
            lslBaseTime = offsets.reduce((a, b) => a + b, 0) / offsets.length
            console.log("LSL sync done (averaged):", lslBaseTime)
            resolve(lslBaseTime)
        } catch (e) {
            console.error("LSL sync exception:", e)
            reject(e)
        }
    })
}

function sendMarker(value = "1") {
    // If not synced, still send marker (server will timestamp with local_clock())
    if (lslBaseTime === null) {
        console.warn("LSL not synced yet - sending without JS timestamp")
        fetch("http://192.168.0.18:5000/marker?value=" + encodeURIComponent(value)) // change IPv4 address as appropriate
            .then(function () {
                console.log("sent marker (no-ts)", value)
            })
            .catch(function (err) {
                console.error("Marker send error:", err)
            })
        return
    }

    var ts = lslBaseTime + performance.now() / 1000
    var url = "http://192.168.0.18:5000/marker?value=" + encodeURIComponent(value) + "&ts=" + encodeURIComponent(ts) // change IPv4 address as appropriate
    fetch(url)
        .then(function () {
            console.log("sent marker", value, "ts", ts)
        })
        .catch(function (err) {
            console.error("Marker send error:", err)
        })
}

// HBC duration in sec
var HCT_durations = [20, 25, 30, 35, 40, 45]

// Instructions
const HCT_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_HCT",
                        html: `
                    <div style="text-align: center;"> 
                    <h2>Heartbeat Counting Task</h2>
                    <h3><b>Instructions</b></h3>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                    <div style="flex: 2; text-align: center;">
                        <p>In the following task, you will need to count and report the number of heartbeats during several intervals.</p>
                        <p>Simply <b>relax</b> and remain seated quietly while <b style="color: #E91E63;">counting your heartbeat without physically measuring it</b>.</p>
                        <p>The interval will start with a <b>'3-2-1'</b> signal, after which you need to count your heartbeats until you hear a beep.</p>
                        <p>Press the button below when you're ready to begin.</p>
                    </div>
                    </div>
                    <audio autoplay>
                    <source src = "utils/ding.mp3" type="audio/mpeg">
                    </audio>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "HCT_instructions" },
}

// Trial Parts -----------------------------------------------------------------
// Create blank grey screen with countdown just before each trial
var HCT_countdown = {
    type: jsPsychHtmlKeyboardResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#808080"
        document.body.style.cursor = "none"
        create_marker(marker1, (color = "white"))
    },
    on_finish: function () {
        document.querySelector("#marker1").remove()
        jsPsych.finishTrial() // Explicitly advance to the next trial
    },
    stimulus: function () {
        var count = 3
        var countdownHTML =
            '<p style="font-size: 100px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">' +
            count +
            "</p>"
        var countdownInterval = setInterval(function () {
            count--
            if (count > 0) {
                document.querySelector("#countdown").innerHTML = count
            } else {
                clearInterval(countdownInterval)
            }
        }, 1000) // Update countdown every second
        return (
            '<div id="countdown" style="font-size: 100px;">' + count + "</div>"
        )
    },
    choices: "NO_KEYS",
    trial_duration: 3000, // Pause duration in ms before the trial starts
    css_classes: ["fixation"],
}

function HCT_interval() {
    return {
        type: jsPsychHtmlKeyboardResponse,
        on_load: function () {
            create_marker(marker1);
            sendMarker("1");
        },
        stimulus: "<p style='font-size:150px;'>+</p>",
        choices: ["s"],
        trial_duration: jsPsych.timelineVariable("duration"),
        css_classes: ["fixation"],
        data: {
            screen: "HCT_interval",
            time_start: function () {
                return performance.now();
            },
        },
        on_finish: function (data) {
            document.querySelector("#marker1").remove();
            sendMarker("0"); 
            data.duration = (performance.now() - data.time_start) / 1000 / 60;
            data.interval = jsPsych.timelineVariable("duration") / 1000;
        },
    };
}

var HCT_beep = {
    type: jsPsychAudioButtonResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    stimulus: ["utils/beep.mp3"],
    prompt: "<p>This trial is over, please press continue.</p>",
    choices: ["Continue"],
}

var HCT_items = {
    type: jsPsychSurvey,
    survey_json: {
        pages: [
            {
                elements: [
                    {
                        title: "How many heartbeats did you count?",
                        type: "text",
                        placeholder: "Enter number",
                        name: "HCT_count",
                    },
                ],
            },
            {
                elements: [
                    {
                        title: "How confident are you that your answer was correct?",
                        name: "HCT_confidence",
                        type: "rating",
                        displayMode: "buttons",
                        isRequired: true,
                        minRateDescription: "Not confident",
                        maxRateDescription: "Very confident",
                        rateMin: 0,
                        rateMax: 5,
                    },
                ],
            },
        ],
    },
    data: {
        screen: "HCT_items",
    },
}
