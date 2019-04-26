/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as homePage from './components/HomePage'
import * as modelPage from './components/ModelPage'
import * as helpers from './Helpers'

class UniqueModelName {
  // Construct a unique model name by appending the suffix to the supplied prefix.
  static Get(modelNamePrefix) {
    // The suffix will start with the time.
    let moment = Cypress.moment()
    let time = moment.format("MMDD-HHmmss")
    if (UniqueModelName._lastTimeUsed && time == UniqueModelName._lastTimeUsed) {
      // This is one of those rare occassions where we need to fudge and add 
      // a second to the time to guarantee uniqueness.
      moment = moment.add(1, 'seconds')
      time = moment.format("MMDD-HHmmss")
    }
    UniqueModelName._lastTimeUsed = time
    
    return `${modelNamePrefix}-${time}${helpers.GetBuildKey()}`
  }
}

// The test defined prefix can be up to 17 characters.
// The dash and suffix takes 13 characters. 
// 30 characters is the maximum model name.
export function CreateNewModel(modelNamePrefix) {
  const name// = UniqueModelName.Get(modelNamePrefix)

  homePage.Visit()
  homePage.ClickNewModelButton()
  cy.Enqueue(() => {name = UniqueModelName.Get(modelNamePrefix)})
  homePage.TypeModelName(name)
  homePage.ClickSubmitButton()
  modelPage.VerifyModelName(name)

  return name
}

// The test defined prefix can be up to 17 characters.
export function ImportModel(modelNamePrefix, fileName) {
  return new Promise((resolve) => {
    // Maximum Name Length is 30 Characters
    const name = UniqueModelName.Get(modelNamePrefix)

    homePage.Visit()
    homePage.ClickImportModelButton()
    homePage.TypeModelName(name)
    homePage.UploadImportModelFile(fileName)
    homePage.ClickSubmitButton()

    cy.WaitForStableDOM().then(() => { resolve(name) })
  })
}
