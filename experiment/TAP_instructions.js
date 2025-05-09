// Trials Instructions
var VoluntaryExternal_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>In this task, you will see a circle with a rotating arm moving around it.</p>" +
        "<p>Your task is to tap on the circle whenever the rotating arm reaches the designated target point (shown as an arrow in red).</p>" +
        "<p>Try to sync your tapping as closely as possible with the rotating arm passing through the target.</p>" +
        "<p>Press the button below to begin.</p>",
    choices: ["I'm ready"],
},

var VoluntaryInternal_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p> Well done! In this task, you will see a circle with a rotating arm moving around it.</p>" +
        "<p>Your task is to tap at a moment of your own choosing, but <b>before</b> the rotating arm reaches the end of its path.</p>" +
        "<p>There is no correct moment to tap — just make sure you tap <b>before</b> the arm reaches the end.</p>" +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
},

const RhytmicTapping_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>Well done! In this task, you will need to tap the spacebar in shcynrony with the beeps.</p>" +
        "<p>Try to tap as closely as possible to the beeps.</p>" +
        "<p> After a certain ammount of time, the beeps will stop and you will have to continue tapping in the same rhythm.</p>" +
        "<p>Try to keep the same rhythm as before.</p>" +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
},

const RhytmicRandom_instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
        "<p>Well done! In this task, you will need to tap the spacebar as <b>randomly</b> as possible, by changing the timing between the presses and making it as much 'unpredictable' and 'random' as you can.</p>" +
        "<p><b>Avoid consequetive taps.</b></p>" +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
},

const HeartTapping_Instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus:
        "<p>Well done! For the final trial, please try to tap <b>every time you feel a heart beat</b>.</p>" +
        "<p>Do continue making new presses until the trial is over.</p>" +
        "<p>Press the button below when you're ready to begin.</p>",
    choices: ["I'm ready"],
}