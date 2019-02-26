/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import axios from 'axios'
import ApiConfig from './config'

//=========================================================
// CREATE ROUTES
//=========================================================
export interface CultureObject {
  cultureCode: string
  cultureName: string
}

export const getLuisApplicationCultures = async (): Promise<CultureObject[]> => {
  const response = await axios.get(ApiConfig.CLLocaleEndpoint)
  return response.data
}
