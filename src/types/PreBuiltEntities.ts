/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
export const PreBuilts = {
    DatetimeV2: "datetimeV2",
    Datetime: "datetime",
    Number: "number",
    Ordinal: "ordinal",
    Percentage: "percentage",
    Temperature: "temperature",
    Dimension: "dimension",
    Money: "money",
    Age: "age",
    Geography: "geography",
    URL: "url",
    Email: "email",
    Phone_number: "phonenumber"
}
export interface LocalePreBuilts {
    locale: string,
    preBuiltEntities: string[],
}

export const PreBuiltEntities: LocalePreBuilts[] = [
    {
        locale: "en-us",
        preBuiltEntities: [
            PreBuilts.DatetimeV2, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age,
            PreBuilts.Geography, PreBuilts.URL, PreBuilts.Email, PreBuilts.Phone_number
        ]
    },
    {
        locale: "zh-cn",
        preBuiltEntities: [
            PreBuilts.DatetimeV2, PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "fr-fr",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    //Note: French-Canada is not listed on the LUIS site so I am using the same prebuilts as French-France
    {
        locale: "fr-ca",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "es-es",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    //Note: Spanish-Mexican is not listed on the LUIS site so I am using the same prebuilts as Spanish-Spain
    {
        locale: "es-mx",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "it-it",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "de-de",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "ja-jp",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "pt-br",
        preBuiltEntities: [
            PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
            PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age
        ]
    },
    {
        locale: "ko-kr",
        preBuiltEntities: []
    },
    //Note: Dutch-Netherlands is not listed on the LUIS site and there isn't an equivalent locale so I'm leaving the array empty
    {
        locale: "nl-nl",
        preBuiltEntities: []
    },
]