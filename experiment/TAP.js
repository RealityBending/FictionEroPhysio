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
    data: {
        screen: "tap_beep"
    }
}

// create sequence of beeps
const TAP_beep_sequence = {
    timeline: [TAP_beep],
    repetitions: 10, // 30 beeps
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    }
}

// Continuation phase (100 taps required)
let tapcount = 0

const TAP_continuation = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [" "],
    response_ends_trial: false,
    stimulus: "<p>Keep tapping at the same rhythm!</p>",
    data: { screen: "tap_continuation" },
    on_start: function () {
        tapcount = 0
    },// reset trial count when trial starts
    on_load: function () {
        let displayElement = jsPsych.getDisplayElement() // Get current trial display
        function countTaps(event) {
            if (event.code === "Space") { // Ensure only spacebar is counted
                tapcount++
                if (tapcount >= 100) {
                    displayElement.removeEventListener("keydown", countTaps) // Remove listener
                    jsPsych.finishTrial() // End trial after 100 taps
                }
            }
        }
        displayElement.addEventListener("keydown", countTaps)
    }
}

// Trial combining 30 beeps and continuation phase
const TAP_trial = {
    timeline: [
        TAP_beep_sequence,
        TAP_continuation],
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    data: { screen: "tap_trial" }
}

//TAP_trial
const TAP_timeline = [
    TAP_instructions1,  // Instructions to the participant
    TAP_countdown,      // Countdown before the trial starts
    TAP_trial]      // Beep phase followed by continuation phase