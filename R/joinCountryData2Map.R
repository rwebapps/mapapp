join <- function(dF, nameJoinColumn, joinCode, ...){
  out <- joinCountryData2Map(dF=dF, joinCode = joinCode, nameJoinColumn=nameJoinColumn,  ...); 
  out;
}