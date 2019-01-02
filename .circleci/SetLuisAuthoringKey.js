const authoringKeys =
[
  process.env.LUIS_AUTHORING_KEY_ALT_1,
  process.env.LUIS_AUTHORING_KEY_ALT_2,
  process.env.LUIS_AUTHORING_KEY_ALT_3,
  process.env.LUIS_AUTHORING_KEY_ALT_4,
  process.env.LUIS_AUTHORING_KEY_ALT_5,
]

// Randomly pick an authoring key from the array.
var randomIndex = new Date().getTime() % 5
var luisAuthoringKey = authoringKeys[randomIndex]

console.log(`export LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`)
