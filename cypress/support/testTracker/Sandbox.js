const apiData = require('./ApiData');

(async function() {
  return await apiData.Get('https://dialearn.visualstudio.com/BLIS/_workitems/edit/2422').then(data => {
    console.log(data)
  })
}())