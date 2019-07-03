{
  "trainDialogs": [
    {
      "validity": "invalid",
      "tags": [],
      "description": "",
      "trainDialogId": "bd1a7ee7-413b-4f6f-b00f-5dd9fb2fc395",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My entity: AABBCC",
                "labelEntities": [
                  {
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "startCharIndex": 11,
                    "endCharIndex": 16,
                    "entityText": "AABBCC",
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
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "values": [
                      {
                        "userText": "AABBCC",
                        "displayText": "AABBCC",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2861f35c-f95d-42aa-ba11-aad48c78747f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.023157119750976562,
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
                "text": "Error is Intentional",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": []
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Error is Intentional",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "values": [
                      {
                        "userText": "AABBCC",
                        "displayText": "AABBCC",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "7182a7b1-3e12-4941-86d9-b66df6b27943",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010521888732910156,
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
      "createdDateTime": "2019-06-27T01:40:53.7937908+00:00",
      "lastModifiedDateTime": "2019-06-28T18:03:08+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "3e655af8-0878-4185-bb7a-7045c916c30f",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "An entity: EEEFFFGGG",
                "labelEntities": [
                  {
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "startCharIndex": 11,
                    "endCharIndex": 19,
                    "entityText": "EEEFFFGGG",
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
                    "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
                    "values": [
                      {
                        "userText": "EEEFFFGGG",
                        "displayText": "EEEFFFGGG",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "2861f35c-f95d-42aa-ba11-aad48c78747f",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.02505326271057129,
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
      "createdDateTime": "2019-06-27T01:42:38.7681459+00:00",
      "lastModifiedDateTime": "2019-06-28T04:16:36+00:00"
    },
    {
      "tags": [],
      "description": "",
      "trainDialogId": "93c5d0be-2656-4738-92ad-85b603ded19c",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "API",
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
              "labelAction": "b18ea12b-1c0d-4bf2-a720-6ae91936a544",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.21696162223815918,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": null,
                "changedFilledEntities": []
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Give me a fruit",
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
              "labelAction": "376b4b47-6645-442a-ba55-7391b8dcd067",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.02979731559753418,
                  "contextDialogBlisTime": 0
                }
              }
            },
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "69da0454-d2c6-4cbe-930c-68053d20b4ff",
                    "values": [
                      {
                        "userText": "STRAWBERRY",
                        "displayText": "STRAWBERRY",
                        "builtinType": null,
                        "enumValueId": "0ec48bd6-3be2-4dd5-ab15-04df68b88483",
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "3c964fad-47cf-4fb8-9969-2db042be303e",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.008242368698120117,
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
                "text": "No",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "69da0454-d2c6-4cbe-930c-68053d20b4ff",
                    "values": [
                      {
                        "userText": "STRAWBERRY",
                        "displayText": "STRAWBERRY",
                        "builtinType": null,
                        "enumValueId": "0ec48bd6-3be2-4dd5-ab15-04df68b88483",
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "7182a7b1-3e12-4941-86d9-b66df6b27943",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.007883548736572265,
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
                "text": "We are done here.",
                "labelEntities": []
              }
            ]
          },
          "scorerSteps": [
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "69da0454-d2c6-4cbe-930c-68053d20b4ff",
                    "values": [
                      {
                        "userText": "STRAWBERRY",
                        "displayText": "STRAWBERRY",
                        "builtinType": null,
                        "enumValueId": "0ec48bd6-3be2-4dd5-ab15-04df68b88483",
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "11144c6c-8766-4686-b9df-89e6704c2be0",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.016796112060546875,
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
      "createdDateTime": "2019-06-28T20:49:09.5027262+00:00",
      "lastModifiedDateTime": "2019-06-28T20:50:48+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "2861f35c-f95d-42aa-ba11-aad48c78747f",
      "createdDateTime": "2019-06-26T17:48:04.8519207+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Your entity contains: \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"ff31242c-2956-4825-a0b2-c1fa2dbe3670\",\"name\":\"entity\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$entity\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "ff31242c-2956-4825-a0b2-c1fa2dbe3670"
      ],
      "requiredEntities": [
        "ff31242c-2956-4825-a0b2-c1fa2dbe3670"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "7182a7b1-3e12-4941-86d9-b66df6b27943",
      "createdDateTime": "2019-06-26T18:27:45.7177153+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Something extra\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "06e8e882-1fea-4a74-8a86-bace10408ec5",
      "createdDateTime": "2019-06-27T02:07:45.9229068+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Can be deleted - not used in a Train Dialog\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "b18ea12b-1c0d-4bf2-a720-6ae91936a544",
      "createdDateTime": "2019-06-28T19:39:01.2998969+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"LogicWithNoArgs\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "3c964fad-47cf-4fb8-9969-2db042be303e",
      "createdDateTime": "2019-06-28T19:39:42.6863121+00:00",
      "actionType": "CARD",
      "payload": "{\"payload\":\"prompt\",\"arguments\":[{\"parameter\":\"question\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Do you like being questioned?\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"button1\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Yes\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"button2\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"No\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "11144c6c-8766-4686-b9df-89e6704c2be0",
      "createdDateTime": "2019-06-28T19:40:11.950512+00:00",
      "actionType": "END_SESSION",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Goodbye\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "376b4b47-6645-442a-ba55-7391b8dcd067",
      "createdDateTime": "2019-06-28T19:43:03.1565035+00:00",
      "actionType": "SET_ENTITY",
      "payload": "{\"entityId\":\"69da0454-d2c6-4cbe-930c-68053d20b4ff\",\"enumValueId\":\"0ec48bd6-3be2-4dd5-ab15-04df68b88483\"}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "entityId": "69da0454-d2c6-4cbe-930c-68053d20b4ff",
      "enumValueId": "0ec48bd6-3be2-4dd5-ab15-04df68b88483",
      "clientData": {
        "importHashes": []
      }
    }
  ],
  "entities": [
    {
      "entityId": "ff31242c-2956-4825-a0b2-c1fa2dbe3670",
      "createdDateTime": "2019-06-26T17:48:04.8518943+00:00",
      "entityName": "entity",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "8f134ded-4497-498b-9aad-d40ace96bb29",
      "createdDateTime": "2019-06-26T19:55:12.3264242+00:00",
      "entityName": "required",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "69da0454-d2c6-4cbe-930c-68053d20b4ff",
      "createdDateTime": "2019-06-28T19:42:05.4922962+00:00",
      "entityName": "fruits",
      "entityType": "ENUM",
      "isMultivalue": false,
      "isNegatible": false,
      "enumValues": [
        {
          "enumValueId": "cb97862b-dc43-4674-89ec-817dc24f2883",
          "enumValue": "APPLE"
        },
        {
          "enumValueId": "bf5f3b01-29d9-48c2-a985-88a8858b12c1",
          "enumValue": "ORANGE"
        },
        {
          "enumValueId": "4d396d4e-515e-4b78-91a3-17d27d8bcb2b",
          "enumValue": "BANANA"
        },
        {
          "enumValueId": "34c5a43a-f3dd-472a-aab2-fa7255868550",
          "enumValue": "PEACH"
        },
        {
          "enumValueId": "0ec48bd6-3be2-4dd5-ab15-04df68b88483",
          "enumValue": "STRAWBERRY"
        }
      ]
    }
  ],
  "packageId": "f66d5ccb-f5a4-4c48-803f-8a699ecdd8bb"
}