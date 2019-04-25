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
// A Build + Test Run is 2 Workflows, each having its own Build Number.
// The Build part does NOT consume a LUIS Authoring Keys, which affects our algorithm,
// thus we need to use one LUIS Authoring Key for every other Build Number.
//
// While this is not perfect, it does work most of the time, and using the same
// key twice in a row everyonce in a while should work out just fine.
let authoringKeyIndex = Math.floor((circleCiBuildNumber % 10) / 2)

let luisAuthoringKey = authoringKeys[authoringKeyIndex]

console.log(`export LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`)
console.log(`export CYPRESS_CIRCLE_BUILD_NUM=${circleCiBuildNumber}\n`)

