# Release Tests

These tests can't be run directly against this repo. They are intended to be run against the running bot when the UI is served at /ui. Normally these test would exist in the [samples repo](https://github.com/microsoft/ConversationLearner-Samples) where they are run against but that requires installing cypress and splitting test code logic which is likely a bigger problem to synchronize.

You can run these by starting cypress with the `baseUrl` configured to the bot URL instead of defaulting to the UI URL. Default bot URL of samples repo is `http://localhost:3978`.