datainfo <- function(mydata){
  list(
    all = colnames(mydata),
    numerics = names(which(unlist(lapply(mydata, is.numeric)))),
    factors = names(which(unlist(lapply(mydata, is.factor)))),
    strings = names(which(unlist(lapply(mydata, is.character))))
  )
}
