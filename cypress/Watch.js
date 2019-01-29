var fs = require('fs')

WatchAndRun('./cypress/tests', LogIt)

function WatchAndRun(pathToWatch, functionToRun) {
  var timeoutHandle;
  var timeOfLastChange;
  
  fs.watch(pathToWatch, (eventType, filename) => {
    var now = new Date();
    if (timeOfLastChange && now - timeOfLastChange < 1000) { clearTimeout(timeoutHandle); }
    timeOfLastChange = now;
    timeoutHandle = setTimeout(functionToRun, 1000)
  });
}

function LogIt()
{
  console.log('Detected one or more file changes');
}