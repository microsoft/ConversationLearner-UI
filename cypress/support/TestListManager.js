/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

var testLists = require('../TestLists')
const helpers = require('./Helpers');

var testGroups = new Array();
Cypress.TestCase = TestCase;
Cypress.testList = testLists.testList

// ----------------------------------------------------------------------
// NOTE: Placement of these "require" statements is important in this file.
//
// Each of these required files will call back into the TestCase function
// found in this file.
// ----------------------------------------------------------------------

const createModels = require('../tests/CreateModels');
const editAndBranching = require('../tests/EditAndBranching');
const log = require('../tests/Log');
const train = require('../tests/Train');
const tools = require('../tests/Tools');

// ----------------------------------------------------------------------

function TestCase(testGroupName, testDescription, testFunction) {
  helpers.ConLog('TestListManager', `TestCase(${testGroupName}, ${testDescription}, ${testFunction})`);
  
  var testGroup = GetTestGroup(testGroupName);
  if (!testGroup)
  {
    testGroup = { name: testGroupName, tests: new Array() };
    testGroups.push(testGroup);
  }

  var test = { name: testDescription, func: testFunction };
  testGroup.tests.push(test);

  var testSpecification = `${testGroupName}.${testFunctionName}`;
  if (!testLists.masterListOfAllTestCases.indexOf(testSpecification)) {
    throw `There is a syncronization error between our master test list and a TestCase specification for: '${testSpecification}'` }
}


export function AddToCypressTestList(testList) 
{
  var funcName = `AddToCypressTestList()`
  helpers.ConLog(funcName, `List of Tests: ${testList}`)
  
  if (!Array.isArray(testList)) testList = [testList]
  
  var testListIterator = new TestListIterator(testList)
  
  var test = testListIterator.next
  while (test != undefined)
  {
    helpers.ConLog(funcName, `Adding Group: ${test.group}`)
    describe(test.group, () =>
    {
      var currentGroupName = test.group
      while (test != undefined && test.group == currentGroupName)
      {
        helpers.ConLog(funcName, `Adding Test Case: ${test.name}`)
        it(test.name, test.func)
        test = testListIterator.next
      }
    })
  }
}

class TestListIterator
{
  constructor(testList)
  {
    this.testList = testList
    this.index = 0
    this.currentGroup = {name: ''}
  }

  // groupName.testName - 'testName' from 'groupName'
  // TODO: Add support for these wild card versions
  // *.*                - All Groups, All Tests
  // *.testName         - All tests with all groups matching 'testName'
  // groupName.*        - All tests from 'groupName'
  get next()
  {
    if (this.index >= this.testList.length) return undefined

    var x = this.testList[this.index].split('.')
    if (x.length != 2) throw `Invalid item in testList[${this.index}]: "${this.testList[this.index]}" - 'group DOT testName' format is expected`
    var groupName = x[0]
    var testName = x[1]

    if (this.currentGroup.name != groupName)
    {
      this.currentGroup = GetTestGroup(groupName)
      if (this.currentGroup == undefined) throw `Group '${groupName}' NOT found in testGroups`
    }
    
    var test = GetTest(this.currentGroup, testName)
    if (test == undefined) throw `Test '${testName}' NOT found in test group '${groupName}'`

    this.index++
    return {group: this.currentGroup.name, name: test.name, func: test.func}
  }
}

function GetTestGroup(name)
{
  for (var i = 0; i < testGroups.length; i++)
  {
    if (testGroups[i].name == name) 
    {
      return testGroups[i]
    }
  }
  return undefined
}

function GetTest(testGroup, testNameToFind)
{
  for (var i = 0; i < testGroup.tests.length; i++)
  {
    // .func looks something like this, "function FuncName() {..."
    if (`${testGroup.tests[i].func}`.substring(9).startsWith(testNameToFind))
    {
      return testGroup.tests[i]
    }
  }
  return undefined
}


