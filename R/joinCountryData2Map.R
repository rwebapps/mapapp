join <- function(dF, nameJoinColumn, joinCode, ...){
  #joinCountryData2Map has some useful messages that we want to capture in a file.
  text <- capture.output(out <- joinCountryData2Map(dF=dF, joinCode = joinCode, nameJoinColumn=nameJoinColumn,  ...)); 
  
  #throw an error when no data was found
  if(identical(substring(text, 1, 7), "0 codes")){
    stop(text);
  } 
  
  writeLines(text, "messages.txt");
  return(out);
}
