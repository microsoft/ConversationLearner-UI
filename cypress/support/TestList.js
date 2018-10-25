/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const createModels = require('../tests/CreateModels')
const train = require('../tests/Train')
const log = require('../tests/Log')
const helpers = require('./Helpers')

// NOTE: The function name specified by 'func' below must match the root of the
//       file name that calls AddToCypressTestList(). Also the direct parent
//       folder of the caller must match the test group name
var testGroups = 
[
  { name: 'CreateModels', tests:
  [
    {name: "Custom and Builtin Entities", func: createModels.AllEntityTypes},
    {name: "Disqualifying Entities", func: createModels.DisqualifyingEntities},
    {name: "Wait vs No Wait Action Tests", func: createModels.WaitVsNoWaitActions},
    {name: "What's Your Name", func: createModels.WhatsYourName},
  ]},
  { name: 'Log', tests:
  [
    {name: "What's Your Name", func: log.WhatsYourName},
  ]},
  { name: 'Train', tests:
  [
    {name: "Disqualifying Entities", func: train.DisqualifyingEntities},
    {name: "Wait vs No Wait Action", func: train.WaitVsNoWaitAction},
    {name: "What's Your Name 1", func: train.WhatsYourName1},
    {name: "What's Your Name 2", func: train.WhatsYourName2},
  ]},
]

// This function adds test cases to Cypress' test queue. It uses the file path of the calling 
// function to determin the group name and the test function name. "(All)" is used as a special 
// name that will cause this method to include all tests for that group to be added to Cypress'
// test queue. The folder name "Tests", with the file name "(All)" is reserved to be used to 
// include all groups all test groups to be added to Cypress' test queue.
//
// The parenthesis in "(All)" is intended to keep the "All Tests" option at the top of Cypress'
// test case list since it is produced in alphabetical order.
export function AddToCypressTestList()
{
  var funcName = `AddToCypressTestList()`
  var callerFileName = GetCallerFileName()
  
  //                                                                              test group name--\      /--Test function name
  // callerFileName looks like: http://localhost:5050/__cypress/tests?p=cypress\integration\Tests\Train\WhatsYourName1.js-044
  helpers.ConLog(funcName, `callerFileName: ${callerFileName}`)

  var i2 = callerFileName.lastIndexOf('.js-')
  var i1 = callerFileName.lastIndexOf('\\', i2 - 1)
  var testName = callerFileName.substring(i1 + 1, i2)

  i2 = i1;
  i1 = callerFileName.lastIndexOf('\\', i2 - 1)
  var testGroupName = callerFileName.substring(i1 + 1, i2)

  var allTests = (testName == '(All)')
  var allGroups = (allTests && testGroupName == 'Tests')
  var toFind = `function ${testName}(`
  helpers.ConLog(funcName, `testGroup: ${testGroupName} - testName: ${testName} - allTests: ${allTests} - allGroups ${allGroups} - toFind: ${toFind}`)

  var group
  for (var i = 0; i < testGroups.length; i++)
  {
    if (allGroups || testGroups[i].name == testGroupName)
    {
      group = testGroups[i]

      var test
      describe(group.name, () => 
      {
        helpers.ConLog(funcName, `Added Group: ${group.name}`)
        for (var i = 0; i < group.tests.length; i++)
        {
          if (allTests || `${group.tests[i].func}`.startsWith(toFind))
          {
            test = group.tests[i]
            it(test.name, test.func)
            helpers.ConLog(funcName, `Added Test Case: ${test.name}`)
            if (!allTests) break
          }
        }
        if (!test) throw `Cannot find Test: ${testName} in Test Group: ${testGroupName}`
      })

      if (!allGroups) break
    }
  }
  if (!group) throw `Cannot find Test Group: ${testGroupName}`
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

