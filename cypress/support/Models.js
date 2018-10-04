/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

const homePage = require('../support/components/HomePage')
const modelPage = require('../support/components/ModelPage')

export function CreateNewModel(name)
{
  homePage.Visit()
  homePage.CreateNewModel(name)
  modelPage.VerifyPageTitle(name)
}