
// Trials Instructions
const TAP_instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        "<p><b>Instructions</b></p>" +
        "<p>In the following task, you will need to tap the spacebar with any rhythm you prefer.</p>" +
        "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
        "<p>Press the space bar to begin.</p>",
}

const TAP_instructions2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! Now tap with a different, but <b>slower</b> rhythm.</p>" +
        "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"],
}

const TAP_instructions3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! This time tap with a different, but <b>faster</b> rhythm than the first time.</p>" +
        "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"],
}

const TAP_instructions4 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! Now please try to tap <b>arhythmically</b> by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can.</p>" +
        "<p>Do continue making new presses until the trial is over.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"],
}

const TAP_instructions5 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! For the final trial, please try to tap <b>every time you feel a heart beat</b>.</p>" +
        "<p>Do continue making new presses until the trial is over.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"],
}

const TAP_items = {
    type: jsPsychSurvey,
    completeText: "Continue",
    showQuestionNumbers: false,
    survey_json: {
        pages: [
            {
                elements: [
                    {
                        type: "rating",
                        title: "To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
                        name: "Influence",
                        isRequired: true,
                        rateMin: 0,
                        rateMax: 5,
                        displayMode: "buttons",
                        minRateDescription: "Not influenced",
                        maxRateDescription: "Totally influenced",
                    }
                ],
            },
            {
                elements: [
                    {
                        type: "comment",
                        name: "strategy",
                        title:"To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
                        name: "Strategy",
                        rows: 2,
                        autoGrow: true, 
                    },
                ],
            },
        ]
    },
    data: {
        screen: "TAP_items",
    },
}

// TAP ======================================================= 
function create_TAP_trial(
    screen = "TAP1_waiting",
    trial_duration = null,
    marker = "white"
) {
    return {
        type: jsPsychHtmlKeyboardResponse,
        on_load: function () {
            create_marker(marker1, (color = marker))
            create_marker_2(marker2)
        },
        stimulus: "Please continue tapping...",
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

function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
    return {
        timeline: [
            create_TAP_trial(screen + "_waiting", null, "white"),
            create_TAP_trial(screen + "_tap", 60, "black"),
        ],
        repetitions: repetitions,
        // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
    }
}



//////////////////////////////


