/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const homePage = require('../support/components/HomePage')

Cypress.TestCase('Tools', 'Visit Home Page', VisitHomePage)
export function VisitHomePage()
{
  homePage.Visit()
  homePage.GetModelListRowCount()
}

Cypress.TestCase('Tools', 'CreateModel', CreateModel)
export function CreateModel(name = 'z-model')
{
  models.CreateNewModel(name)
  VisitHomePage()
}
