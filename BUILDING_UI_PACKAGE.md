# Building conversationlearner-ui package

- Why do we create npm package of CRA output?

  The build output of create-reat-app projects is a single folder of static assets and these would normally be served through CDN, Azure BlobStorage, or AWS S3 and viewed through wellknown address such as onversationlearner-ui.azurewebsites.net; however, this works best when the user can always use the most up-to-date UI without worrying about versions.
  
  Conversation Learner has the unique situation where the UI is only useful if it can make calls to a locally running service which hosts the ConversationLearner-SDK. The HTTP calls made by UI to the SDK change as the product is developed these to be synchronized to avoid conflicts due to version mismatches (E.g. user goes to onversationlearner-ui.azurewebsites.net which is alwasy latest but yet has an older version of the SDK running locally).

  To avoid this scenario, the SDK comes with the version of the UI that is known to work with it. To do this we create a npm package of the static resources and then use express to host them.

- Steps to publish the package:

  There are scripts to automate the process but they don't seem to work all the time and don't publish.

  See: `npm run builduipackage`

  1. Build react app: `npm run build`
  2. Build index.ts from /publish folder: `npm run tsc -- -p ./publish/tsconfig.json`

     This effectively generates the: `index.js` and `index.d.ts` which are the entry point for the package inside the `/package` folder

  3. Build publish script: `npm run tsc -- -p ./scripts/tsconfig.json`

     This just generates the publish.js file and is only required because we're using typescript. (Alternative is to use ts-node)

  4. Run publish scripts: `node ./scripts/publish.js`

     This script copies the contents of the `/build` folder, `./.npmrc`, and `./publish/package.json` file into the `/package` folder. (Not this is different `package.json` than the one at the root)

  > At this point the /package folder should have all of the contents necessary to be considered valid NPM package

  5. Navigate into the /package folder and increment the package version and publish

  6. Run 'npm publish'


## Future Improvements

- Find way to complete automation so this script can be run by VSTS or Travis CI
  - When I was testing I would run into persmissions errors when trying to copy files into package folder.
- Could re-use package.json from root and modify in the publish script
  - Downside of this is added complexity for little benefit.  Even though it's duplicating the package name and version, it gives you an easy declaritive way to know exactly what the package.json will be when publishing.
- Set outDir for scripts and publish tsconfigs using command line to make /package folder arbitrary instead of hardcoded.