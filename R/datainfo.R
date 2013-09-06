datainfo <- function(mydata){
  list(
    all = as.list(colnames(mydata)),
    strings = as.list(names(which(unlist(lapply(mydata, is.character))))),
    other = as.list(names(which(unlist(lapply(mydata, function(x){!is.character(x)})))))
  )
}
