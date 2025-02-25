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

// Countdown before each trial
var TAP_countdown = {
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
    }
}

// Beep phase with participant tapping in sync
const TAP_beep = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: beep,
    choices: [" "],
    trial_duration: 1428, // 42 BPM converted to milliseconds
    response_ends_trial: false,
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    data: {
        phase: "tap_beep"
    }
}

// create sequence of beeps
const TAP_beep_sequence = {
    timeline: [TAP_beep],
    repetitions: 30, // 30 beeps
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    }
}

// Continuation phase where participant maintains the rhythm
var TAP_continuation = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [" "],
    trial_duration: 142800, // Duration for 100 taps at 42 BPM
    response_ends_trial: false,
    data: {
        phase: "tap_continuation"
    }
}

// Trial combining beeps and continuation phase in a sequence
const TAP_trial = {
    timeline: [
        TAP_beep, // Beep phase where participant taps in sync
        TAP_continuation // Continuation phase where they keep tapping the rhythm
    ],
    repetitions: 30, // 30 beeps and continuation phase after
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF" // Set background to white
        document.body.style.cursor = "auto" // Reset cursor
    }
}

//TAP_trial
const TAP_timeline = [
    TAP_instructions1,  // Instructions to the participant
    TAP_countdown,      // Countdown before the trial starts
    TAP_trial           // Beep phase followed by continuation phase
]