map <- function(mapToPlot, nameColumnToPlot, ...){
  par(mai=c(0,0,0.2,0), xaxs="i", yaxs="i");
  mapCountryData(mapToPlot, nameColumnToPlot, ...)
}