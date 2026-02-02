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

const RS_instructions = {
  type: jsPsychSurvey,
  survey_json: {
    showQuestionNumbers: false,
    completeText: "Continue",
    pages: [
      {
        elements: [
          {
            type: "html",
            name: "instructions_RS",
            html: `
              <audio autoplay>
                <source src="utils/ding.mp3" type="audio/mpeg">
              </audio>
              <div style="text-align: center;"> 
                <h2>Resting State</h2>
                <h3><b>Instructions</b></h3>
              </div>
              <div style="display: flex; gap: 20px; align-items: flex-start; max-width: 1000px; margin: 0 auto;">
                <div style="flex: 2; text-align: center;">
                  <p>A rest period of about 8 minutes is about to start.</p>
                  <p>Please <b>relax</b> and remain seated quietly with your eyes closed. Try <b style="color: #E91E63;">not to fall asleep</b>.</p>
                  <p>Once the resting period is over, you will hear a beep. You can then open your eyes and continue with the experiment.</p>
                  <p>When you are ready, close your eyes. The rest period will begin shortly.</p>
                </div>
              </div>
            `
          }
        ]
      }
    ]
  },
  data: { screen: "RS_Instructions" }
};

// Resting state questionnaire
const rs_items = {
    DoM_1: "I had busy thoughts",
    DoM_2: "I had rapidly switching thoughts",
    DoM_3: "I had difficulty holding onto my thoughts",
    ToM_1: "I thought about others",
    ToM_2: "I thought about people I like",
    ToM_3: "I placed myself in other people's shoes",
    Self_1: "I thought about my feelings",
    Self_2: "I thought about my behaviour",
    Self_3: "I thought about myself",
    Plan_1: "I thought about things I need to do",
    Plan_2: "I thought about solving problems",
    Plan_3: "I thought about the future",
    Sleep_1: "I felt sleepy",
    Sleep_2: "I felt tired",
    Sleep_3: "I had difficulty staying awake",
    Comfort_1: "I felt comfortable",
    Comfort_2: "I felt happy",
    Comfort_3: "I felt relaxed",
    SomA_1: "I was conscious of my body",
    SomA_2: "I thought about my heartbeat",
    SomA_3: "I thought about my breathing",
}

// Convenience function to shuffle an object (used internally)
function shuffleObject(obj) {
    const entries = Object.entries(obj)
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[entries[i], entries[j]] = [entries[j], entries[i]]
    }
    return Object.fromEntries(entries)
}

// Tasks ======================================================================
// Create blank grey screen just before rest period
var RS_buffer = {
    type: jsPsychHtmlKeyboardResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#808080"
        document.body.style.cursor = "none"
        create_marker(marker1, (color = "white")) // create black screen
    },
    on_finish: function () {
        document.querySelector("#marker1").remove()
    },
    stimulus: "",
    choices: ["s"],
    trial_duration: 1000, // 1 second
    css_classes: ["RS_fixation"],
}

// Create blank grey screen for resting state
var RS_task = {
    type: jsPsychHtmlKeyboardResponse,
    on_load: function () {
        create_marker(marker1);
        sendMarker("1");
        // create_marker_2(marker2)
    },
    stimulus: "<p style='font-size:150px;'>+</p>",
    choices: ["s"],
    trial_duration: 8 * 60 * 1000,
    css_classes: ["fixation"],
    data: {
        screen: "RS_resting",
        time_start: function () {
            return performance.now()
        },
    },
    on_finish: function (data) {
        document.querySelector("#marker1").remove()
        sendMarker("0");
        // document.querySelector("#marker2").remove()
        data.duration = (performance.now() - data.time_start) / 1000 / 60
    },
}

// Play beep
var RS_beep = {
    type: jsPsychAudioButtonResponse,
    on_start: function () {
        document.body.style.backgroundColor = "#FFFFFF"
        document.body.style.cursor = "auto"
    },
    stimulus: ["utils/beep.mp3"],
    prompt: "<p>It's over! Please press continue.</p>",
    choices: ["Continue"],
}

// Debriefing Questionnaire ========================================================================

function rs_questions(
    items,
    required = true,
    ticks = ["Completely Disagree", "Completely Agree"]
) {
    items = shuffleObject(items)

    questions = []
    for (const key of Object.keys(items)) {
        q = {
            title: items[key],
            name: key,
            type: "rating",
            displayMode: "buttons",
            isRequired: required,
            minRateDescription: ticks[0],
            maxRateDescription: ticks[1],
            rateValues: [0, 1, 2, 3, 4, 5, 6],
        }
        questions.push(q)
    }
    return [
        {
            elements: questions,
            description:
                "We are interested in the potential feelings and thoughts you may have experienced during the resting period." +
                " Please indicate the extent to which you agree with each statement.",
        },
    ]
}

// Questions
const RS_questionnaire = {
    type: jsPsychSurvey,
    survey_json: {
        title: "About the resting period",
        showQuestionNumbers: false,
        goNextPageAutomatic: true,
        // showProgressBar: "aboveHeader",
        pages: rs_questions(rs_items),
    },
    data: {
        screen: "questionnaire_RS",
    },
}
