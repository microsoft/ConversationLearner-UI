# ConversationLearner-UI

This is the user interface which acts as administration portal for ConversationLearner where you can manage, train, and test your bots.

[![Travis](https://travis-ci.org/Microsoft/ConversationLearner-UI.svg?branch=master)](https://travis-ci.com/Microsoft/ConversationLearner-UI)
[![CircleCI](https://circleci.com/gh/Microsoft/ConversationLearner-UI.svg?style=shield)](https://circleci.com/gh/Microsoft/ConversationLearner-UI)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/github/Microsoft/ConversationLearner-UI?branch=master&svg=true)](https://ci.appveyor.com/project/conversationlearner/conversationlearner-ui)

# Contributing

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Semantic Release

Semantic release works by analyzing all commits that have occurred since the last release, computing the next version to increment based on the most significant commit found, then tagging and publishing a new package with that version.

See: https://semantic-release.gitbooks.io/semantic-release/content/#how-does-it-work

In order to analyze the commit messages reliably they must be in a known format.  To help writing these commits there is a tool at `npm run commit` which acts a wizard walking you through the options.

For most use cases the only change required is to type a special word in front of your normal commit messages. Instead of "add function to compute X" put "feat: add function to compute X".  Based on the rules "feat" is mapped to a "minor" release.

Video Demo: https://youtu.be/qf7c-KxBBZc?t=37s

#

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

