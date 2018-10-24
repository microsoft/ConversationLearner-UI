/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const createModels = require('../tests/CreateModels')
const train = require('../tests/Train')
const log = require('../tests/Log')
const helpers = require('./Helpers')

var testGroups = 
[
  { name: 'CreateModels', tests:
  [
    {name: "x", func: xxx},
    {name: "x", func: xxx},
    {name: "x", func: xxx},
    {name: "x", func: xxx},
  ],},
  { name: 'train', tests:
  [
    {name: "What's Your Name", func: train.WhatsYourName},
    {name: "My Name Is", func: train.MyNameIs},
    {name: "Disqualifying Entities", func: train.DisqualifyingEntities},
    {name: "Wait vs No Wait Action", func: train.WaitVsNoWaitAction},
  ],},
  { name: 'Log', tests:
  [
    {name: "x", func: xxx},
    {name: "x", func: xxx},
    {name: "x", func: xxx},
    {name: "x", func: xxx},
  ],},
]

function xxx()
{
  describe("Train", () =>
  {
  
    testGroups.forEach(test => { it(test.name, test.func)})
  })
}

export function AddToCypressTestList()
{
  var funcName = `AddToCypressTestList()`
  var callerFileName = GetCallerFileName()
  helpers.ConLog(funcName, `callerFileName: ${callerFileName}`)
  // callerFileName looks like: http://localhost:5050/__cypress/tests?p=cypress\integration\tools\zTemp.js-182

  var i2 = callerFileName.lastIndexOf('.js-')
  var i1 = callerFileName.lastIndexOf('\\', i2 - 1)
  var testName = callerFileName.substring(i1 + 1, i2)
  helpers.ConLog(funcName, `testName: ${testName}`)

  i2 = i1;
  i1 = callerFileName.lastIndexOf('\\', i2 - 1)
  var testGroupName = callerFileName.substring(i1 + 1, i2)
  helpers.ConLog(funcName, `testGroup: ${testGroupName}`)

  var group
  for (var i = 0; i < testGroups.length; i++)
  {
    if (testGroups[i].name == testGroupName)
    {
      group = testGroups[i]
      break
    }
  }
  if (!group) throw `Cannot find Test Group: ${testGroupName}`

  var allTests = (testName == '(All)')
  var test
  var toFind = `function ${testName}(`
  helpers.ConLog(funcName, `toFind: ${toFind}`)
  describe(group.name, () => 
  {
    for (var i = 0; i < group.tests.length; i++)
    {
      if (allTests || `${group.tests[i].func}`.startsWith(toFind))
      {
        test = group.tests[i]
        it(test.name, test.func)
        helpers.ConLog(funcName, `Added test case: ${test.name}`)
        if (!allTests) break
      }
    }
    if (!test) throw `Cannot find Test: ${testName} in Test Group: ${testGroupName}`
  })

  // helpers.ConLog(funcName, `tests[1].tests[0].name: ${tests[1].tests[0].name} - Dump of func: ${tests[1].tests[0].func}`)
  // helpers.Dump(funcName, tests[1].tests[0].func)
}


function GetCallerFileName() 
{
  var funcName = `GetCallerFileName()`
  var originalFunc = Error.prepareStackTrace;
  var callerFileName;

  try 
  {
    var err = new Error();

    Error.prepareStackTrace = function (err, stack) { return stack; };

    var currentFileName = err.stack.shift().getFileName();
    helpers.ConLog(funcName, `currentFileName: ${currentFileName}`)

    while (err.stack.length) 
    {
      callerFileName = err.stack.shift().getFileName();
      helpers.ConLog(funcName, `callerFileName: ${callerFileName}`)
      if(currentFileName !== callerFileName) break;
    }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc; 

  return callerFileName;
}

