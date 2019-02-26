/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../../support/Models')
const homePage = require('../../support/components/HomePage')

export function CreateModel(name = 'z-model')
{
  models.CreateNewModel(name)
  homePage.Visit()
  homePage.GetModelListRowCount()
}
