// Trials Instructions for rhythmic tapping 
const TAP_instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        "<p><b>Instructions</b></p>" +
        "<p>In the following task, press the spacebar in sync with the beeps.</p>" +
        "<p>After the beeps stop, continue pressing the spacebar at the same rhythm until the trial ends.</p>" +
        "<p>Press the spacebar to begin.</p>",
    choices: [" "]
}

var beep = ["utils/beep.mp3"]

// Countdown before each trial
const TAP_countdown = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        let count = 3
        return `<p style='font-size: 100px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);' id='countdown'>${count}</p>`
    },
    choices: "NO_KEYS",
    trial_duration: 3000,
    on_start: function () {
        document.body.style.backgroundColor = "#808080"
        document.body.style.cursor = "none"
        let count = 3
        let countdownInterval = setInterval(() => {
            count--
            if (count > 0) {
                document.getElementById("countdown").innerText = count
            } else {
                clearInterval(countdownInterval)
            }
        }, 1000)
    },
}

// Create beep
const TAP_beep = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: beep,
    choices: [" "],
    trial_duration: 1429, // 42 BPM converted to milliseconds
    response_ends_trial: false,
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    data: { screen: "tap_beep" }
}

// create sequence of beeps
const TAP_beep_sequence = {
    timeline: [TAP_beep],
    repetitions: 10, // 10 beeps
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    }
}

function create_TAP_trial(
    screen = "tap",
    trial_duration = null,
    marker = "white"
) {
    return {
        type: jsPsychHtmlKeyboardResponse,
        // extensions: extensions,
        on_load: function () {
            create_marker(marker1, (color = marker))
            create_marker_2(marker2)
        },
        stimulus: "<b>Keep tapping at the same rhythm!</b>",
        choices: [" "],
        trial_duration: trial_duration,
        css_classes: ["fixation"],
        data: {
            screen: screen,
            time_start: function () {
                return performance.now()
            },
        },
        on_finish: function (data) {
            document.querySelector("#marker1").remove()
            document.querySelector("#marker2").remove()
            data.duration = (performance.now() - data.time_start) / 1000 / 60
        },
    }
}

function create_TAP_sequence(screen = "TAP1", repetitions = 100) {
    return {
        timeline: [
            create_TAP_trial(screen + "_waiting", null, "white"),
            create_TAP_trial(screen + "_tap", 60, "black"),
        ],
        repetitions: repetitions,
        // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
    }
}
