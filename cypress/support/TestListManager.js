/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// ----------------------------------------------------------------------
// This code manages our test cases in such a way that we can run
// a single, individual test case (spec file) as Cypress intended and
// also to be able to run a select list of multiple tests in a way that
// Cypress does not natively support.
//
// This is accomplished by doing the following:
//  1) Place all .js files, which should contain multiple test cases, in 
//     the "cypress/tests" folder.
//  2) For each test case, directly before the test function, call the
//     following function with appropriate parameters:
//        Cypress.TestCase(testGroupName, testDescription, testFunction)
//  3) From the command line run: 
//        node cypress\GenerateCypressTestSpecs.js
//     (It is intended that this be automated, but at the moment it is not.)
// ----------------------------------------------------------------------

var testLists = require('../TestLists');
const helpers = require('./Helpers');

Cypress.TestCase = TestCase;
Cypress.testList = testLists.testList;
Cypress.regressionTestList = testLists.regressionTestList;
Cypress.masterListOfAllTestCases = testLists.masterListOfAllTestCases;

var testGroups = new Array();

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
const zTemp = require('../tests/zTemp')

// ----------------------------------------------------------------------
// Call this function to add an ordinary function to the list of test 
// cases that Cypress will recognize as a test. This technique is needed
// to support running multiple tests from any spec file in any order.
// ----------------------------------------------------------------------

function TestCase(testGroupName, testDescription, testFunction) {
  // These lines of code converts the testFunction from a callable
  // function to a string containing the name of this function. It works
  // like this:
  //   1) We convert the function to a string containing the full function
  //      that looks like: 
  //        "function TheTestFunctionToRun(param1, param2) {...}"
  //   2) The magic number 9 here is skipping past the string "function "
  //      and grabbing just the name of the function.
  var functionPrefixLength = 'function '.length
  var testFunctionAsString = testFunction.toString();
  var testFunctionName = testFunctionAsString.substring(functionPrefixLength, testFunctionAsString.indexOf('(', functionPrefixLength));
  helpers.ConLog('TestListManager', `TestCase(${testGroupName}, ${testDescription}, ${testFunctionName})`);
  
  var testGroup = GetTestGroup(testGroupName);
  if (!testGroup)
  {
    testGroup = { name: testGroupName, tests: new Array() };
    testGroups.push(testGroup);
  }

  var test = { name: testFunctionName, description: testDescription, func: testFunction };
  testGroup.tests.push(test);

  var testSpecification = `${testGroupName}.${testFunctionName}`;
  if (-1 == testLists.masterListOfAllTestCases.indexOf(testSpecification)) {
    throw `There is a syncronization error between our master test list and a TestCase specification for: '${testSpecification}'` }
}


export function AddToCypressTestList(testList) {
  var funcName = `AddToCypressTestList()`;
  helpers.ConLog(funcName, `List of Tests: ${testList}`);
  
  if (!Array.isArray(testList)) testList = [testList];
  
  var testListIterator = new TestListIterator(testList);
  
  var test = testListIterator.next;
  while (test != undefined)
  {
    helpers.ConLog(funcName, `Adding Group: ${test.group}`);
    describe(test.group, () => {
      var currentGroupName = test.group;
      while (test != undefined && test.group == currentGroupName)
      {
        helpers.ConLog(funcName, `Adding Test Case: ${test.name}`);
        Cypress.RegisterTestCase(test.group, test.name);
        it(test.description, test.func) 
        test = testListIterator.next;
      }
    })
  }
}

class TestListIterator {
  constructor(testList) {
    this.testList = testList;
    this.index = 0;
    this.currentGroup = {name: ''};
  }

  // TODO: This class needs to be brought up to standard - here is an example:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator/next

  // groupName.testName - 'testName' from 'groupName'
  // TODO: Add support for these wild card versions
  // *.*                - All Groups, All Tests
  // *.testName         - All tests with all groups matching 'testName'
  // groupName.*        - All tests from 'groupName'
  get next() {
    if (this.index >= this.testList.length) return undefined;

    var x = this.testList[this.index].split('.');
    if (x.length != 2) throw `Invalid item in testList[${this.index}]: "${this.testList[this.index]}" - 'group DOT testName' format is expected`;
    var groupName = x[0];
    var testName = x[1];

    if (this.currentGroup.name != groupName) {
      this.currentGroup = GetTestGroup(groupName);
      if (this.currentGroup == undefined) throw `Group '${groupName}' NOT found in testGroups`;
    }
    
    var test = GetTest(this.currentGroup, testName);
    if (test == undefined) throw `Test '${testName}' NOT found in test group '${groupName}'`;

    this.index++;
    return {
      group: this.currentGroup.name, 
      name: test.name, 
      description: test.description, 
      func: test.func
    };
  }
}

function GetTestGroup(name) {
  return testGroups.find(testGroup => testGroup.name === name);
}

function GetTest(testGroup, testNameToFind) {
  return testGroup.tests.find(test => test.name == testNameToFind);
}
