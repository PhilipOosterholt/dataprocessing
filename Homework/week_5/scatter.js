// Philip Oosterholt - 10192263 - Week 5

window.onload = function() {

  console.log('Yes, you can!')
  data = load_data()

};

load_data = function() {

  var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
  var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

  var requests = [d3.json(womenInScience), d3.json(consConf)];

  Promise.all(requests).then(function(response) {
      // doFunction(response);
      console.log(response)
  }).catch(function(e){
      throw(e);
  });
}

// doFunction = function() {
//   console.log(response)
// }
