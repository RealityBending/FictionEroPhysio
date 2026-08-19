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
  
  
  

  
  
}
