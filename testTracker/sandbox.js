function f(valueToReturn) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(valueToReturn), 1000)
  });

  promise.then(retVal => {
    console.log(`Promise Returned: ${retVal} Expected: ${valueToReturn}`)
    if(retVal != valueToReturn) {
      throw new Error(`Promise returned: ${retVal} but we were expecting: ${valueToReturn}`)
    }
    return retVal
  })
  console.log('No, this is frustrating!')  
  return 'Not what I want'
}

const returnedValue = f('EXPECTED VALUE')
console.log(returnedValue)

setTimeout(() => console.log('We are DONE!'), 1200)

// f(1).then(rv => {console.log(rv)});

// (async function() {
//   let rv = await f(2)
//   console.log(rv)
// }())
