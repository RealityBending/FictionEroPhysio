
// New trial TAP instructions

const circular_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>In this task, you will see a circle with a moving dot around it.</p>" +
        "<p>Your task is to tap on the circle whenever the moving dot reaches the designated point.</p>" +
        "<p>Try to sync your tapping with the dot’s position as closely as possible.</p>" +
        "<p>Focus on maintaining a steady rhythm while tapping in time with the moving dot.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"]
};


const new_instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
    "<p><b>Instructions</b></p>" +
    "<p> In the following task, you will need to tap the spacebar in sync with a series of beeps </p>" +
    "<p> You should try to match your tapping rhythm to the beeps that you hear.</p>" +
    "<p> The beeps will stop, please continue tapping without the sound cue, maintaining the rhythm as accurately as possible </p>" +
    "<p>Press the spacebar to begin the task.</p>",

}

const new_instructions2 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! Now, in this trial, you will tap with a different, but <b>slower</b> rhythm.</p>" +
        "<p>Focus on syncing your taps to the slower rhythm, but <b>maintain the speed of tapping</b> throughout the trial.</p>" +
        "<p>Remember, you should keep the rhythm steady, even if it feels slower than the previous trial.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"]
}

const new_instructions3 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! Now, in this trial, you will tap with a different, but <b>arhythmic</b> rhythm.</p>" +
        "<p>Focus on syncing your taps to the beeps as best as you can, but they will be unpredictable throughout the trial.</p>" +
        "<p>Do continue making new presses until the trial is over.</p>"  +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"]
}

const new_instructions4 = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
    "<p>In the following task, you will need to tap the spacebar in sync with a series of beeps. You should try to match your tapping rhythm to the beeps that you hear.</p>" +
    "<p>During the task, the interval between the beeps will gradually change. When the beeps stop, continue tapping without the sound cue, maintaining the rhythm based on your internal sense of time and your body's physical cues (e.g., heart rate or effort level).</p>" +
    "<p>You will be asked to tap to a set rhythm that increases in speed, and when the beeps stop, you will need to rely on your internal awareness to continue. The task will test your ability to match external rhythm cues and internal sensations.</p>" +
    "<p><b>Remember:</b> Try to maintain the tapping rhythm as accurately as possible, and focus on how your body feels as you follow the rhythm. You may notice changes in your heart rate or effort level as the task progresses.</p>" +
    "<p>Press the button below to begin the task.</p>",
        choices: ["I'm ready"]
    };

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
