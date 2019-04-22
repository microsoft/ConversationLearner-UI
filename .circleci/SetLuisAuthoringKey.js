const authoringKeys =
[
  process.env.LUIS_AUTHORING_KEY_ALT_1,
  process.env.LUIS_AUTHORING_KEY_ALT_2,
  process.env.LUIS_AUTHORING_KEY_ALT_3,
  process.env.LUIS_AUTHORING_KEY_ALT_4,
  process.env.LUIS_AUTHORING_KEY_ALT_5,
]

let circleCiBuildNumber = +process.env.CIRCLE_BUILD_NUM

// We have 5 LUIS Authoring Keys that we rotate through.
// We use the Circle CI Build Number to help us get an index to each in sequence.
// Each PUSH into 
let akIndex = Math.floor((circleCiBuildNumber % 10) / 2)


let luisAuthoringKey = authoringKeys[akIndex]

console.log(`export LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`)

