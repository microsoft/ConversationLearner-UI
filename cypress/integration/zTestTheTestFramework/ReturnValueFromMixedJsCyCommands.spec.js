/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'

describe('Experiment with Getting Return Value from Function with Mixed JavaScript and CY Commands', () => {
  it('Test1 - Simple', () => {
    function aFunc() {
      helpers.ConLog('aFunc', 'Some plain JavaScript was just executed')
      return cy.Enqueue(() => {
        helpers.ConLog('aFunc', 'A cy.command started execution')
        return 'The aFunc Result'
      })
    }

    cy.Enqueue(() => { helpers.ConLog('main', 'cy.command') })
    helpers.ConLog('main', 'Plain JavaScript Start')
    cy.Enqueue(() => { return aFunc() }).then(returnedResult => {
      helpers.ConLog('main', `returnedResult: ${returnedResult}`)
    })
  })

  it('Test2 - Then', () => {
    function aFunc() {
      helpers.ConLog('aFunc', 'Some plain JavaScript was just executed')
      return cy.Enqueue(() => {
        helpers.ConLog('aFunc', 'A cy.command started execution')
        return 'The aFunc Result'
      }).then(result => {
        helpers.ConLog('aFunc', `then function of a cy.command received: '${result}'`)
        return `The modified result='${result}'`
      })
    }

    cy.Enqueue(() => { helpers.ConLog('main', 'cy.command') })
    helpers.ConLog('main', 'Plain JavaScript Start')
    cy.Enqueue(() => { return aFunc() }).then(returnedResult => {
      helpers.ConLog('main', `returnedResult: ${returnedResult}`)
    })
  })

  it('Test3 - Mulitple CY Commands', () => {
    function aFunc() {
      helpers.ConLog('aFunc', 'Some plain JavaScript was just executed')
      let result
      
      cy.Enqueue(() => {
        helpers.ConLog('aFunc', 'A cy.command started execution')
        result = 'The aFunc Result'
      })
      
      cy.Enqueue(() => {
        helpers.ConLog('aFunc', `Another cy.command which should use the result from last cy.command: '${result}'`)
        result = `The modified result='${result}'`
      })

      return cy.Enqueue(() => {
        helpers.ConLog('aFunc', `The final cy.command which should use the result from last cy.command: '${result}'`)
        return `LAST MODIFICATION: '${result}'`
      })
    }

    cy.Enqueue(() => { helpers.ConLog('main', 'cy.command') })
    helpers.ConLog('main', 'Plain JavaScript Start')
    cy.Enqueue(() => { return aFunc() }).then(returnedResult => {
      helpers.ConLog('main', `returnedResult: ${returnedResult}`)
    })
  })

  // The 'should' cypress command behaves differently with respect to return values...
  // it does not return them down the chain of commands.
  it('Test3 - wrap ".should()"', () => {
    function aFunc() { return {data: 123, anArray: ['a', 'b', 'c']} }
    
    let returnedResult
    cy.wrap(1).should(() => {
      returnedResult = aFunc()
      if (returnedResult.data != 123) { throw new Error('SHOULD returnedResult.data != 123') }
      if (returnedResult.anArray[0] != 'a' || returnedResult.anArray[1] != 'b' || returnedResult.anArray[2] != 'c') {
        throw new Error("SHOULD returnedResultanArray != ['a', 'b', 'c']")
      }
      return returnedResult
    }).then(shouldResult => {
      if (shouldResult != 1) { throw new Error('THEN shouldResult.data SHOULD BE 1') }
      // if (shouldResult.data == 123) { throw new Error('THEN shouldResult.data SHOULD NOT BE 123') }
      // if (shouldResult.anArray[0] == 'a' || shouldResult.anArray[1] == 'b' || shouldResult.anArray[2] == 'c') {
      //   throw new Error("THEN shouldResult.anArray SHOULD NOT BE ['a', 'b', 'c']")
      // }
    })
  })

  // The 'should' cypress command behaves differently with respect to return values...
  // it does not return them down the chain of commands.
  it('Test4 - wrap ".then()" after a call to ".should()"', () => {
    function aFunc() {   
      let returnedFromShould
      cy.wrap(1).should(() => {
        returnedFromShould = 'Value returned from .should() is lost, but value returned from then is preserved'
        return returnedFromShould
      }).then(shouldResult => {
        if (shouldResult != 1) { 
          throw new Error('THEN shouldResult.data SHOULD BE 1') 
        }
        return returnedFromShould
      })
    }

    cy.Enqueue(() => { return aFunc() }).then(returnedResult => {
      helpers.ConLog('main', `returnedResult: ${returnedResult}`)
      if (returnedResult != 'Value returned from .should() is lost, but value returned from then is preserved') { 
        throw new Error('Unexpected Result. Review the Log File.') 
      }
    })
  })
})
