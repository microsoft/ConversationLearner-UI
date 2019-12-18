const fetch = require('node-fetch');

async function* makeTextFileLineIterator(fileURL) {
  //const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  //chunk = chunk ? utf8Decoder.decode(chunk) : '';

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;
  let result;

  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk );//? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

(async function() {
  //for await (let line of makeTextFileLineIterator('https://5321-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/API%20Callbacks%20-%20CreateModels.19.11.30.01.22.04..120.log')) {
  for await (let line of makeTextFileLineIterator('https://circleci.com/api/v1.1/project/github/microsoft/ConversationLearner-UI/5321/artifacts?circle-token=2ad1e457047948114cb3bbb1957d6f90c1e2ee25')) {
  //for await (let line of makeTextFileLineIterator('https://5321-94457606-gh.circle-artifacts.com/0/root/project/results/cypress/API Callbacks - CreateModels.19.11.30.01.22.04..120.log')) {
  //for await (let line of makeTextFileLineIterator('x')) {
    console.log(line);
  }
}())