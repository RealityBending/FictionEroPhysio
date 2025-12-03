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
                let resp = await fetch("http://139.184.128.202:5000/sync", { cache: "no-store" }) // change IPv4 address as appropriate
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
        fetch("http://139.184.128.202:5000/marker?value=" + encodeURIComponent(value)) // change IPv4 address as appropriate
            .then(function () {
                console.log("sent marker (no-ts)", value)
            })
            .catch(function (err) {
                console.error("Marker send error:", err)
            })
        return
    }

    var ts = lslBaseTime + performance.now() / 1000
    var url = "http://139.184.128.202:5000/marker?value=" + encodeURIComponent(value) + "&ts=" + encodeURIComponent(ts) // change IPv4 address as appropriate
    fetch(url)
        .then(function () {
            console.log("sent marker", value, "ts", ts)
        })
        .catch(function (err) {
            console.error("Marker send error:", err)
        })
}


// Condition assignment ============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    assignCondition
    return array
}

function assignCondition(stimuli_list) {
    let new_stimuli_list = []

    // Access demographic data
    let demographic_data = jsPsych.data
        .get()
        .filter({ screen: "demographic_questions2" })
        .values()[0]
    let gender = demographic_data.response.Gender
    let sexuality = demographic_data.response.SexualOrientation
    let choice = demographic_data.response.StimuliChoice

    // Define the stimuli categories based on Gender and Sexuality

    let stimuliCategory = []
    if (choice) {
        if (choice === "Women (and heterosexual couples)") {
            stimuliCategory = ["Female", "Opposite-sex Couple"]
        } else if (choice === "Men (and heterosexual couples)") {
            stimuliCategory = ["Male", "Opposite-sex Couple"]
        } else if (choice === "Only women (and lesbian couples)") {
            stimuliCategory = ["Female", "Female Couple"]
        } else if (choice === "Only men (and gay couples)") {
            stimuliCategory = ["Male", "Male Couple"]
        }
    } else if (sexuality === "Heterosexual") {
        if (gender === "Male") {
            stimuliCategory = ["Female", "Opposite-sex Couple"]
        } else if (gender === "Female") {
            stimuliCategory = ["Male", "Opposite-sex Couple"]
        }
    } else if (sexuality === "Homosexual") {
        if (gender === "Male") {
            stimuliCategory = ["Male", "Male Couple"]
        } else if (gender === "Female") {
            stimuliCategory = ["Female", "Female Couple"]
        }
    } else {
        console.error("Unexpected demographic data.")
        return []
    }

    // Loop through unique categories in stimuli_list
    for (let cat of [...new Set(stimuli_list.map((a) => a.Category))]) {
        // Get all stimuli of this category
        let cat_stimuli = stimuli_list.filter((a) => a.Category === cat)

        // Shuffle cat_stimuli (assuming shuffleArray is defined elsewhere)
        cat_stimuli = shuffleArray(cat_stimuli)

        // Assign half to "Reality" condition and half to "Fiction" condition
        for (let i = 0; i < cat_stimuli.length; i++) {
            cat_stimuli[i].Condition =
                i < cat_stimuli.length / 2 ? "Reality" : "Fiction"
        }

        // Filter cat_stimuli based on the determined stimuli categories
        cat_stimuli = cat_stimuli.filter((stimulus) =>
            stimuliCategory.includes(stimulus.Category)
        )

        // Add to new_stimuli_list
        new_stimuli_list.push(...cat_stimuli)
    }

    return shuffleArray(new_stimuli_list)
}

// Variables ===================================================================
var fiction_trialnumber = 1
var color_cues = shuffleArray(["red", "blue", "green"])
color_cues = { Reality: color_cues[0], Fiction: color_cues[1] }
var text_cue = { Reality: "Photograph", Fiction: "AI-generated" }

// Screens =====================================================================

//instructions for phase 1
const fiction_instructions1 = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionNumbers: false,
        completeText: "Start",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "fiction_instructions_page1",
                        html: `
                        <div class="narrow-text" style="max-width: 900px; margin: 0 auto; text-align: left;">
                <h2> The Experiment</h2>
                <p>This study stems from a partnership between researchers from the <b>University of Sussex</b> and an <b>AI startup</b> based in Brighton, UK, focused on developing ethical AI technology.</p>
                <p>Our goal is to understand how different people react to various images. To do so, we use a new <b>image-generation algorithm</b> (based on a modified <i>Generative Adversarial Network</i>) trained on curated material to produce realistic, high-quality erotic images. This allows us to systematically manipulate features and study their effects on perception.</p>
                <p>The animation below illustrates how a traditional <i>GAN</i> generates face images. Our enhanced version extends this to full-body images, including multi-person scenes, by refining the latent space derived from the training data.</p>
                <p>If you are interested, more technical details will be available at the end of the experiment.</p>
                <div style='text-align: center;'><img src='media/gan.gif' height='200'></img></div>
                </div>
                <audio autoplay>
                <source src = "utils/ding.mp3" type="audio/mpeg">
                </audio>
                </div>
                `,
                    },
                ],
            },
            {
                elements: [
                    {
                        type: "html",
                        name: "fiction_instructions_page2",
                        html: `
              <div class="narrow-text" style="max-width: 900px; margin: 0 auto; text-align: left;">
                <h2>Instructions</h2>
                <p>In the next part, you will be presented with images generated by our algorithm (labeled '<b style='color:${color_cues["Fiction"]}'>AI-generated</b>'), intermixed with real photographs (labeled '<b style='color:${color_cues["Reality"]}'>Photograph</b>') from public image databases.</p>
                <p>Each image will be <b>briefly flashed</b>. Try to observe the image as though it were real, as if you were actually present in the scene. After each image, you will answer a few questions:</p>
                
                <ul style='margin-left: 5%; margin-right: 5%;'>
                <ul>
                <li><b>Body Reaction</b>: How much did you feel your body physically respond to the image? Think about sensations like tension, warmth in your body, or changes in heart rate or breathing.</li>
                <li><b>Valence</b>: How did you feel overall when viewing the image, ranging from negative to positive? Consider that feeling positive can also equate to feeling psychologically aroused.</li>
                <li><b>Enticement</b>: How sexually appealing do you think most people would find this image?</li>
                </ul>

                </div>
                <div class="narrow-text" style="max-width: 900px; margin: 0 auto; text-align: left;">

                <p>While these questions might seem similar, they capture different reactions. For example, an image can make you feel mentally aroused or emotionally stirred without causing a strong reaction in your body, and vice versa.</p>
                <p><b>Please pay attention to how the images make you feel in your mind and body. Respond according to your <i>gut reactions</i>.</b></p>
                <p>Below is an example of the rating screen you will see after each image:</p>
                <div style='text-align: center;'><img src='media/scales_phase1.png' height='400' style='border:5px solid #D3D3D3; padding:3px; margin:5px'></img></div>
                <p style='text-align: center;'>Press <b>Start</b> when you are ready.</p>
              </div>
            `,
                    },
                ],
            },
        ],
    },
    data: { screen: "fiction_instructions1" },
}

const fiction_instructions2 = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionNumbers: false,
        completeText: "Start",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "fiction_instructions_page1",
                        html: `
                <div style='text-align: center;'><img src='media/phase2_img.png' height='350' align='right'></img></div>
                <h2> Instructions</h2>
                <p><b>Thank you for staying with us so far!</b></p>
                <p>There is <b>something important</b> we need to reveal... In the previous phase, the labels ('<b style="color: ${color_cues["Fiction"]}">AI-generated</b>' or '<b style="color: ${color_cues["Reality"]}">Photograph</b>') were actually <b>mixed-up</b>! As a result, they were correct for some images but wrong for others (e.g., the label said "AI" but the image was actually a photo, or vice versa).</p>
                <p>In this final phase, we want you to try to identify <b>the correct category</b> of each image. We will briefly present all the images once more, followed by one question about whether you think the image is a real photograph from the original picture database or an AI-generated image</p>
                <p>Sometimes, it is hard to tell, but don't overthink it and <b>go with your gut feeling</b>. At the end, we will tell you if you were correct or wrong!</p>
                </div>
                <p style='text-align: left';>Press start once you are ready.</p>
                <div style='text-align: center;'><img src='media/scales_phase2.png' height='170' style='border:5px solid #D3D3D3; padding:3px; margin:5px'></img></div>
                </div>
                <audio autoplay>
                <source src = "utils/ding.mp3" type="audio/mpeg">
                </audio>
                </div>
                `,
                    },
                ],
            },
        ],
    },
    data: { screen: "fiction_instructions2" },
}

// preload stimuli
const fiction_preloadstims = {
    type: jsPsychPreload,
    message:
        "Please wait while the experiment is being loaded (it can take a few seconds)",
    images: stimuli_list.map((a) => "stimuli/" + a.stimulus),
    on_load: function () {
        stimuli = assignCondition(stimuli_list)
    },
}

// // Blank screen
// var fiction_blankscreen = {
//     type: jsPsychHtmlKeyboardResponse,
//     stimulus: "",
//     choices: ["s"],
//     trial_duration: 3000, // 3 seconds
//     save_trial_parameters: { trial_duration: true },
//     data: { screen: "blank_screen" },
// }

// fixation cross 1
const fiction_fixation1a = {
    type: jsPsychHtmlKeyboardResponse,
    // on_start: function () {
    //     document.body.style.cursor = "none"
    // },
    stimulus:
        "<div style='font-size:500%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'>+</div>",
    choices: ["s"],
    trial_duration: 3000,
    // function () {
    //     // uniformly sample between 300 and 600 ms, rounded to the nearest integer
    //     return Math.round(Math.random() * 300 + 300)
    // },
    save_trial_parameters: { trial_duration: true },
    data: function () {
        return {
            screen: "fiction_fixation1a",
            item: jsPsych.evaluateTimelineVariable("stimulus"),
        }
    },
}

// stimuli cue
const fiction_cue = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        var cond = jsPsych.evaluateTimelineVariable("Condition")
        return (
            "<div style='font-size:450%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%; color: " +
            color_cues[cond] +
            "'><b>" +
            text_cue[cond] +
            "</b></div>"
        )
    },
    data: function () {
        var cond = jsPsych.evaluateTimelineVariable("Condition")
        return {
            screen: "fiction_cue",
            color: color_cues[cond],
            condition: cond,
            item: jsPsych.evaluateTimelineVariable("stimulus"),
        }
    },
    choices: ["s"],
    trial_duration: 2000,
    save_trial_parameters: { trial_duration: true },
}

// fixation cross 2
const fiction_fixation1b = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus:
        "<div style='font-size:500%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'>+</div>",
    choices: ["s"],
    trial_duration: function () {
        // uniformly sample between 3s and 5s, rounded to the nearest integer
        return Math.round(Math.random() * 2000 + 3000)
    },
    save_trial_parameters: { trial_duration: true },
    data: function () {
        return {
            screen: "fiction_fixation1b",
            item: jsPsych.evaluateTimelineVariable("stimulus"),
        }
    },
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: { targets: ["#jspsych-html-keyboard-response-stimulus"] },
        },
    ],
}

// image shown
const fiction_showimage1 = {
    type: jsPsychImageKeyboardResponse,
    on_start: function () {
        document.body.style.backgroundColor = "white"
        document.body.style.cursor = "none"
        create_marker(marker1, (color = "#010000ff"));
        sendMarker("1");
    },
    stimulus: function () {
        return "stimuli/" + jsPsych.evaluateTimelineVariable("stimulus")
    },
    stimulus_height: function () {
        if (window.innerHeight < window.innerWidth) {
            return Math.round(0.9 * window.innerHeight)
        } else {
            return null
        }
    },
    stimulus_width: function () {
        if (window.innerHeight > window.innerWidth) {
            return Math.round(0.9 * window.innerWidth)
        } else {
            return null
        }
    },
    trial_duration: 4000,
    choices: ["s"],
    save_trial_parameters: { trial_duration: true },
    data: function () {
        return {
            screen: "fiction_image1",
            window_width: window.innerWidth,
            window_height: window.innerHeight,
            trial_number: fiction_trialnumber,
        }
    },
    on_finish: function () {
        fiction_trialnumber += 1
        document.querySelector("#marker1").remove()
        sendMarker("0");
        document.body.style.cursor = "auto"
    },
    // Enable webgazer
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: { targets: ["#jspsych-image-keyboard-response-stimulus"] },
        },
    ],
}

// Ratings ==========================================================================

// Oosterhof and Todorov (2008) - 9 point scale (Not at all to Extremely) TRAIT VARIABLES
const fiction_ratings1 = {
    type: jsPsychSurvey,
    survey_json: {
        goNextPageAutomatic: false,
        showQuestionNumbers: false,
        showNavigationButtons: true,
        completeText: "Continue",
        title: function () {
            return (
                "Rating - " +
                Math.round(((fiction_trialnumber - 1) / stimuli.length) * 100) +
                "%"
            )
        },
        description: "Think of the person or people that you just saw.",
        pages: [
            {
                elements: [
                    {
                        type: "slider",
                        name: "Body_Reaction",
                        title: "How much did you feel your body react when looking at this image?",
                        isRequired: true,
                        min: 0,
                        max: 100,
                        step: 1,
                        customLabels: [
                            {
                                value: 0,
                                text: "Not at all",
                            },
                            {
                                value: 100,
                                text: "Strong reaction",
                            },
                        ],
                        validators: [
                            {
                                type:"expression",
                                expression: "{Body_Reaction} != 50",
                                text: "Please indicate a preference (choose a value other than 50)."
                            }
                        ]
                    },
                    {
                        type: "rating",
                        name: "Valence",
                        title: "How did you feel while viewing this image?",
                        isRequired: true,
                        rateMin: 0,
                        rateMax: 6,
                        minRateDescription: "Negative",
                        maxRateDescription: "Positive",
                        displayMode: "buttons",
                        rateType: "smileys",
                        scaleColorMode: "colored",
                    },
                    {
                        type: "rating",
                        name: "Enticement",
                        title: "How sexually appealing do you think this image is for people like you?",
                        isRequired: true,
                        rateMin: 0,
                        rateMax: 6,
                        minRateDescription: "Not at all",
                        maxRateDescription: "Very much",
                        displayMode: "buttons",
                    },
                ],
            },
        ],
    },
    data: {
        screen: "fiction_ratings1",
    },
}

const fiction_phase1_break = {
    type: jsPsychSurvey,
    survey_json: {
        showQuestionNumbers: false,
        completeText: "Ready to continue!",
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        name: "fiction_phase1_break_message",
                        html: `
              <div class="narrow-text" style="max-width: 800px; margin: 0 auto; text-align: left;">
                <h2>Break Time</h2>
                <p>We know that experiments like this can feel a bit repetitive or tedious, but it is important for us that you stay focused until the end.</p>
                <p>Please take this opportunity to <b>take a short break and relax your neck and eyes</b> before continuing.</p>
              </div>
            `,
                    },
                ],
            },
        ],
    },
    data: { screen: "fiction_phase1_break" },
}

// Stage 2 loops and variables

var fiction_fixation2 = {
    type: jsPsychHtmlKeyboardResponse,
    // on_start: function () {
    //     document.body.style.cursor = "none"
    // },
    stimulus:
        "<div  style='font-size:500%; position:fixed; text-align: center; top:50%; bottom:50%; right:20%; left:20%'>+</div>",
    choices: ["s"],
    trial_duration: function () {
        // uniformly sample between 400ms and 600ms, rounded to the nearest integer
        return Math.round(Math.random() * 200 + 400)
    },
    save_trial_parameters: { trial_duration: true },
    data: { screen: "fiction_fixation2" },
}

var fiction_showimage2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: function () {
        return "stimuli/" + jsPsych.evaluateTimelineVariable("stimulus")
    },
    on_start: function () {
        document.body.style.backgroundColor = "white"
        document.body.style.cursor = "none"
        create_marker(marker1, (color = "#010000ff"));
        sendMarker("1");
    },
    stimulus_height: function () {
        if (window.innerHeight < window.innerWidth) {
            return Math.round(0.9 * window.innerHeight)
        } else {
            return null
        }
    },
    stimulus_width: function () {
        if (window.innerHeight > window.innerWidth) {
            return Math.round(0.9 * window.innerWidth)
        } else {
            return null
        }
    },
    trial_duration: 1000,
    choices: ["s"],
    save_trial_parameters: { trial_duration: true },
    data: { screen: "fiction_image2", trial_number: fiction_trialnumber },
    on_finish: function () {
        fiction_trialnumber += 1
        document.querySelector("#marker1").remove()
        sendMarker("0");
        document.body.style.cursor = "auto"
    },
}

var fiction_ratings2 = {
    type: jsPsychSurvey,
    survey_json: {
        goNextPageAutomatic: false,
        showQuestionNumbers: false,
        showNavigationButtons: true,
        completeText: "Continue",
        title: function () {
            return (
                "Rating - " +
                Math.round(((fiction_trialnumber - 1) / stimuli.length) * 100) +
                "%"
            )
        },
        pages: [
            {
                elements: [
                    {
                        type: "html",
                        html: "The labels we showed you in the previous phase have been mixed up! Can you tell to what category each image belongs?",
                    },
                    {
                        type: "slider",
                        name: "Realness",
                        title: "I think this image is...",
                        description:
                            "Indicate your confidence that the image is fake or real",
                        isRequired: true,
                        min: -100,
                        max: 100,
                        step: 1,
                        customLabels: [
                            {
                                value: -100,
                                text: "AI-Generated",
                            },
                            {
                                value: 100,
                                text: "Photograph",
                            },
                        ],
                        validators: [
                            {
                                type:"expression",
                                expression: "{Realness} != 0",
                                text: "Please indicate a preference (choose a value other than 0)."
                            }
                        ],
                        defaultValue: 0,
                    },
                ],
            },
        ],
    },
    data: {
        screen: "fiction_ratings2",
    },
}

// Feedback ====================================================================

var fiction_feedback1 = {
    type: jsPsychSurvey,
    survey_json: {
        title: "Thank you!",
        description:
            "Before we start the second phase, we wanted to know your thoughts.",
        showQuestionNumbers: false,
        elements: [
            {
                type: "checkbox",
                name: "Feedback_1",
                title: "Image Arousal",
                description: "Please select all that apply",
                choices: [
                    "Some images were really arousing",
                    "No image was particularly arousing",
                    "AI-generated images were more arousing than the photos",
                    "AI-generated images were less arousing than the photos",
                ],
                showOtherItem: true,
                showSelectAllItem: false,
                showNoneItem: false,
            },
            {
                type: "checkbox",
                name: "Feedback_2",
                title: "AI-Generation Algorithm",
                description: "Please select all that apply",
                choices: [
                    "The difference between the photos and the AI-generated images was obvious",
                    "The difference between the photos and the AI-generated images was subtle",
                    "I didn't see any difference between photos and AI-generated images",
                    "I felt like the labels ('Photograph' and 'AI-Generated') were not always correct",
                    "I felt like the labels were reversed (e.g., 'Photograph' for AI-generated images and vice versa)",
                    "I feel like all the images were photos",
                    "I feel like all the images were AI-generated",
                ],
                showOtherItem: true,
                showSelectAllItem: false,
                showNoneItem: false,
            },
            {
                visibleIf:
                    "{Feedback_2} anyof ['I feel like all the images were photos']",
                title: "How certain are you that all images were photos?",
                name: "Feedback_2_ConfidenceReal",
                type: "rating",
                rateMin: 0,
                rateMax: 5,
                minRateDescription: "Not at all",
                maxRateDescription: "Completely certain",
            },
            {
                visibleIf:
                    "{Feedback_2} anyof ['I feel like all the images were AI-generated']",
                title: "How certain are you that all images were AI-generated?",
                name: "Feedback_2_ConfidenceFake",
                type: "rating",
                rateMin: 0,
                rateMax: 5,
                minRateDescription: "Not at all",
                maxRateDescription: "Completely certain",
            },
        ],
    },
    data: {
        screen: "fiction_feedback1",
    },
}