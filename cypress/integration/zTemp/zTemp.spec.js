/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

import * as helpers from '../../support/Helpers'
import * as homePage from '../../support/components/HomePage'
import * as modelPage from '../../support/components/ModelPage'
import * as models from '../../support/Models'
import * as train from '../../support/Train'
import * as trainDialogsGrid from '../../support/components/TrainDialogsGrid'

describe('zTemp', () => {
  it('Temporary Experimental Test', () => {
    function createModelName(prefix, buildKey, subTime) {
      let time = Cypress.moment().subtract(subTime, 'm').format("MMDD-HHmmss")
      return `${prefix}-${time}${buildKey}`
    }

    const modelNames = [
      createModelName('abc', 'x', 1),
      createModelName('z-abc', 'x', 2),
      createModelName('z-def', 'a', 4),
      createModelName('z-hij', 'b', 6),
    ]

    modelNames.forEach(modelName => { 
      helpers.ConLog('zTemp', `Model '${modelName}' should be deleted: ${ModelShouldBeDeleted(modelName)}`)
    })

    // helpers.ConLog('zTemp', Cypress.env('CIRCLE_BUILD_NUM'))
    // helpers.ConLog('zTemp', `Not--'${Cypress.env('NotAnEnvVar')}'`)
    // homePage.Visit()
    // homePage.GetModelListRowCount()
  })

  it.skip('Temporary Experimental Test', () => {
    // TODO: Turn this into a full test case since there is a 20 tag 
    // limit and produces a bug when saving the Train Dialog.
    // Bug 1930: Train Dialog - Tag Editor should prevent user from entering more than 20 tags.
    models.CreateNewModel('z-foods')
    modelPage.NavigateToTrainDialogs()
    train.CreateNewTrainDialog()

    train.AddTags(['Apple', 'Banana', 'Carrot', 'Duck', 'Egg', 'Food', 'Green Chilli', 'Habanero','Ice Cream', 'Jalapeno', 'Kale', 'Letuce', 'Mango', 'Necterine', 'Orange', 'Plum', 'QQQ', 'Raisin', 'Salt', 'Tangerine', 'UUUuuu', 'VVV', 'WwWwWwW', 'X', 'YYYyy', 'ZzZzZ'])
  })
})

function ModelShouldBeDeleted(modelName) {
  if (!modelName.startsWith('z-')) {
    // This is NOT a Test created model since it does NOT start with 'z-'
    return false
  }

const funcName = `ModelShouldBeDeleted(${modelName})`
helpers.ConLog(funcName, 'Starts with "z-"')

  // Test created Model names end with a suffix like this...  "-0425-135703x"
  // The moment format for the suffix is...                   "-MMDD-HHmmss*" where '*' is the Build Key
  const suffixFormat = '-MMDD-HHmmss*'
  const suffixLength = suffixFormat.length

  const modelNameSuffix = modelName.substring(modelName.length - suffixLength)
  if (modelNameSuffix[0] != '-') {
    // Something is wrong with the format of this model name, 
    // so to be safe we will not delete it.
    return false
  }

helpers.ConLog(funcName, 'Suffix starts with "-"')

  if (modelNameSuffix[suffixLength - 1] == helpers.GetBuildKey()) {
    // The Build Key in the model matches the Build Key of this test 
    // run so we can safely delete a model we created.
    return true
  }

helpers.ConLog(funcName, 'Key is from another build')

  // This model was created by some other test run, so we need to verify
  // that the model is too old to still be in use. 5 minutes old is adequate
  // at this point in time, however, if any test case takes more than 4 minutes
  // then we should increase this time.
  const modelCreatedTime = Cypress.moment(modelNameSuffix, suffixFormat)
  let momentModelIsTooOldToSave = Cypress.moment().subtract(5, 'm')

helpers.ConLog(funcName, `Model is old enough to delete: ${modelCreatedTime.isBefore(momentModelIsTooOldToSave)}`)

  return modelCreatedTime.isBefore(momentModelIsTooOldToSave)
}