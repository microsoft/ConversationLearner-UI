/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

// -----------------------------------------------------------------------------
// The Purpose of this Test Spec File is to test the Persistent Logging features
// and to demonstrate how to skip dependant tests when their predicessor fails.
// -----------------------------------------------------------------------------

const helpers = require('../../support/Helpers')

describe('Test UI View and Logs - Tools', () => {
  // The difference between the 1st and 2nd is where we place the call to SkipRemainingTestsOfSuiteIfFailed()
  context('1st Test Suite Root', () => {
    afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
    describe('Level 2-1', () => {
      it('The FIRST Test', () => {
        expect(true).to.equal(true)
      })

      it('The SECOND Test', () => {
        expect(false).to.equal(true) // Intentionally fail to verify that the next tests will be skipped.
      })

      it('The THIRD Test', () => {
        expect(true).to.equal(true)
      })
    })

    describe('Level 2-2', () => {
      it('The FOURTH Test', () => {
        expect(true).to.equal(true)
      })

      it('The FIFTH Test', () => {
        expect(true).to.equal(true)
      })
    })
  })

  // The difference between the 1st and 2nd is where we place the call to SkipRemainingTestsOfSuiteIfFailed()
  context('2nd Test Suite Root', () => {
    describe('Level 2-1', () => {
      afterEach(helpers.SkipRemainingTestsOfSuiteIfFailed)
      it('The FIRST Test', () => {
        expect(true).to.equal(true)
      })

      it('The SECOND Test', () => {
        expect(false).to.equal(true) // Intentionally fail to verify that the next tests will be skipped.
      })

      it('The THIRD Test', () => {
        expect(true).to.equal(true)
      })
    })

    describe('Level 2-2', () => {
      it('The FOURTH Test', () => {
        expect(true).to.equal(true)
      })

      it('The FIFTH Test', () => {
        expect(true).to.equal(true)
      })
    })
  })

  beforeEach(function() {
    helpers.ConLog('beforeEach', `${this.currentTest.title} - Start`)
  })

  // Log some of Moca's objects
  afterEach(function() {
    const funcName = 'afterEach'
    // helpers.Dump(funcName, this.currentTest)
    // helpers.Dump(funcName, this.currentTest.ctx)
    // helpers.Dump(funcName, this.currentTest.parent)

    helpers.ConLog(funcName, `this.currentTest.fullTitle(): '${this.currentTest.fullTitle()}'`)
    helpers.ConLog(funcName, `this.currentTest.title: '${this.currentTest.title}'`)
    helpers.ConLog(funcName, `this.currentTest.status: '${this.currentTest.state}'`)
  })
})
