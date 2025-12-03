// // ============================ TAP Instructions ==================================

const VoluntaryExternal_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_ve",
                        html: `
                        <div style="text-align: center;"> 
                        <h3>Instructions</h3>
                        </div>

                        <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                        <div style="flex: 2; text-align: left;">
                            <p>In this task, you will see a circle with a rotating arm moving around it.</p>
                            <p>Your job is to <b>tap the spacebar</b> on the circle whenever the rotating arm reaches the 
                            <b style="color: #E91E63">designated target point</b> (shown as a red arrow).</p>
                            <p>Try to time your tap as closely as possible with the arm passing through the target.</p>
                            <p>The trial will begin with a countdown: <b>3 - 2 - 1</b>.</p>
                            <p>Press the button below when you're ready to begin!</p>
                        </div>
                        <div style="flex: 1; min-width: 200px; margin-right: -150px;">
                            <img src="media/voluntaryE.jpg" alt="Task illustration" style="max-width: 75%; height: auto; display: block; align-items: right;">
                        </div>
                        </div>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_External_instructions" },
}

const VoluntaryInternal_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_vi",
                        html: `
                    <div style="text-align: center;"> 
                    <h3>Well done!</h3>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                    <div style="flex: 2; text-align: left;">
                        <p>In this next task, you will see a circle with a rotating arm moving around it.</p>
                        <p>Your task is to <b>tap the spacebar</b> at a moment of your <b>own choosing</b>, but
                        <b style="color: #E91E63">before the rotating arm reaches the end of its path.</b></p>
                        <p>There is no correct moment to tap - just make sure you tap <b>before the arm reaches the end</b>.</p>
                        <p>The trial will begin with a countdown: <b>3 - 2 - 1</b>.</p>
                        <p>Press the button below when you're ready to begin!</p>
                    </div>
                    <div style="flex: 1; min-width: 200px; margin-right: -150px;">
                        <img src="media/voluntaryI.jpg" alt="Task illustration" style="max-width: 75%; height: auto; display: block; align-items: right;">
                    </div>
                    </div> `,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_Internal_instructions" },
}

const Mixedtrials_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_mixed",
                        html: ` 
                        <div style="text-align: center;"> 
                        <h3>Instructions</h3>
                        </div>
                        <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                    
                        <div style="flex: 1; display: flex; justify-content: center;">
                            <img src="media/voluntaryE.jpg" alt="Task illustration left" style="max-width: 100%; height: auto;">
                        </div>
                        <div style="flex: 2; text-align: left;">
                            <p>In the next task, you will perform <b style="color: #E91E63">a mix of the last two tasks </b>.</p>
                            <p>If  <b style="color: #14a333ff">the circle is green</b> with a red arrow, you should <b>tap the spacebar</b> whenever the arm reaches the target point.</p>
                            <p>If <b style="color: #325be0ff">the circle is blue</b>, you should <b>tap the spacebar</b> at a moment of your own choosing, but before the arm reaches the end of its path.</p>
                            <p>The trial will begin with a countdown: <b>3 - 2 - 1</b>.</p>
                            <p>Press the button below when you're ready to begin!</p>
                        </div>
                        <div style="flex: 1; display: flex; justify-content: center;">
                            <img src="media/voluntaryI.jpg" alt="Task illustration right" style="max-width: 100%; height: auto;">
                        </div>
                        </div>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_Mixed_instructions" },
}

const RhytmicTapping_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_rhythmic",
                        html: `
                    <div style="text-align: center;"> 
                    <h3>Well done!</h3>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: flex-start;max-width: 1000px; margin: 0 auto;">
                    <div style="flex: 2; text-align: left;">
                        <p>In the next task, you will hear a series of beeps. Your goal is to tap the spacebar <b>in synchrony</b> with the beeps, <b style="color: #E91E63;">matching their rhythm as closely as possible.</b></p>
                        <p>After a while, the <b>beeps will stop</b>, but you should <b>keep tapping at the same pace</b>, maintaining the rhythm in your mind.</p>
                        <p>Do your best to stay in time, even without the sound.</p>
                        <p>The task will begin with a short countdown: <b>3 - 2 - 1</b>.</p>
                        <p>Press the button below when you're ready to begin.</p>
                    </div>
                    </div>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_Rhythmic_instructions" },
}

const RhytmicRandom_instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_random",
                        html: `
                    <div style="text-align: center;"> 
                    <h3>Well done!</h3>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                    <div style="flex: 2; text-align: left;">
                        <p>In this next task, you will need to tap the spacebar as <b style="color: #E91E63;">randomly</b> as possible, by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can.</p>
                        <p><b>Avoid consecutive taps.</b></p>
                        <p>The task will begin with a short countdown: <b>3 - 2 - 1</b>.</p>
                        <p>Press the button below when you're ready to begin.</p>
                    </div>
                    </div>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_Random_instructions" },
}

const HeartTapping_Instructions = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "instructions_heart",
                        html: `
                    <div style="text-align: center;"> 
                    <h3>Well done!</h3>
                    </div>
                    <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                    <div style="flex: 2; text-align: left;">
                        <p>For the final trial, please try to tap <b style="color: #E91E63;">every time you feel a heart beat</b>. Do continue making new presses until the trial is over.</p>
                        <p>The task will begin with a short countdown: <b>3 - 2 - 1</b>.</p>
                        <p>Press the button below when you're ready to begin.</p>
                    </div>
                    </div>`,
                    },
                ],
            },
        ],
    },
    data: { screen: "TAP_Heart_instructions" },
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
        create_marker(marker1, (color = "white"))
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
        document.body.style.backgroundColor = "white"
        // Clean up markers
        document.querySelector("#marker1")?.remove()
        document.querySelector("#marker2")?.remove()
    },
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

let trial_number = 0
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
    ctx.arc(
        center,
        center,
        lineLength,
        start_angle - Math.PI / 2,
        angle - Math.PI / 2
    )
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
    const lineX =
        center +
        Math.sin(angle) * (distance - (outwards ? headLength : -headLength))
    const lineY =
        center -
        Math.cos(angle) * (distance - (outwards ? headLength : -headLength))

    // Draw
    ctx.beginPath()
    ctx.fillStyle = colour
    ctx.moveTo(tipX, tipY)

    // Left side of arrowhead
    ctx.lineTo(
        lineX + Math.sin(angle - Math.PI / 2) * headLength,
        lineY - Math.cos(angle - Math.PI / 2) * headLength
    )

    // Right side of arrowhead
    ctx.lineTo(
        lineX + Math.sin(angle + Math.PI / 2) * headLength,
        lineY - Math.cos(angle + Math.PI / 2) * headLength
    )

    ctx.lineTo(tipX, tipY)
    ctx.fill()
}

function drawArrow(
    angle,
    colour,
    outwards = true,
    start = 0,
    length = 120,
    headLength = 12
) {
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
function drawClock(
    condition = "external",
    start_angle = 0,
    target_angle = 0,
    duration = 3000,
    difficulty = 0.5
) {
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
    if (ctap_pressTime)
        drawArrow(
            time2Rads(ctap_pressTime, duration, start_angle),
            color_arrow,
            true,
            0,
            handlength,
            radius * 0.05
        )
    if (condition === "external")
        drawArrow(
            target_angle,
            "red",
            false,
            radius,
            radius * 0.4,
            radius * 0.05
        )

    drawCenterDot() // Draw the center dot
    if (currentTime >= duration) stopClock()
}

function stopClock() {
    if (ctap_animationID) {
        cancelAnimationFrame(ctap_animationID)
        ctap_animationID = undefined
    }
}

function animateClock(
    condition,
    start_angle,
    target_angle,
    duration,
    difficulty
) {
    drawClock(condition, start_angle, target_angle, duration, difficulty)
    if (ctap_animationID && performance.now() - ctap_startTime < duration) {
        // Check if we still want another frame first, allows StopClock to cancel the animation
        ctap_animationID = requestAnimationFrame(function () {
            animateClock(
                condition,
                start_angle,
                target_angle,
                duration,
                difficulty
            )
        })
    }
}

// Trial Functions ========================================
function ctap_stimulus(
    c,
    condition = "external",
    start_angle = 0,
    target_angle = 0,
    duration = 3000,
    difficulty = 0.5
) {
    // START
    clock = c
    ctx = c.getContext("2d")
    ctx.lineWidth = 5
    ctap_pressTime = undefined
    ctap_startTime = performance.now()
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
    const trials = [] // Stop using var ffs
    const min_distance = 0.5 // buffer on end angle in percentage
    const min_trial_duration = 4 * 1000
    const max_trial_duration = 6 * 1000
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
            // random between min and max duration, +1 means max duration is included, floor means it is an integer so no more unneeded decimals
            duration: Math.floor(
                Math.random() * (max_trial_duration - min_trial_duration + 1) +
                    min_trial_duration
            ),
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
        create_marker(marker1, (color = "black"))
    },
    canvas_size: function () {
        return [
            Math.round(window.innerHeight * 0.8),
            Math.round(window.innerHeight * 0.8),
        ]
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
        ctap_stimulus(
            canvas,
            condition,
            start_angle,
            target_angle,
            duration,
            difficulty
        )
    },
    choices: [" "],
    prompt: "",
    on_load: function () {
        //or on_start?? on_load used here: https://github.com/jspsych/jsPsych/discussions/1690
        ctap_startTime = performance.now()
    },
    on_finish: function (data) {
        // Clean up markers
        document.querySelector("#marker1")?.remove()
        document.querySelector("#marker2")?.remove()
        stopClock() // Stop the clock animation, should be called at the right time if our clock is correctly set up
        ;(document.body.style.cursor = "auto"),
            (data.response_time = ctap_pressTime) // Time user pressed spacebar - same as RT
        data.response_angle = time2Rads(
            ctap_pressTime,
            jsPsych.evaluateTimelineVariable("duration"),
            jsPsych.evaluateTimelineVariable("start_angle")
        ) // Where user pressed spacebar in radians, relative to 12'clock = 0
        data.space_pressed = ctap_pressTime !== undefined // Save whether the space bar was pressed
    },
}

// ================================ Rhythmic Tapping Task ======================================================

var beep = ["utils/beep_new.mp4"] // Audio file for the beep
// var beep = ["utils/beep.mp3"] // Audio file for the beep

var TAP_preload = {
    type: jsPsychPreload,
    audio: beep,
    message: "Loading",
}

// Beep trial (for synchrony phase)
const TAP_beep = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: beep,
    prompt: "<b>Tap when you hear the beep!</b>",
    choices: [" "], // space bar
    trial_duration: 1429, // Duration of each beat (42 BPM ≈ 1429ms)
    response_ends_trial: false,
    save_trial_parameters: { trial_duration: true },
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    data: { screen: "tap_beep" },
}

// Beep sequence (5 beeps) // change after
const TAP_beep_sequence = {
    timeline: [TAP_beep],
    repetitions: 10, // 5 beeps total
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
}

// Function to create individual tapping trials
function create_TAP_trial(
    screen = "tap",
    trial_duration = null,
    markerColor = "white"
) {
    return {
        type: jsPsychHtmlKeyboardResponse,
        on_load: function () {
            create_marker(marker1, markerColor) // Show color marker
        },
        stimulus: "", // Placeholder, will be updated in on_start
        choices: [" "], // Space bar only
        trial_duration: trial_duration,
        css_classes: ["fixation"],
        data: {
            screen: screen,
        },
        on_start: function (trial) {
            // Set the appropriate stimulus message
            if (screen === "TAP_heart") {
                trial.stimulus =
                    "<b>Please continue tapping when you feel a heartbeat...</b>"
            } else {
                trial.stimulus = "<b>Please continue tapping...</b>"
            }
        },
        on_finish: function (data) {
            // Clean up markers
            document.querySelector("#marker1")?.remove()
            document.querySelector("#marker2")?.remove()
            document.body.style.cursor = "auto"

            // Store trial duration
            data.duration = (performance.now() - data.start_time) / 1000
        },
    }
}

// Function to create a tapping phase (sequence of trials)
function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
    return {
        timeline: [
            create_TAP_trial(screen + "_waiting", null, "white"), // Untimed trial (starts with keypress)
            create_TAP_trial(screen + "_tap", 60, "black"), // Timed tapping trials
        ],
        repetitions: repetitions,
    }
}

// warning screen
const TAP_warning = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionsNumbers: false,
        completeText: "I'm ready",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "warning",
                        html: `
                    <div style="text-align: center;"> 
                    <h2 style="color: #E91E63">WARNING!</h2>
                    </div>
                    <p>You did <b>not press</b> the space bar.</p>
                    <p>Press the button below to start again.</p>`,
                    },
                ],
            },
        ],
    },
    data: {
        screen: "fiction_fixation1a",
    },
}

const TAP_fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        "<div style='font-size:500%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'>+</div>",
    choices: [],
    trial_duration: 500, // 500 ms fixation
    save_trial_parameters: { trial_duration: true },
    data: {
        screen: "fiction_fixation1a",
    },
}

//========================================  TAP Procedure

function makeTAPblock(trials, condition) {
    let timelineVars

    if (condition === "mixed") {
        const half = Math.floor(trials / 2)
        timelineVars = jsPsych.randomization.shuffle([
            ...ctap_maketrials(half, "external"),
            ...ctap_maketrials(trials - half, "internal"), // handles odd numbers
        ])
    } else {
        timelineVars = ctap_maketrials(trials, condition)
    }

    return {
        timeline: [
            {
                timeline: [TAP_warning, TAP_fixation],
                conditional_function: function () {
                    const last_data = jsPsych.data.get().last(1).values()[0]
                    return last_data.space_pressed === false
                },
            },
            ctap_trial,
        ],
        timeline_variables: timelineVars,
    }
}
