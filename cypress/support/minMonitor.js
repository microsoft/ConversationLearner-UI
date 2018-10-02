/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const helpers = require('../support/helpers.js')

var lastChangeTime
var StopLookingForChanges = false

export function Start()
{
    helpers.ConLog(`minMonitor.Start()`, `Running`)
    lastChangeTime = new Date().getTime()
    setTimeout(() => { LookForChange() }, 200)   // Endlessly repeat
}

export function MillisecondsSinceLastChange() { return (new Date().getTime() - lastChangeTime) }

export function Stop() {StopLookingForChanges = true}

export function LookForChange()
{
    var thisFuncName = `minMonitor.LookForChange()`

    if (StopLookingForChanges) 
    {
        helpers.ConLog(thisFuncName, `DONE`)
        return
    }

    helpers.ConLog(thisFuncName, `Milliseconds since last change: ${(new Date().getTime() - lastChangeTime)}`)
    
    setTimeout(() => { LookForChange() }, 200)   // Repeat this same function 50ms later
}



