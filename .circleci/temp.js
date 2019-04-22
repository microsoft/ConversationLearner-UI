let circleCiBuildNumber = +process.env.CIRCLE_BUILD_NUM
let randomIndex = (circleCiBuildNumber % 10) / 2
console.log(`CIRCLE_BUILD_NUM=${circleCiBuildNumber} - randomIndex=${randomIndex}`)
