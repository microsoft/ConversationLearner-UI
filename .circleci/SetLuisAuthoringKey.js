const fs = require('fs')

let circleCiBuildNumber = +process.env.CIRCLE_BUILD_NUM
let randomIndex = (circleCiBuildNumber % 10) / 2

fs.writeFileSync('results/temp.txt', `CIRCLE_BUILD_NUM=${circleCiBuildNumber} - randomIndex=${randomIndex}`)

const authoringKeys =
[
  process.env.LUIS_AUTHORING_KEY_ALT_1,
  process.env.LUIS_AUTHORING_KEY_ALT_2,
  process.env.LUIS_AUTHORING_KEY_ALT_3,
  process.env.LUIS_AUTHORING_KEY_ALT_4,
  process.env.LUIS_AUTHORING_KEY_ALT_5,
]

// Randomly pick an authoring key from the array.
//let randomIndex = new Date().getTime() % 5
let luisAuthoringKey = authoringKeys[randomIndex]

console.log(`export LUIS_AUTHORING_KEY=${luisAuthoringKey}\n`)

