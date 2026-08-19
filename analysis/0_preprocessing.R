library(jsonlite)
library(progress)
library(tidyverse)

path <- "C:/Users/asf25/Box/FictionEroPhysio/raw/beh/"

files <- list.files(path, pattern = "*.json") 

participants <- sort(unique(sub("_.*", "", files)))


# Progress bar
progbar <- progress_bar$new(total = length(files))

alldata <- list()
alldata_fic <- list()
alldata_int <- list()

for (ppt in participants) {
  progbar$tick()
  
  
  # PARTCIPANT DATA ===========================================================
  rawdata_db  <- fromJSON(file.path(path, paste0(ppt, "_db.json")))
  rawdata_int <- fromJSON(file.path(path, paste0(ppt, "_int.json")))
  rawdata_fic <- fromJSON(file.path(path, paste0(ppt, "_fic.json")))
  rawdata_rs <- fromJSON(file.path(path, paste0(ppt, "_rs.json")))
  
  #Demographics 
  demo_1 <- rawdata_rs$response[[which(rawdata_rs$screen == "demographic_questions1")]]
  demo_1[sapply(demo_1, is.null)] <- NA
  df_demo_1 <- as.data.frame(demo_1, check.names = FALSE)
  
  demo_2 <- rawdata_fic$response[[which(rawdata_fic$screen == "demographic_questions2")]]
  demo_2[sapply(demo_2, is.null)] <- NA
  df_demo_2 <- as.data.frame(demo_2, check.names = FALSE)
  
  df_demo <- merge(df_demo_1, df_demo_2, by = "Gender")
  df_demo <- cbind(Participant = ppt, df_demo)
  
  # Resting State 
  rs <- rawdata_rs$response[[which(rawdata_rs$screen == "questionnaire_RS")]]
  df_rs <- as.data.frame(rs)
  
  df_ppt <- cbind(df_demo, df_rs)
  
  # Questionnaires ========================================
  
  # BAIT 
  bait <- rawdata_fic$response[[which(rawdata_fic$screen == "questionnaire_bait")]]
  bait <- as.data.frame(bait)
  
  df_ppt <- cbind(df_ppt, bait)   
  
  # MAIA 
  maia <- rawdata_int$response[[which(rawdata_int$screen == "questionnaire_maia")]]
  maia <- as.data.frame(maia)
  
  df_ppt <- cbind(df_ppt, maia)  
  
  # Mint
  mint <- rawdata_int$response[[which(rawdata_int$screen == "questionnaire_mint")]]
  mint <- as.data.frame(mint)
  
  df_ppt <- cbind(df_ppt, mint)  
  
  # IAS
  ias <- rawdata_int$response[[which(rawdata_int$screen == "questionnaire_ias")]]
  ias <- as.data.frame(ias)
  
  df_ppt <- cbind(df_ppt, ias)  
  
  # Task Feedback
  
  fb <- rawdata_fic$response[[which(rawdata_fic$screen == "fiction_feedback1b")]]
  
  df_ppt$Feedback_SomeImagesArousing <- FALSE
  df_ppt$Feedback_NoImagesArousing <- FALSE
  df_ppt$Feedback_MoreArousingAI <- FALSE
  df_ppt$Feedback_LessArousinglAI <- FALSE
  
  df_ppt$Feedback_ObviousDifferenceRealAI<- FALSE
  df_ppt$Feedback_SubtleDifferenceRealAI <- FALSE
  df_ppt$Feedback_NoDifferenceRealAI <- FALSE
  df_ppt$Feedback_LabelsNotCorrect <- FALSE
  df_ppt$Feedback_LabelsReversed <- FALSE
  df_ppt$Feedback_LabelsAllReal <- FALSE
  df_ppt$Feedback_LabelsAllAI <- FALSE
  
  df_ppt$Feedback_ConfidenceReal <- NA
  df_ppt$Feedback_ConfidenceAI <- NA
  if ("Feedback_1" %in% names(fb)) {
    if (any(grepl("Some images", fb$Feedback_1))) {
      df_ppt$Feedback_SomeImagesArousing <- TRUE
    }
    if (any(grepl("No image", fb$Feedback_1))) {
      df_ppt$Feedback_NoImagesArousing <- TRUE
    }
    if (any(grepl("more arousing", fb$Feedback_1))) {
      df_ppt$Feedback_MoreArousingAI <- TRUE
    }
    if (any(grepl("less arousing", fb$Feedback_1))) {
      df_ppt$Feedback_LessArousingAI <- TRUE
    }
    if (any(grepl("was obvious", fb$Feedback_2))) {
      df_ppt$Feedback_ObviousDifferenceRealAI <- TRUE
    }
    if (any(grepl("was subtle", fb$Feedback_2))) {
      df_ppt$Feedback_SubtleDifferenceRealAI <- TRUE
    }
    if (any(grepl("any difference", fb$Feedback_2))) {
      df_ppt$Feedback_NoDifferenceRealAI <- TRUE
    }

    if (any(grepl("not always correct", fb$Feedback_2))) {
      df_ppt$Feedback_LabelsNotCorrect <- TRUE
    }
    if (any(grepl("labels were reversed", fb$Feedback_2))) {
      df_ppt$Feedback_LabelsReversed <- TRUE
    }
    if (any(grepl("images were photos", fb$Feedback_2))) {
      df_ppt$Feedback_LabelsAllReal <- TRUE
    }
    if (any(grepl("images were AI-generated", fb$Feedback_2))) {
      df_ppt$Feedback_LabelsAllAI <- TRUE
    }
  }
  if (!is.null(fb$Feedback_2_ConfidenceReal)) {
    df_ppt$Feedback_ConfidenceReal <- fb$Feedback_2_ConfidenceReal
  }
  if (!is.null(fb$Feedback_2_ConfidenceFake)) {
    df_ppt$Feedback_ConfidenceAI <- fb$Feedback_2_ConfidenceFake
  }

  # Experiment Feedback
  exp_feedback <- rawdata_db$response[which(rawdata_db$screen == "experiment_feedback"), , drop = FALSE]
  
  data_ppt$Experiment_Enjoyment <- exp_feedback$Feedback_Enjoyment
  data_ppt$Experiment_Feedback  <- exp_feedback$Feedback_Text
  
  # TASKS ================================================
  
  # Fiction
  
  cue1 <- rawdata_fic[which(rawdata_fic$screen == "fiction_cue"), ]
  isi1 <- rawdata_fic[which(rawdata_fic$screen == "fiction_fixation1b"), ]
  img1 <- rawdata_fic[which(rawdata_fic$screen == "fiction_image1"), ]
  resp1 <- lapply(
    rawdata_fic$response[which(rawdata_fic$screen == "fiction_ratings1")],
    \(x) {
      x <- as.data.frame(x)
      if (!"AttentionCheck" %in% names(x)) x$AttentionCheck <- NA
      x
    }
  )
  
  resp1 <- dplyr::bind_rows(resp1)
  
  img2 <- rawdata_fic[which(rawdata_fic$screen == "fiction_image2"), ]
  
  resp2 <- lapply(
    rawdata_fic$response[which(rawdata_fic$screen == "fiction_ratings2")],
    \(x) {
      x$question1 <- NULL
      as.data.frame(x)
    }
  )
  resp2 <- dplyr::bind_rows(resp2)

  
  # Make sure no skipping occured
  if (!all(img1$response == "null")) {
    print("Responses not all null!")
    break
  }
  
  data_fic <- data.frame(
    Participant = ppt,
    Condition = cue1$condition,
    Item = img1$stimulus,
    Trial1 = img1$trial_number,
    CueColor = tools::toTitleCase(cue1$color),
    ScreenWidth = img1$window_width,
    ScreenHeight = img1$window_height,
    Body_Reaction = resp1$Body_Reaction,
    Valence = resp1$Valence,
    Enticement  = resp1$Enticement ,
    AttentionCheck = resp1$AttentionCheck
  ) |>
    merge(
      data.frame(
        Item = img2$stimulus,
        Trial2 = img2$trial_number,
        Reality = resp2$Realness
      ),
      sort = FALSE
    )
  
  # HCT
  
  actual_duration <- (rawdata_int$time_elapsed[which(rawdata_int$screen == "HCT_interval") + 1] - rawdata_int$time_elapsed[which(rawdata_int$screen == "HCT_interval")]) / 1000
  Duration_Interval <- sort(c(20, 25, 30, 35, 40, 45))[rank(actual_duration)]
  
  hct_items <- dplyr::bind_rows(
    rawdata_int$response[which(rawdata_int$screen == "HCT_items")])
  
  df_hct <- data.frame(
    Participant       = ppt,
    Trial_Order       = seq_along(actual_duration),
    Duration_Interval = Duration_Interval,
    Duration_Actual   = actual_duration,
    HCT_Count         = as.numeric(hct_items$HCT_count),
    HCT_Confidence    = hct_items$HCT_confidence
  )
  
  # TAP
  
}
  
  
  
