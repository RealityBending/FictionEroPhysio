// // ============================ TAP Instructions ==================================

const VoluntaryExternal_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>In this task, you will see a circle with a rotating arm moving around it.</p>" +
        "<p>Your task is to <b>tap</b> on the circle whenever the rotating arm reaches the <b>designated target point</b> (shown as an arrow in red).</p>" +
        "<p>Try to sync your tapping as closely as possible with the rotating arm passing through the target.</p>" +
        "<p>The trial will start with a '3-2-1' signal. Press the button below when you're ready to begin.</p>" ,
    choices: ["I'm ready"],
}

const VoluntaryInternal_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p> Well done! In this task, you will see a circle with a rotating arm moving around it.</p>" +
        "<p>Your task is to <b>tap</b> at a moment of your <b>own choosing</b>, but before the rotating arm reaches the end of its path.</p>" +
        "<p>There is no correct moment to tap — just make sure you tap <b>before the arm reaches the end</b>.</p>" +
        "<p>The trial will start with a '3-2-1' signal. Press the button below when you're ready to begin.</p>" ,
    choices: ["I'm ready"],
}

const RhytmicTapping_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>Well done! In this task, you will need to tap the spacebar in <b>synchrony</b> with the beeps." +
        "<p>Try to tap as closely as possible to the beeps." +
        "<p>After a certain ammount of time, the <b>beeps will stop</b> and you will have to <b>continue tapping in the same rhythm</b>." +
        "<p>Try to keep the same rhythm as before." +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
}

const RhytmicRandom_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>Well done! In this task, you will need to tap the spacebar as <b>randomly</b> as possible, by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can." +
        "<p><b>Avoid consequetive taps.</b></p>" +
        "<p>Press the button below when you're ready to begin.",
    choices: ["I'm ready"],
}

const HeartTapping_Instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! For the final trial, please try to tap <b>every time you feel a heart beat</b>.</p>" +
        "<p>Do continue making new presses until the trial is over.</p>" +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
}

// ============================ TAP TRIALS ==================================

// Countdown before trials
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
    on_finish: function () {
        document.body.style.backgroundColor = "white"}
}

// ############################ Voluntary Tapping Task
// Written by: Max Lovell
// Originally at https://github.com/SussexPsychologySoftware/tapping

// JS CODE -----------------------------------------
// Declare Globals Variables
let clock
let ctx
let ctap_startTime
let ctap_pressTime
let ctap_animationID
const TWO_PI = Math.PI * 2

// Drawing ========================================
function drawClockOutline(clockRadius = 140) {
    const center = clock.width / 2
    ctx.beginPath()
    ctx.strokeStyle = "black"
    ctx.arc(center, center, clockRadius, 0, 2 * Math.PI)
    ctx.stroke()
}

function drawArc(angle, lineLength = 120, start_angle = 0, fill = "green") {
    const center = clock.width / 2
    ctx.beginPath()
    ctx.fillStyle = fill
    ctx.moveTo(center, center)
    ctx.arc(center, center, lineLength, start_angle - Math.PI / 2, angle - Math.PI / 2)
    ctx.lineTo(center, center)
    ctx.fill()
}

function drawCenterDot(radius = 5) {
    const center = clock.width / 2
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, TWO_PI)
    ctx.fillStyle = "black"
    ctx.fill()
}

// HAND DRAWING HELPERS ---
function drawLine(x1, y1, x2, y2, color) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawHand(angle, colour = "black", startOffset = 0, lineLength = 120) {
    const center = clock.width / 2
    const x1 = center + Math.sin(angle) * startOffset
    const y1 = center - Math.cos(angle) * startOffset
    const x2 = x1 + Math.sin(angle) * lineLength
    const y2 = y1 - Math.cos(angle) * lineLength
    drawLine(x1, y1, x2, y2, colour)
}

function drawArrowhead(headLength, angle, distance, colour, outwards = true) {
    const center = clock.width / 2

    // Arrow tip location
    const tipX = center + Math.sin(angle) * distance
    const tipY = center - Math.cos(angle) * distance

    // Line end location
    const lineX = center + Math.sin(angle) * (distance - (outwards ? headLength : -headLength))
    const lineY = center - Math.cos(angle) * (distance - (outwards ? headLength : -headLength))

    // Draw
    ctx.beginPath()
    ctx.fillStyle = colour
    ctx.moveTo(tipX, tipY)

    // Left side of arrowhead
    ctx.lineTo(lineX + Math.sin(angle - Math.PI / 2) * headLength, lineY - Math.cos(angle - Math.PI / 2) * headLength)

    // Right side of arrowhead
    ctx.lineTo(lineX + Math.sin(angle + Math.PI / 2) * headLength, lineY - Math.cos(angle + Math.PI / 2) * headLength)

    ctx.lineTo(tipX, tipY)
    ctx.fill()
}

function drawArrow(angle, colour, outwards = true, start = 0, length = 120, headLength = 12) {
    if (outwards) {
        drawHand(angle, colour, 0, length - headLength)
        drawArrowhead(headLength, angle, length, colour, outwards)
    } else {
        drawHand(angle, colour, start + headLength, length)
        drawArrowhead(headLength, angle, start, colour, outwards)
    }
}

function time2Rads(time, duration, start_angle) {
    const propTrialLeft = time / duration
    return (propTrialLeft * TWO_PI + start_angle) % TWO_PI
}

// Clock Animation =========================================
function drawClock(condition = "external", start_angle = 0, target_angle = 0, duration = 3000, difficulty = 0.5) {
    let radius = Math.round(window.innerHeight * 0.15)
    let handlength = Math.round(radius * difficulty)
    let color_arrow = condition === "external" ? "#9C27B0" : "#FF9800"
    let color_fill = condition === "external" ? "#4CAF50" : "#03A9F4"

    // DURING
    ctx.clearRect(0, 0, clock.width, clock.height)
    drawClockOutline(radius) // clockRadius is a function of window height

    // Hands
    const currentTime = performance.now() - ctap_startTime
    const angle = time2Rads(currentTime, duration, start_angle)
    drawHand(angle, "black", 0, handlength) // angle, colour, startOffset, lineLength
    drawArc(angle, handlength, start_angle, color_fill)

    // Arrows
    if (ctap_pressTime) drawArrow(time2Rads(ctap_pressTime, duration, start_angle), color_arrow, true, 0, handlength, radius * 0.05)
    if (condition === "external") drawArrow(target_angle, "red", false, radius, radius * 0.4, radius * 0.05)

    drawCenterDot() // Draw the center dot
    if (currentTime >= duration) stopClock()
}

function stopClock() {
    if (ctap_animationID) {
        cancelAnimationFrame(ctap_animationID)
        ctap_animationID = undefined
    }
}

function animateClock(condition, start_angle, target_angle, duration, difficulty) {
    drawClock(condition, start_angle, target_angle, duration, difficulty)
    if (performance.now() - ctap_startTime < duration) {
        ctap_animationID = requestAnimationFrame(function () {
            animateClock(condition, start_angle, target_angle, duration, difficulty)
        })
    } else {
        stopClock()
    }
}

// Trial Functions ========================================
function ctap_stimulus(c, condition = "external", start_angle = 0, target_angle = 0, duration = 3000, difficulty = 0.5) {
    // START
    clock = c
    ctx = c.getContext("2d")
    ctx.lineWidth = 5
    ctap_pressTime = undefined
    ctap_startTime = performance.now()
    drawClock(condition, start_angle, target_angle, duration, difficulty)
    ctap_animationID = requestAnimationFrame(function () {
        animateClock(condition, start_angle, target_angle, duration, difficulty)
    })
    document.addEventListener("keydown", ctap_keyListener)
}

function ctap_keyListener(e) {
    if (e.key === " ") {
        ctap_pressTime = performance.now() - ctap_startTime
        document.removeEventListener("keydown", ctap_keyListener)
        document.querySelector("#marker1").remove() 
    }
}

function ctap_maketrials(nTrials = 10, condition = "external") {
    var trials = []
    var min_distance = 0.5 // buffer on end angle in percentage
    for (let i = 0; i < nTrials; i++) {
        // Generate random angles in radians
        let start_angle = Math.random() * TWO_PI
        // Calculate target angle ensuring minimum distance from start (between min_distance and 0.95)
        let target_angle = Math.random() * (0.95 - min_distance) + min_distance
        if (condition === "internal") target_angle = 0

        // Add timeline vars trial info
        let trial_info = {
            start_angle: start_angle,
            target_angle: start_angle + target_angle * TWO_PI,
            condition: condition,
            difficulty: Math.random() * (0.9 - 0.4) + 0.4, // The size of the clock arms relative to the radius
            duration: (Math.random() * 2 + 4) * 1000, // random between 4 and 6 seconds
        }
        trials.push(trial_info)
    }
    return trials
}

// JsPsych ========================================
const ctap_trial = {
    type: jsPsychCanvasKeyboardResponse,
    on_start: function () {
        document.body.style.backgroundColor = "white"
        document.body.style.cursor = "none"
        create_marker(marker1, (color = "#808080"))
    },
    canvas_size: function () {
        return [Math.round(window.innerHeight * 0.8), Math.round(window.innerHeight * 0.8)]
    },
    trial_duration: function () {
        return jsPsych.evaluateTimelineVariable("duration")
    },
    response_ends_trial: false,
    stimulus: function (canvas) {
        const start_angle = jsPsych.evaluateTimelineVariable("start_angle")
        const target_angle = jsPsych.evaluateTimelineVariable("target_angle")
        const condition = jsPsych.evaluateTimelineVariable("condition")
        const difficulty = jsPsych.evaluateTimelineVariable("difficulty")
        const duration = jsPsych.evaluateTimelineVariable("duration")
        ctap_stimulus(canvas, condition, start_angle, target_angle, duration, difficulty)
    },
    choices: [" "],
    prompt: "",
    on_finish: function (data) {
        document.body.style.cursor = "auto",
        data.response_time = ctap_pressTime // Time user pressed spacebar - same as RT
        data.response_angle = time2Rads(
            ctap_pressTime,
            jsPsych.evaluateTimelineVariable("duration"),
            jsPsych.evaluateTimelineVariable("start_angle"),   
        ) // Where user pressed spacebar in radians, relative to 12'clock = 0
    },
}
// ================================ Rhythmic Tapping Task ======================================================

var beep = ["utils/beep.mp3"]; // Audio file for the beep

// Beep trial (for synchrony phase)
const TAP_beep = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: beep,
    choices: [" "], // space bar
    trial_duration: 1429, // Duration of each beat (42 BPM ≈ 1429ms)
    response_ends_trial: false, 
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF";
        document.body.style.cursor = "auto";
    },
    data: { screen: "tap_beep" }
};

// Beep sequence (5 beeps) // change after
const TAP_beep_sequence = {
    timeline: [TAP_beep],
    repetitions: 5, // 5 beeps total
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF";
        document.body.style.cursor = "auto";
    }
};

// Function to create individual tapping trials
function create_TAP_trial(screen = "tap", trial_duration = null, markerColor = "white") {
    return {
        type: jsPsychHtmlKeyboardResponse,
        on_load: function () {
            create_marker(marker1, markerColor); // Show color marker
            create_marker_2(marker2);            // Show position marker
        },
        stimulus: "<b>Please continue tapping...</b>", // Displayed instruction
        choices: [" "], // Space bar only
        trial_duration: trial_duration, // Null means indefinite (until keypress)
        css_classes: ["fixation"], // Optional CSS styling
        data: {
            screen: screen
        },
        on_start: function (trial) {
            trial.start_time = performance.now(); // Record start time for duration
        },
        on_finish: function (data) {
            // Clean up markers
            document.querySelector("#marker1")?.remove();
            document.querySelector("#marker2")?.remove();

            // Calculate and store trial duration
            data.duration = (performance.now() - data.start_time) / 1000; // in seconds
        }
    };
}

// Function to create a tapping phase (sequence of trials)
function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
    return {
        timeline: [
            create_TAP_trial(screen + "_waiting", null, "white"), // Untimed trial (starts with keypress)
            create_TAP_trial(screen + "_tap", 60 , "black")  // Timed tapping trials
        ],
        repetitions: repetitions
    };
}