
// // // New trial TAP instructions

// // const circular_instructions = {
// //     type: jsPsychHtmlButtonResponse,
// //     stimulus: 
// //         "<p>In this task, you will see a circle with a moving dot around it.</p>" +
// //         "<p>Your task is to tap on the circle whenever the moving dot reaches the designated point.</p>" +
// //         "<p>Try to sync your tapping with the dot’s position as closely as possible.</p>" +
// //         "<p>Focus on maintaining a steady rhythm while tapping in time with the moving dot.</p>" +
// //         "<p>Press the button below to begin.</p>",
// //     choices: ["I'm ready"]
// // };


// // const new_instructions1 = {
// //     type: jsPsychHtmlKeyboardResponse,
// //     stimulus:
// //     "<p><b>Instructions</b></p>" +
// //     "<p> In the following task, you will need to tap the spacebar in sync with a series of beeps </p>" +
// //     "<p> You should try to match your tapping rhythm to the beeps that you hear.</p>" +
// //     "<p> The beeps will stop, please continue tapping without the sound cue, maintaining the rhythm as accurately as possible </p>" +
// //     "<p>Press the spacebar to begin the task.</p>",

// // }

// // const new_instructions2 = {
// //     type: jsPsychHtmlButtonResponse,
// //     stimulus:
// //         "<p>Well done! Now, in this trial, you will tap with a different, but <b>slower</b> rhythm.</p>" +
// //         "<p>Focus on syncing your taps to the slower rhythm, but <b>maintain the speed of tapping</b> throughout the trial.</p>" +
// //         "<p>Remember, you should keep the rhythm steady, even if it feels slower than the previous trial.</p>" +
// //         "<p>Press the button below to begin.</p>",
// //     choices: ["I'm ready"]
// // }

// // const new_instructions3 = {
// //     type: jsPsychHtmlButtonResponse,
// //     stimulus:
// //         "<p>Well done! Now, in this trial, you will tap with a different, but <b>arhythmic</b> rhythm.</p>" +
// //         "<p>Focus on syncing your taps to the beeps as best as you can, but they will be unpredictable throughout the trial.</p>" +
// //         "<p>Do continue making new presses until the trial is over.</p>"  +
// //         "<p>Press the button below to begin.</p>",
// //     choices: ["I'm ready"]
// // }

// // const new_instructions4 = {
// //     type: jsPsychHtmlButtonResponse,
// //     stimulus:
// //     "<p>In the following task, you will need to tap the spacebar in sync with a series of beeps. You should try to match your tapping rhythm to the beeps that you hear.</p>" +
// //     "<p>During the task, the interval between the beeps will gradually change. When the beeps stop, continue tapping without the sound cue, maintaining the rhythm based on your internal sense of time and your body's physical cues (e.g., heart rate or effort level).</p>" +
// //     "<p>You will be asked to tap to a set rhythm that increases in speed, and when the beeps stop, you will need to rely on your internal awareness to continue. The task will test your ability to match external rhythm cues and internal sensations.</p>" +
// //     "<p><b>Remember:</b> Try to maintain the tapping rhythm as accurately as possible, and focus on how your body feels as you follow the rhythm. You may notice changes in your heart rate or effort level as the task progresses.</p>" +
// //     "<p>Press the button below to begin the task.</p>",
// //         choices: ["I'm ready"]
// //     };

// // const TAP_items = {
// //     type: jsPsychSurvey,
// //     completeText: "Continue",
// //     showQuestionNumbers: false,
// //     survey_json: {
// //         pages: [
// //             {
// //                 elements: [
// //                     {
// //                         type: "rating",
// //                         title: "To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
// //                         name: "Influence",
// //                         isRequired: true,
// //                         rateMin: 0,
// //                         rateMax: 5,
// //                         displayMode: "buttons",
// //                         minRateDescription: "Not influenced",
// //                         maxRateDescription: "Totally influenced",
// //                     }
// //                 ],
// //             },
// //             {
// //                 elements: [
// //                     {
// //                         type: "comment",
// //                         name: "strategy",
// //                         title:"To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
// //                         name: "Strategy",
// //                         rows: 2,
// //                         autoGrow: true, 
// //                     },
// //                 ],
// //             },
// //         ]
// //     },
// //     data: {
// //         screen: "TAP_items",
// //     },
// // }

// // TAP ======================================================= 
// function create_TAP_trial(
//     screen = "TAP1_waiting",
//     trial_duration = null,
//     marker = "white"
// ) {
//     return {
//         type: jsPsychHtmlKeyboardResponse,
//         on_load: function () {
//             create_marker(marker1, (color = marker))
//             create_marker_2(marker2)
//         },
//         stimulus: "Please continue tapping...",
//         choices: [" "],
//         trial_duration: trial_duration,
//         css_classes: ["fixation"],
//         data: {
//             screen: screen,
//             time_start: function () {
//                 return performance.now()
//             },
//         },
//         on_finish: function (data) {
//             document.querySelector("#marker1").remove()
//             document.querySelector("#marker2").remove()
//             data.duration = (performance.now() - data.time_start) / 1000 / 60
//         },
//     }
// }

// function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
//     return {
//         timeline: [
//             create_TAP_trial(screen + "_waiting", null, "white"),
//             create_TAP_trial(screen + "_tap", 60, "black"),
//         ],
//         repetitions: repetitions,
//         // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
//     }
// }


// // ===================================== TAP =========================================

// // Trials Instructions for rhythmic tapping 
// // const TAP_instructions1 = {
// //     type: jsPsychHtmlKeyboardResponse,
// //     stimulus:
// //         "<h1> Part 3/ </h1>" +
// //         "<p><b>Instructions</b></p>" +
// //         "<p>In the following task, press the spacebar in sync with the beeps.</p>" +
// //         "<p>After the beeps stop, continue pressing the spacebar at the same rhythm until the trial ends.</p>" +
// //         "<p>Press the spacebar to begin.</p>",
// //     choices: [" "]
// // }

// // var beep = ["utils/beep.mp3"]

// // // Countdown before each trial
// // const TAP_countdown = {
// //     type: jsPsychHtmlKeyboardResponse,
// //     stimulus: function () {
// //         let count = 3
// //         return `<p style='font-size: 100px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);' id='countdown'>${count}</p>`
// //     },
// //     choices: "NO_KEYS",
// //     trial_duration: 3000,
// //     on_start: function () {
// //         document.body.style.backgroundColor = "#808080"
// //         document.body.style.cursor = "none"
// //         let count = 3
// //         let countdownInterval = setInterval(() => {
// //             count--
// //             if (count > 0) {
// //                 document.getElementById("countdown").innerText = count
// //             } else {
// //                 clearInterval(countdownInterval)
// //             }
// //         }, 1000)
// //     },
// // }

// // // Create beep
// // const TAP_beep = {
// //     type: jsPsychAudioKeyboardResponse,
// //     stimulus: beep,
// //     choices: [" "],
// //     trial_duration: 1429, // 42 BPM converted to milliseconds
// //     response_ends_trial: false,
// //     on_start: function () {
// //         document.body.style.backgroundColor = "#FFFFFF"
// //         document.body.style.cursor = "auto"
// //     },
// //     data: { screen: "tap_beep" }
// // }

// // create sequence of beeps
// const TAP_beep_sequence = {
//     timeline: [TAP_beep],
//     repetitions: 10, // 10 beeps
//     on_start: function () {
//         document.body.style.backgroundColor = "#FFFFFF"
//         document.body.style.cursor = "auto"
//     }
// }

// function create_TAP_trial(
//     screen = "tap",
//     trial_duration = null,
//     marker = "white"
// ) {
//     return {
//         type: jsPsychHtmlKeyboardResponse,
//         // extensions: extensions,
//         on_load: function () {
//             create_marker(marker1, (color = marker))
//             create_marker_2(marker2)
//         },
//         stimulus: "<b>Keep tapping at the same rhythm!</b>",
//         choices: [" "],
//         trial_duration: trial_duration,
//         css_classes: ["fixation"],
//         data: {
//             screen: screen,
//             time_start: function () {
//                 return performance.now()
//             },
//         },
//         on_finish: function (data) {
//             document.querySelector("#marker1").remove()
//             document.querySelector("#marker2").remove()
//             data.duration = (performance.now() - data.time_start) / 1000 / 60
//         },
//     }
// }

// function create_TAP_sequence(screen = "TAP1", repetitions = 100) {
//     return {
//         timeline: [
//             create_TAP_trial(screen + "_waiting", null, "white"),
//             create_TAP_trial(screen + "_tap", 60, "black"),
//         ],
//         repetitions: repetitions,
//         // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
//     }
// }


// // =============== TAPPING

// var TAP_instructions1 = {
//     type: jsPsychHtmlKeyboardResponse,
//     stimulus:
//         "<p><b>Instructions</b></p>" +
//         "<p>In the following task, you will need to tap the spacebar with any rhythm you prefer.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the space bar to begin.</p>",
// }

// var TAP_instructions2 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! Now tap with a different, but <b>slower</b> rhythm.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// var TAP_instructions3 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! This time tap with a different, but <b>faster</b> rhythm than the first time.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// var TAP_instructions4 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! Now please try to tap <b>arhythmically</b> by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can.</p>" +
//         "<p>Do continue making new presses until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// var TAP_instructions5 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! For the final trial, please try to tap <b>every time you feel a heart beat</b>.</p>" +
//         "<p>Do continue making new presses until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// var TAP_influenced = {
//     type: jsPsychMultipleSlider,
//     questions: [
//         {
//             prompt: "To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
//             name: "TAP_influence",
//             min: 0,
//             max: 1,
//             step: 0.01,
//             slider_start: 0.5,
//             ticks: ["Not influenced", "Totally influenced"],
//             required: true,
//         },
//     ],
//     data: {
//         screen: "TAP_influence",
//     },
// }

// var TAP_strategy = {
//     type: jsPsychSurveyText,
//     questions: [
//         {
//             prompt:
//                 "Please indicate if you followed or have been influenced by anything in particular while tapping (e.g., music, surrounding noise, internal sensations...)" +
//                 '<p><i>(e.g., "music in my head", "my breathing", "I was counting time in my head", ...)</i></p>',
//             placeholder: "Please type here...",
//             name: "TAP_strategy",
//         },
//     ],
//     data: {
//         screen: "TAP_strategy",
//     },
// }

// function create_TAP_trial(
//     screen = "TAP1_waiting",
//     trial_duration = null,
//     marker = "white"
// ) {
//     return {
//         type: jsPsychHtmlKeyboardResponse,
//         extensions: extensions,
//         on_load: function () {
//             create_marker(marker1, (color = marker))
//             create_marker_2(marker2)
//         },
//         stimulus: "Please continue tapping...",
//         choices: [" "],
//         trial_duration: trial_duration,
//         css_classes: ["fixation"],
//         data: {
//             screen: screen,
//             time_start: function () {
//                 return performance.now()
//             },
//         },
//         on_finish: function (data) {
//             document.querySelector("#marker1").remove()
//             document.querySelector("#marker2").remove()
//             data.duration = (performance.now() - data.time_start) / 1000 / 60
//         },
//     }
// }

// function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
//     return {
//         timeline: [
//             create_TAP_trial(screen + "_waiting", null, "white"),
//             create_TAP_trial(screen + "_tap", 60, "black"),
//         ],
//         repetitions: repetitions,
//         // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
//     }
// }


// // ===================================== TAPPING OLD =========================================


// // Trials Instructions
// const TAP_instructions1 = {
//     type: jsPsychHtmlKeyboardResponse,
//     stimulus:
//         "<p><b>Instructions</b></p>" +
//         "<p>In the following task, you will need to tap the spacebar with any rhythm you prefer.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the space bar to begin.</p>",
// }

// const TAP_instructions2 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! Now tap with a different, but <b>slower</b> rhythm.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// const TAP_instructions3 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! This time tap with a different, but <b>faster</b> rhythm than the first time.</p>" +
//         "<p>Please <b>maintain the speed of tapping</b> until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// const TAP_instructions4 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! Now please try to tap <b>arhythmically</b> by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can.</p>" +
//         "<p>Do continue making new presses until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// const TAP_instructions5 = {
//     type: jsPsychHtmlButtonResponse,
//     stimulus:
//         "<p>Well done! For the final trial, please try to tap <b>every time you feel a heart beat</b>.</p>" +
//         "<p>Do continue making new presses until the trial is over.</p>" +
//         "<p>Press the button below to begin.</p>",
//     choices: ["I'm ready"],
// }

// const TAP_items = {
//     type: jsPsychSurvey,
//     completeText: "Continue",
//     showQuestionNumbers: false,
//     survey_json: {
//         pages: [
//             {
//                 elements: [
//                     {
//                         type: "rating",
//                         title: "To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
//                         name: "Influence",
//                         isRequired: true,
//                         rateMin: 0,
//                         rateMax: 5,
//                         displayMode: "buttons",
//                         minRateDescription: "Not influenced",
//                         maxRateDescription: "Totally influenced",
//                     }
//                 ],
//             },
//             {
//                 elements: [
//                     {
//                         type: "comment",
//                         name: "strategy",
//                         title:"To what extent do you think your tapping rhythm was influenced by other things (e.g., music, surrounding noise, internal sensations...) than your own will?",
//                         name: "Strategy",
//                         rows: 2,
//                         autoGrow: true, 
//                     },
//                 ],
//             },
//         ]
//     },
//     data: {
//         screen: "TAP_items",
//     },
// }

// // TAP ======================================================= 
// function create_TAP_trial(
//     screen = "TAP1_waiting",
//     trial_duration = null,
//     marker = "white"
// ) {
//     return {
//         type: jsPsychHtmlKeyboardResponse,
//         on_load: function () {
//             create_marker(marker1, (color = marker))
//             create_marker_2(marker2)
//         },
//         stimulus: "Please continue tapping...",
//         choices: [" "],
//         trial_duration: trial_duration,
//         css_classes: ["fixation"],
//         data: {
//             screen: screen,
//             time_start: function () {
//                 return performance.now()
//             },
//         },
//         on_finish: function (data) {
//             document.querySelector("#marker1").remove()
//             document.querySelector("#marker2").remove()
//             data.duration = (performance.now() - data.time_start) / 1000 / 60
//         },
//     }
// }

// function create_TAP_sequence(screen = "TAP1", repetitions = 90) {
//     return {
//         timeline: [
//             create_TAP_trial(screen + "_waiting", null, "white"),
//             create_TAP_trial(screen + "_tap", 60, "black"),
//         ],
//         repetitions: repetitions,
//         // trial_duration: 5,  // Needs https://github.com/jspsych/jsPsych/discussions/3110
//     }
// }



// //////////////////////////////


