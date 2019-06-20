{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "112a4a2a-118f-4494-b1db-1acfc27ea5c6",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hey",
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
              "labelAction": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0064601898193359375,
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
                "text": "Sam",
                "labelEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "startCharIndex": 0,
                    "endCharIndex": 2,
                    "entityText": "Sam"
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "b0aa963e-fcb6-438f-93d3-5e6ed233c43f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012094259262084961,
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
                "text": "Hey",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "3fcee609-770b-46af-b9d8-d938c3a0cc5d",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010582923889160156,
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
                "text": "world peace",
                "labelEntities": [
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "startCharIndex": 0,
                    "endCharIndex": 10,
                    "entityText": "world peace"
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Sam",
                        "displayText": "Sam",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "world peace",
                        "displayText": "world peace",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "f164a42c-6887-402e-9196-0af0028e5ac4",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.00603938102722168,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-06-18T00:16:31.6171539+00:00",
      "lastModifiedDateTime": "2019-06-18T00:16:31+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "e9d47470-c110-40ba-903f-582d03973de9",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "I love candy!",
                "labelEntities": [
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "startCharIndex": 7,
                    "endCharIndex": 11,
                    "entityText": "candy",
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
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "candy",
                        "displayText": "candy",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010935544967651367,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-06-19T03:20:14.7928994+00:00",
      "lastModifiedDateTime": "2019-06-19T03:21:19+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "2c59e607-33e7-46b3-8f1a-7b369c3f315c",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "I want a car!",
                "labelEntities": [
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "startCharIndex": 9,
                    "endCharIndex": 11,
                    "entityText": "car",
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
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "car",
                        "displayText": "car",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01139211654663086,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "clientData": {
        "importHashes": []
      },
      "initialFilledEntities": [],
      "createdDateTime": "2019-06-19T03:21:36.2992948+00:00",
      "lastModifiedDateTime": "2019-06-19T03:21:57+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
      "createdDateTime": "2019-06-18T00:16:31.6170716+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "suggestedEntity": "404f9cd3-46ec-4924-9324-226db8823a9b",
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "b0aa963e-fcb6-438f-93d3-5e6ed233c43f",
      "createdDateTime": "2019-06-18T00:16:31.617108+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "3fcee609-770b-46af-b9d8-d938c3a0cc5d",
      "createdDateTime": "2019-06-18T00:16:31.6171253+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hey \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", what do you really want?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "suggestedEntity": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "f164a42c-6887-402e-9196-0af0028e5ac4",
      "createdDateTime": "2019-06-18T00:16:31.617133+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Sorry \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\", I can't help you get \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "9be2399d-08b8-4397-abdb-bab2225462ed",
      "createdDateTime": "2019-06-19T00:03:54.3679037+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"RenderTheArgs\",\"logicArguments\":[{\"parameter\":\"firstArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"secondArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"f823b377-e2a3-4352-a9ce-ab0021e5e04f\",\"name\":\"sweets\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$sweets\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"thirdArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fourthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"4\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fifthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"5\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"sixthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"6\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"seventhArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"7\",\"marks\":[]}]}]}]}}}}],\"renderArguments\":[{\"parameter\":\"firstArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"secondArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"f823b377-e2a3-4352-a9ce-ab0021e5e04f\",\"name\":\"sweets\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$sweets\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"thirdArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fourthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"4\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"fifthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"5\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"sixthArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"6\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"seventhArg\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"7\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "5d49b81b-c817-4ac5-b4e5-4049dfd146ca",
      "createdDateTime": "2019-06-19T00:05:59.1944383+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Something to do with $name \",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "e1e9831b-167c-414a-bf59-e3687484d243",
      "createdDateTime": "2019-06-19T01:17:10.4608153+00:00",
      "actionType": "END_SESSION",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"name:\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" sweets:\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"f823b377-e2a3-4352-a9ce-ab0021e5e04f\",\"name\":\"sweets\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$sweets\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" want:\",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"5848b1fb-c443-4b92-841d-ba96f0e8c7b3\",\"name\":\"want\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$want\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b",
        "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
        "5848b1fb-c443-4b92-841d-ba96f0e8c7b3"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "5d3c2eec-4023-4dd6-842c-0f19380da191",
      "createdDateTime": "2019-06-19T01:37:39.2314365+00:00",
      "actionType": "CARD",
      "payload": "{\"payload\":\"prompt\",\"arguments\":[{\"parameter\":\"question\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hi \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    }
  ],
  "entities": [
    {
      "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
      "createdDateTime": "2019-06-18T00:16:31.6170044+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
      "createdDateTime": "2019-06-18T00:16:31.6170432+00:00",
      "entityName": "want",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
      "createdDateTime": "2019-06-18T00:16:31.6170557+00:00",
      "entityName": "sweets",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
      "negativeId": "d0390686-8fc3-4c9c-bfa1-889efd0b126c",
      "createdDateTime": "2019-06-19T03:19:59.0199575+00:00",
      "entityName": "canBeDeleted",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "d0390686-8fc3-4c9c-bfa1-889efd0b126c",
      "positiveId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
      "createdDateTime": "2019-06-19T03:19:59.0200168+00:00",
      "entityName": "~canBeDeleted",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    }
  ],
  "packageId": "59fd6ad9-2957-4d18-b5e2-623136e6dd8b"
}