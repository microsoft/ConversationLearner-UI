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
    }
  ],
  "packageId": "f66d5ccb-f5a4-4c48-803f-8a699ecdd8bb"
}{
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
    }
  ],
  "packageId": "f66d5ccb-f5a4-4c48-803f-8a699ecdd8bb"
}