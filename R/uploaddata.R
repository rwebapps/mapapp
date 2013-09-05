uploaddata <- function(csvfile, ...){
  if(substring(tolower(csvfile), nchar(csvfile)-3) != ".csv"){
    stop('Uploaded data needs to be .csv file. When using MS Excel, try "Save As" and select type "CSV (comma delimited)"');
  }
  read.csv(csvfile, stringsAsFactors=FALSE, ...);
}
