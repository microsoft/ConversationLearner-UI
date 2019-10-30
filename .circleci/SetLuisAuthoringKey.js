const authoringKeys = [
  process.env.LUIS_AUTHORING_KEY_ALT_1,
  process.env.LUIS_AUTHORING_KEY_ALT_2,
  process.env.LUIS_AUTHORING_KEY_ALT_3,
  process.env.LUIS_AUTHORING_KEY_ALT_4,
  process.env.LUIS_AUTHORING_KEY_ALT_5,
  process.env.LUIS_AUTHORING_KEY_ALT_6,
  process.env.LUIS_AUTHORING_KEY_ALT_7,
  process.env.LUIS_AUTHORING_KEY_ALT_8,
  process.env.LUIS_AUTHORING_KEY_ALT_9,
  process.env.LUIS_AUTHORING_KEY_ALT_10,
  process.env.LUIS_AUTHORING_KEY_ALT_11,
]

let buildNumber = +process.env.CIRCLE_BUILD_NUM

// We have 11 LUIS Authoring Keys that we rotate through.
// We use the Circle CI Build Number to help us get an index to each in sequence.

// Each time a build workflow is kicked off there are 3 jobs:
//  1) the actual build
//  2) the smoke test run
//  3) the regression test run

// The two test jobs will each consume the resources of one of our authoring keys.
// The actual build job will NOT consume the resources of one of our authoring keys, but
// that is okay since as we cycle through the list of authoring keys the next time through
// the previously unused keys will get used and different authoring keys will go unused.

let authoringKeyIndex = Math.floor(buildNumber % authoringKeys.length)
let luisAuthoringKey = authoringKeys[authoringKeyIndex]

// Because of the math used in the algorithm above, the number of authoring keys should
// not be divisible by 3, otherwise 1 out of every 3 keys will rarely get used.
// There are other things can influence the next build number to be used, like if the
// build fails, then the other two jobs won't run so only 1 build number
// will be consumed.

console.log(`export LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`)
console.log(`export CYPRESS_BUILD_NUM=${buildNumber}\n`)

