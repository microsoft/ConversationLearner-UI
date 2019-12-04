window.addEventListener("unhandledrejection", event => {
  console.log(`Unhandled Promise Rejection Reason: ${event.reason}`)
  console.log(`Unhandled Promise Rejection Promise: ${event.promise}`)
  event.preventDefault();
}, false);


async function f(valueToReturn) {
  return valueToReturn
}

f(1).then(rv => {console.log(rv)});

(async function() {
  let rv = await f(2)
  console.log(rv)
}())


new Promise((resolve, reject) => {
  console.log('Initial');
  throw new Error('Something failed');
  resolve();
})
.then(() => {
  //throw new Error('Something failed');
      
  console.log('Do this');
})
// .catch(() => {
//   console.error('Caught Error');
// })
// .then(() => {
//   console.log('Do this, no matter what happened before');
// });

