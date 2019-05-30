{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "d1ded172-762e-49df-8be6-3515e3aabf0c",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This can be an entityError",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006857156753540039,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "null",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is a logicError",
                "labelEntities": [
                  {
                    "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
                    "startCharIndex": 10,
                    "endCharIndex": 19,
                    "entityText": "logicError",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
                    "values": [
                      {
                        "userText": "logicError",
                        "displayText": "logicError",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006239652633666992,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "{\"APIError\":\"Error: ExceptionAPI: Logic Error - value: 'logicError'\\n    at Object.<anonymous> (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:165:19)\\n    at Generator.next (<anonymous>)\\n    at C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:7:71\\n    at new Promise (<anonymous>)\\n    at __awaiter (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:3:12)\\n    at Object.logic (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:161:31)\\n    at CLRunner.<anonymous> (C:\\\\repo\\\\ConversationLearner-Samples\\\\node_modules\\\\@conversationlearner\\\\sdk\\\\lib\\\\CLRunner.js:906:60)\\n    at Generator.next (<anonymous>)\\n    at fulfilled (C:\\\\repo\\\\ConversationLearner-Samples\\\\node_modules\\\\tslib\\\\tslib.js:104:62)\"}",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Remove the logicError",
                "labelEntities": [
                  {
                    "entityId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
                    "startCharIndex": 11,
                    "endCharIndex": 20,
                    "entityText": "logicError",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.00707244873046875,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "null",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Can be used to cause an entityError",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006516218185424805,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "null",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Expecting TEXT Action: Test Bug 2151 to make sure that fixing an Exception thrown in the EntityDetectionCallback function cause the TEXT Action to render without error.",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "29cc5f54-2a89-45d5-98c5-54a40aea3df3",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012327194213867187,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This will produce a renderError",
                "labelEntities": [
                  {
                    "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
                    "startCharIndex": 20,
                    "endCharIndex": 30,
                    "entityText": "renderError",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
                    "values": [
                      {
                        "userText": "renderError",
                        "displayText": "renderError",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0066661834716796875,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "This is a logicError",
                "labelEntities": [
                  {
                    "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
                    "startCharIndex": 10,
                    "endCharIndex": 19,
                    "entityText": "logicError"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
                    "values": [
                      {
                        "userText": "renderError",
                        "displayText": "renderError",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
                    "values": [
                      {
                        "userText": "logicError",
                        "displayText": "logicError",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010425090789794922,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "{\"APIError\":\"Error: ExceptionAPI: Logic Error - value: 'logicError'\\n    at Object.<anonymous> (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:165:19)\\n    at Generator.next (<anonymous>)\\n    at C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:7:71\\n    at new Promise (<anonymous>)\\n    at __awaiter (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:3:12)\\n    at Object.logic (C:\\\\repo\\\\ConversationLearner-Samples\\\\lib\\\\demos\\\\testApiCallbacks.js:161:31)\\n    at CLRunner.<anonymous> (C:\\\\repo\\\\ConversationLearner-Samples\\\\node_modules\\\\@conversationlearner\\\\sdk\\\\lib\\\\CLRunner.js:906:60)\\n    at Generator.next (<anonymous>)\\n    at fulfilled (C:\\\\repo\\\\ConversationLearner-Samples\\\\node_modules\\\\tslib\\\\tslib.js:104:62)\"}",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Remove an entityError",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
                    "values": [
                      {
                        "userText": "renderError",
                        "displayText": "renderError",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
                    "values": [
                      {
                        "userText": "logicError",
                        "displayText": "logicError",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "29cc5f54-2a89-45d5-98c5-54a40aea3df3",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011823177337646484,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Remove the logicError, however, you will still see the renderError.",
                "labelEntities": [
                  {
                    "entityId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
                    "startCharIndex": 11,
                    "endCharIndex": 20,
                    "entityText": "logicError"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
                    "values": [
                      {
                        "userText": "renderError",
                        "displayText": "renderError",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011660099029541015,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Clear out the renderError. At this point you should no longer see errors.",
                "labelEntities": [
                  {
                    "entityId": "d21d1aff-5226-48bd-8cb2-5d98107c0474",
                    "startCharIndex": 14,
                    "endCharIndex": 24,
                    "entityText": "renderError",
                    "resolution": {},
                    "builtinType": "LUIS"
                  }
                ]
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012175321578979492,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "null",
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "An entityError shall go here as well",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "959781b1-22a2-4827-934e-dabfd925cd03",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012872934341430664,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "null",
                "changedFilledEntities": []
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2019-05-30T20:50:58.3465747+00:00",
      "lastModifiedDateTime": "2019-05-30T20:52:48+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "826a7141-fab1-490a-bcb7-110bf6f34c5b",
      "createdDateTime": "2019-05-30T20:50:39.884528+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"LogicWithArgs\",\"logicArguments\":[{\"parameter\":\"firstArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"cee65d6e-c352-4f2a-9e12-aeb6e83f714e\",\"name\":\"1stArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$1stArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"secondArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"8df75e1c-10c4-4372-ae8b-c00f9c2e7f45\",\"name\":\"2ndArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$2ndArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}}],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "cee65d6e-c352-4f2a-9e12-aeb6e83f714e",
        "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45"
      ],
      "requiredEntities": [
        "cee65d6e-c352-4f2a-9e12-aeb6e83f714e",
        "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "959781b1-22a2-4827-934e-dabfd925cd03",
      "createdDateTime": "2019-05-30T20:50:39.8845816+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"ExceptionAPI\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "58e46e56-cdd5-43f1-bce9-46fbcdab1cbf",
      "createdDateTime": "2019-05-30T20:50:39.8846004+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"LogicWithNoArgs\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "e392c880-a3d0-4ae6-9b17-66d8275b551c",
      "createdDateTime": "2019-05-30T20:50:39.8846078+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"Malformed\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "9394e0bb-add6-4603-89dd-293e5d457f56",
      "createdDateTime": "2019-05-30T20:50:39.8846144+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"RenderTheArgs\",\"logicArguments\":[{\"parameter\":\"firstArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"cee65d6e-c352-4f2a-9e12-aeb6e83f714e\",\"name\":\"1stArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$1stArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"secondArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"8df75e1c-10c4-4372-ae8b-c00f9c2e7f45\",\"name\":\"2ndArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$2ndArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"thirdArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"333\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fourthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"4444\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fifthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"five\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"sixthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"six\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"seventhArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"seven\",\"marks\":[]}]}]}]}}}}],\"renderArguments\":[{\"parameter\":\"firstArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"cee65d6e-c352-4f2a-9e12-aeb6e83f714e\",\"name\":\"1stArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$1stArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"secondArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"8df75e1c-10c4-4372-ae8b-c00f9c2e7f45\",\"name\":\"2ndArg\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$2ndArg\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"thirdArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"three\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fourthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"four\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fifthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"55555\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"sixthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"666666\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"seventhArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"7777777\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "cee65d6e-c352-4f2a-9e12-aeb6e83f714e",
        "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45"
      ],
      "requiredEntities": [
        "cee65d6e-c352-4f2a-9e12-aeb6e83f714e",
        "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "e2fe8cf8-030a-4996-9616-a07371f200a2",
      "createdDateTime": "2019-05-30T20:50:39.8846227+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"BadCard\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "40209d26-8004-48ef-95b2-f69f1d234ace",
      "createdDateTime": "2019-05-30T20:50:39.8846298+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"TextCard\",\"logicArguments\":[],\"renderArguments\":[{\"parameter\":\"cardTitle\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Greetings\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"cardText\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Have a great day!\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    },
    {
      "actionId": "29cc5f54-2a89-45d5-98c5-54a40aea3df3",
      "createdDateTime": "2019-05-30T20:50:39.8846456+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"This is a TEXT ACTION\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": [],
        "isStubbed": false
      }
    }
  ],
  "entities": [
    {
      "entityId": "cee65d6e-c352-4f2a-9e12-aeb6e83f714e",
      "createdDateTime": "2019-05-30T20:50:39.8843867+00:00",
      "entityName": "1stArg",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45",
      "createdDateTime": "2019-05-30T20:50:39.8844201+00:00",
      "entityName": "2ndArg",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "3193f801-7392-4376-88e4-f225892d7de4",
      "negativeId": "c6a7590d-da9e-487e-aa7f-3c68a8f57a50",
      "createdDateTime": "2019-05-30T20:50:39.8844317+00:00",
      "entityName": "entityError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "c6a7590d-da9e-487e-aa7f-3c68a8f57a50",
      "positiveId": "3193f801-7392-4376-88e4-f225892d7de4",
      "createdDateTime": "2019-05-30T20:50:39.8844412+00:00",
      "entityName": "~entityError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
      "negativeId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
      "createdDateTime": "2019-05-30T20:50:39.8844633+00:00",
      "entityName": "logicError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
      "positiveId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
      "createdDateTime": "2019-05-30T20:50:39.8844736+00:00",
      "entityName": "~logicError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
      "negativeId": "d21d1aff-5226-48bd-8cb2-5d98107c0474",
      "createdDateTime": "2019-05-30T20:50:39.8844838+00:00",
      "entityName": "renderError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "d21d1aff-5226-48bd-8cb2-5d98107c0474",
      "positiveId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
      "createdDateTime": "2019-05-30T20:50:39.8845097+00:00",
      "entityName": "~renderError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    }
  ],
  "packageId": "5510676c-35cc-44d9-8a8b-94dafe68d468"
}