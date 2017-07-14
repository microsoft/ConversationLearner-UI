export const PreBuilts = {
	DatetimeV2: "DatetimeV2",
	Datetime: "Datetime",
	Number: "Number",
	Ordinal: "Ordinal",
	Percentage: "Percentage",
	Temperature: "Temperature",
	Dimension: "Dimension",
	Money: "Money",
	Age: "Age",
	Geography: "Geography",
	Encyclopedia: "Encyclopedia",
	URL: "URL",
	Email: "Email",
	Phone_number: "Phone number"
}
export interface LocalePreBuilts {
	locale: string,
	preBuiltEntities: string[],
}

export const PreBuiltEntities: LocalePreBuilts[] = [
	{
		locale: "en-us",
		preBuiltEntities: [PreBuilts.DatetimeV2, PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age,
			PreBuilts.Geography, PreBuilts.Encyclopedia, PreBuilts.URL, PreBuilts.Email, PreBuilts.Phone_number]
	},
	{
		locale: "zh-cn",
		preBuiltEntities: [PreBuilts.DatetimeV2, PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "fr-fr",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
		//Note: French-Canada is not listed on the LUIS site so I am using the same prebuilts as French-France
	{
		locale: "fr-ca",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "es-es",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
		//Note: Spanish-Mexican is not listed on the LUIS site so I am using the same prebuilts as Spanish-Spain
	{
		locale: "es-mx",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "it-it",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "de-de",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "ja-jp",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "pt-br",
		preBuiltEntities: [PreBuilts.Datetime, PreBuilts.Number, PreBuilts.Ordinal,
			PreBuilts.Percentage, PreBuilts.Temperature, PreBuilts.Dimension, PreBuilts.Money, PreBuilts.Age]
	},
	{
		locale: "ko-kr",
		preBuiltEntities: []
	},
		//Note: Dutch-Netherlands is not listed on the LUIS site and there isnt an equivalent locale so I'm leaving the array empty
	{
		locale: "nl-nl",
		preBuiltEntities: []
	},
]