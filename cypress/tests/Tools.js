/**
* Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const models = require('../support/Models')
const homePage = require('../support/components/HomePage')

export function VisitHomePage()
{
  homePage.Visit()
  homePage.GetModelListRowCount()
}

export function CreateModel(name)
{
  models.CreateNewModel(name)
  VisitHomePage()
}
