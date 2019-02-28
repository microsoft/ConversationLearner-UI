/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const homePage = require('../../support/components/HomePage')
const helpers = require('../../support/Helpers')

afterEach(function(){
  // helpers.Dump('afterEach', this.currentTest)
  // helpers.Dump('*ctx*', this.currentTest.ctx)
  // helpers.Dump('*parent*', this.currentTest.parent)

  console.log(`this.currentTest.fullTitle(): '${this.currentTest.fullTitle()}'`)
  console.log(`this.currentTest.title: '${this.currentTest.title}'`)
  
  function logTitles(test) {
    console.log(test.title)
    if (test.parent) {
      logTitles(test.parent)
    }
  }

  logTitles(this.currentTest)
  // this.skip() - Will cause a test to be skipped, reported as PENDING rather than PASS or FAIL
  // ctx??? 
  // state: passed
  // state: failed
})

describe('Create Model X', () => {
  describe('Level 2', () => {
    it('The Test', () => {
      cy.wait(100)
      console.log('1. Why is this not in the log?')
      helpers.ConLog('The Test', 'Started')
      cy.wait(1000)
      // this.currentTest.fullTitle(): 'Create Model X Level 2 The Test'
      expect(false).to.equal(true)
      models.CreateNewModel('z-modelX')
      homePage.Visit()
      homePage.GetModelListRowCount()
    })  
  })
})

describe('Create Model', () => {
  it('Tool', () => {
    cy.wait(100)
    console.log('2. Why is this not in the log?')
    helpers.ConLog('Tool', 'Started')
    cy.wait(1000)

    // models.CreateNewModel('z-model')
    // homePage.Visit()
    // homePage.GetModelListRowCount()
  })
})

