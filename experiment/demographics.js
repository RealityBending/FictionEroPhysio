// // Full screen
// const fullscreen_on = {
//     type: jsPsychFullscreen,
//     fullscreen_mode: true,
//     delay_after: 0,
// }

// const fullscreen_off = {
//     type: jsPsychFullscreen,
//     fullscreen_mode: false,
//     delay_after: 0,
// }


// Consent form

const demographics_consent = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ["narrow-text"],
    stimulus: function () {
        // Logo and title
        let text =
            "<img src='https://blogs.brighton.ac.uk/sussexwrites/files/2019/06/University-of-Sussex-logo-transparent.png' width='150px' align='right'/><br><br><br><br><br>" +
            "<h1>Informed Consent</h1>"
        // Consent Form
        text +=
            // Overview
            "<p align='left'><b>Invitation to Take Part</b><br>" +
            "Thank you for considering to take part in this study that aims at deepening our understanding of human perception. " +
            "This study is being conducted by Dr Dominique Makowski, and his team, from the <b>University of Sussex</b>, who are happy to be contacted if you have any questions (see contact information below).</p>" +
            // Description
            "<p align='left'><b>Why have I been invited and what will I do?</b><br>" +
            "The goal is to study how new technology can impact <b>human perception</b>." +
            " In this study, you will be shown <b>erotic images</b> and asked to complete a few questionnaires and perform some tasks. " +
            "We will also measure your physiological processes to assess the relationship between how you experience your body and how you perceive the world." +
            //Physiological signals
            "<p align='left'><b>Physiological Signals</b><br>" +
            "We will be recording some of your body's electric activity using ECG and EEG; both are simple non-intrusive procedures used in research and in the life sciences. " +
            "Since this study is being undertaken for research purposes only, we will not be able to provide any feedback or information on clinical aspects of the data obtained. " +
            "For the ECG we will be attaching some sensors to the skin, and for the EEG we will be using the Muse 2 headset which contains electrodes that will be placed in your forehead and behind the ears. " +
            "We kindly ask that you refrain from participating if you are aware of having skin reactions or allergies to adhesives or the materials used in the electrodes -\ primarily composed of silver and silver chloride." +
            // Results and personal information
            "<p align='left'><b>What will happen to the results and my personal information?</b><br>" +
            "The results of this research may be written into a scientific publication. Your anonymity will be ensured in the way described in the consent information below. <b>Please read this information carefully</b> and then, if you wish to take part, please acknowledge that you have fully understood this sheet, and that you consent to take part in the study as it is described here.</p>" +
            "<p align='left'><b>Consent</b><br></p>" +
            // Bullet points
            "<li style = 'text-align: justify; padding-left: 20px; list-style-position: inside'> I understand that by signing below I am agreeing to take part in the University of Sussex research described here, and that I have read and understood this information sheet</li>" +
            "<li style = 'text-align: justify; padding-left: 20px; list-style-position: inside'> I understand that my participation is entirely voluntary, that I can choose not to participate in part or all of the study, and that I can withdraw at any stage without having to give a reason and without being penalized in any way. </li>" +
            "<li style = 'text-align: justify; padding-left: 20px; list-style-position: inside'> I understand that since the study is anonymous, it will be impossible to withdraw my data once I have completed it.</li>" +
            "<li style = 'text-align: justify; padding-left: 20px; list-style-position: inside'> I understand that my personal data will be used for the purposes of this research study and will be handled in accordance with Data Protection legislation." +
            "I understand that the University's Privacy Notice provides further information on how the University uses personal data in its research.</li>" +
            "<li style = 'text-align: justify;padding-left: 20px; list-style-position: inside'> I understand that my collected data will be stored in a de-identified way. De-identified data may be made publicly available through secured scientific online data repositories.</li>" +
            "<li style = 'text-align: justify;padding-left: 20px; list-style-position: inside'> I understand that due to the explicit nature of the images, <b>I confirm that I am 18 years of age or older</b>.</li>" +
            // Incentive
            "<li style = 'text-align: justify; padding-left: 20px; list-style-position: inside'>Please note that various checks will be performed to ensure the validity of the data. We reserve the right to withhold credit awards or reimbursement should we detect non-valid responses (e.g., random patterns of answers, instructions not read, ...).</li>" +
            "</p>" +
            "<p align='left'><br><sub><sup>For further information about this research, or if you have any concerns, please contact Dr Dominique Makowski (<i style='color:DodgerBlue;'>D.Makowski@sussex.ac.uk</i>), Ana Neves (<i style='color:DodgerBlue;'>A.Neves@sussex.ac.uk</i>) or Maisie Bennett (<i style='color:DodgerBlue;'>mb2021@sussex.ac.uk</i>). " +
            "This research has been approved (xx/xxx/xx) by the ethics board of the School of Psychology. The University of Sussex has insurance in place to cover its legal liabilities in respect of this study.</sup></sub></p>"
        return text
    },
    choices: ["I read, understood, and I consent"],
    data: { screen: "consent" },
}

// Demographics info 

const demographics_questions1 = {
    type: jsPsychSurvey,
    survey_json: {
        title: "About yourself",
        completeText: "Continue",
        pageNextText: "Next",
        pagePrevText: "Previous",
        goNextPageAutomatic: false,
        showQuestionNumbers: false,
        pages: [
            {
                elements: [
                    {
                        title: "Enter the participant's ID:",
                        type: "text",
                        placeholder: "000",
                        name: "Participant_ID",
                        isRequired: true
                    }
                ]
            },
            {
                elements: [
                    {
                        title: "What is your highest completed education level?",
                        name: "Education",
                        type: "radiogroup",
                        choices: [
                            {
                                value: "Doctorate",
                                text: "University (doctorate)",
                            },
                            {
                                value: "Master",
                                text: "University (master)", // "<sub><sup>or equivalent</sup></sub>",
                            },
                            {
                                value: "Bachelor",
                                text: "University (bachelor)", // "<sub><sup>or equivalent</sup></sub>",
                            },
                            {
                                value: "High school",
                                text: "High school",
                            },
                            {
                                value: "Elementary school",
                                text: "Elementary school",
                            },
                        ],
                        showOtherItem: true,
                        otherText: "Other",
                        otherPlaceholder: "Please specify",
                        isRequired: true,
                        colCount: 1,
                    },
                    {
                        visibleIf:
                            "{Education} == 'Doctorate' || {Education} == 'Master' || {Education} == 'Bachelor'",
                        title: "What is your discipline?",
                        name: "Discipline",
                        type: "radiogroup",
                        choices: [
                            "Arts and Humanities",
                            "Literature, Languages",
                            "History, Archaeology",
                            "Sociology, Anthropology",
                            "Political Science, Law",
                            "Business, Economics",
                            "Psychology, Neuroscience",
                            "Medicine",
                            "Biology, Chemistry, Physics",
                            "Mathematics, Physics",
                            "Engineering, Computer Science",
                        ],
                        showOtherItem: true,
                        otherText: "Other",
                        otherPlaceholder: "Please specify",
                    },
                    {
                        visibleIf:
                            "{Education} == 'High school' || {Education} == 'Master' || {Education} == 'Bachelor'",
                        title: "Are you currently a student?",
                        name: "Student",
                        type: "boolean",
                        swapOrder: true,
                        isRequired: true,
                    },
                ],
            },
            {
                elements: [
                    {
                        title: "How would you describe your ethnicity?",
                        name: "Ethnicity",
                        type: "radiogroup",
                        choices: [
                            "White",
                            "Black",
                            "Hispanic/Latino",
                            "Middle Eastern/North African",
                            "South Asian",
                            "East Asian",
                            "Southeast Asian",
                            "Mixed",
                            "Prefer not to say",
                        ],
                        showOtherItem: true,
                        otherText: "Other",
                        otherPlaceholder: "Please specify",
                        isRequired: false,
                        colCount: 1,
                    },
                    {
                        title: "In which country are you currently living?",
                        name: "Country",
                        type: "dropdown",
                        choicesByUrl: {
                            url: "https://surveyjs.io/api/CountriesExample",
                        },
                        placeholder: "e.g., France",
                        isRequired: false,
                    },
                ],
            },
        ],
    },
    data: {
        screen: "demographic_questions1",
    },
}

const demographics_data2 = {
    type: jsPsychSurvey,
    survey_json: {
        title: "About yourself",
        completeText: "Continue",
        pageNextText: "Next",
        pagePrevText: "Previous",
        goNextPageAutomatic: false,
        showQuestionNumbers: false,
        pages: [
            {
                elements: [
                    {
                        title: "What is your gender?",
                        name: "Gender",
                        type: "radiogroup",
                        choices: ["Male", "Female", "Other"],
                        isRequired: true,
                        colCount: 0,
                    },
                ],

                elements: [
                    {
                        title: "What sexual orientation do you identify with?",
                        description:
                            "These questions are important to understand the results in the latter part of the experiment.",
                        name: "SexualOrientation",
                        type: "radiogroup",
                        choices: ["Heterosexual", "Homosexual", "Bisexual"],
                        showOtherItem: true,
                        otherText: "Other",
                        otherPlaceholder: "Please specify",
                        isRequired: true,
                        colCount: 1,
                    },
                    {
                        visibleIf:
                            "{Gender} == 'Other' || {SexualOrientation} == 'Bisexual' || {SexualOrientation} == 'Other'",
                        title: "Which types of images do you find the most arousing?",
                        description:
                            "The following tasks will involve erotic images, please specify which category of images you would prefer to see.",
                        name: "StimuliChoice",
                        type: "radiogroup",
                        choices: [
                            "Women (and heterosexual couples)",
                            "Men (and heterosexual couples)",
                            "Only women (and lesbian couples)",
                            "Only men (and gay couples)",
                        ],
                        isRequired: true,
                        colCount: 1,
                    },
                    {
                        title: "I am currently...",
                        name: "SexualStatus",
                        type: "radiogroup",
                        choices: [
                            "Single and not open to dating",
                            "Single and open to dating",
                            "In a relationship and not open to dating",
                            "In a relationship and open to dating",
                        ],
                        showOtherItem: true,
                        otherText: "Other",
                        otherPlaceholder: "Please specify",
                        isRequired: true,
                        colCount: 1,
                    },
                ],
            },
        ]
    },
    data: {
        screen: "demographic_questions2",
    }
}


// Thank you ========================================================================

const experiment_feedback = {
    type: jsPsychSurvey,
    survey_json: {
        title: "Feedback",
        description:
            "It is the end of the experiment! Don't hesitate to leave us a feedback." +
            "After clicking 'Complete', your data will be saved on our secure servers, after what we will provide you with more information about the study.",
        completeText: "Complete the experiment",
        showQuestionNumbers: false,
        pages: [
            {
                elements: [
                    {
                        type: "rating",
                        name: "Feedback_Enjoyment",
                        title: "Did you enjoy doing this experiment?",
                        isRequired: false,
                        rateMin: 0,
                        rateMax: 4,
                        rateType: "stars",
                    },
                    {
                        type: "comment",
                        name: "Feedback_Text",
                        title: "Anything else you would like to share with us?",
                        isRequired: false,
                    },
                ],
            },
        ],
    },
    data: {
        screen: "experiment_feedback",
    },
}

const demographics_debriefing = {
    type: jsPsychHtmlButtonResponse,
    css_classes: ["narrow-text"],
    stimulus:
        "<h2>Debriefing</h2>" +
        "<p align='left'>The purpose of this study was actually to study the effect on sexual arousal of <i>believing</i> that the content is AI-generated. " +
        "Indeed, we want to test the hypothesis that believing that erotic images are fake would lead to a lower sexual arousal. " +
        //add aim for collecting physiological data + 
        "As we are primarily interested in your <i>beliefs</i> about reality, all images were in fact taken from an existing database of real images used in psychology research to study emotions. " +
        "We apologize for the necessary deception used in the instructions, and we hope that you understand its role in ensuring the validity of our experiment.</p>" +
        "<p align='left'><b>Thank you again!</b> Your participation in this study will be kept completely confidential. If you have any questions or concerns about the project, please contact <i style='color:DodgerBlue;'>D.Makowski@sussex.ac.uk</i> and/or <i style='color:DodgerBlue;'>A.Neves@sussex.ac.uk</i>" +
        "<p>To complete your participation in this study, click on 'Continue' and <b>wait until your responses have been successfully saved</b> before closing the tab.</p> ",
    choices: ["Continue"],
    data: { screen: "debriefing" },
}

var demographics_endscreen = {
    type: jsPsychSurvey,
    survey_json: function () {
        text =
            "<h2 style='color:green;'>Data saved successfully!</h2>" +
            "<p>Thank you for participating, it means a lot to us.</p> " +
            "<p><b>You can safely close the tab now.</b></p>"

        // Return survey
        return {
            showQuestionNumbers: false,
            completeText: "End",
            pages: [
                {
                    elements: [
                        {
                            type: "html",
                            name: "Endscreen",
                            html: text,
                        },
                    ],
                },
            ],
        }
    },
    data: {
        screen: "demographics_endscreen",
    },
}
