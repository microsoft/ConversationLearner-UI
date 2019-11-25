# Building conversationlearner-ui package

- Why do we create npm package of CRA output?

  The build output of create-reat-app projects is a single folder of static assets and these would normally be served through CDN, Azure BlobStorage, or AWS S3 and viewed through wellknown address such as Conversationlearner-ui.azurewebsites.net; however, this works best when the user can always use the most up-to-date UI without worrying about versions.
  
  Conversation Learner has the unique situation where the UI is only useful if it can make calls to a locally running service which hosts the ConversationLearner-SDK. The HTTP calls made by UI to the SDK change as the product is developed these to be synchronized to avoid conflicts due to version mismatches (E.g. user goes to Conversationlearner-ui.azurewebsites.net which is always latest but yet has an older version of the SDK running locally).

  To avoid this scenario, the SDK comes with the version of the UI that is known to work with it. To do this we create a npm package of the static resources and then use express to host them.

- Steps to build the package:

  There are scripts to automate the process.

  See: `npm run builduipackage`

  1. Build react app: `npm run build`
  2. Build index.ts from `/packageScripts` folder: `npm run tsc -- --outDir ./package -p ./packageScripts/tsconfig.json`

     This effectively generates the: `index.js` and `index.d.ts` which are the entry point for the package inside the `/package` folder

  3. Build createPackage script: `npm run tsc -- -p ./scripts/tsconfig.json`

     This just generates the `createPackage.js` file and is only required because we're using typescript. (Alternative is to use ts-node)

  4. Run createPackage scripts: `node ./scripts/createPackage.js`

     This script creates a new package.json file and copies the contents of the `/build` folder into the `/package` folder. (Note this is a different `package.json` than the one at the root)

  > At this point the `/package` folder should have all of the contents necessary to be considered valid NPM package

  5. Navigate into the `/package` folder and set the package version to the appropriate value

  > The package folder is now ready for publishing.

  6. Run `npm publish`

## Future Improvements

- Make `/package` folder arbitrary instead of hard-coded.
 - The createPackage script assumes /package folder (Change to accept arguments)
 - The builds assumes /package folder (This is ok, but noted here in case it changes)
