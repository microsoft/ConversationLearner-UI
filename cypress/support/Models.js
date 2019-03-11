/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as homePage from './components/HomePage'
import * as modelPage from './components/ModelPage'

class UniqueModelName {
  // Get a unique time to use as a suffix for the model name.
  static Get(modelNamePrefix) {
    let moment = Cypress.moment()
    let time = moment.format("MMMDD-HHmmss")
    if (UniqueModelName._lastTimeUsed && time == UniqueModelName._lastTimeUsed) {
      moment = moment.add(1, 'seconds')
      time = moment.format("MMMDD-HHmmss")
    }

    UniqueModelName._lastTimeUsed = time
    return `${modelNamePrefix}-${time}`
  }
}

// The test defined prefix can be up to 17 characters.
// The dash and time suffix takes 13 characters. 
// 30 characters is the maximum model name.
export function CreateNewModel(modelNamePrefix) {
  //const name = `${modelNamePrefix}-${ModelNameTime()}`
  const name = UniqueModelName.Get(modelNamePrefix)

  homePage.Visit()
  homePage.ClickNewModelButton()
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
