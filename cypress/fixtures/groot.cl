{
  "trainDialogs": [
    {
      "trainDialogId": "dcdfd051-e918-4dbf-8b3f-17791e7f9882",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "My name is David.",
                "labelEntities": [
                  {
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "David"
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
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "40237225-6b32-48b4-9cb2-0814a87266e9",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.005855560302734375,
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
                "text": "My name is Susan.",
                "labelEntities": [
                  {
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "startCharIndex": 11,
                    "endCharIndex": 15,
                    "entityText": "Susan"
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
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "values": [
                      {
                        "userText": "Susan",
                        "displayText": "Susan",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "40237225-6b32-48b4-9cb2-0814a87266e9",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.011452913284301757,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-10-28T23:29:42.398373+00:00",
      "lastModifiedDateTime": "2018-10-30T21:34:29+00:00"
    },
    {
      "trainDialogId": "f8b55ecc-e57b-470c-bd11-e62251789220",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hello",
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
              "labelAction": "1d49504d-0d54-409c-be9a-163888520bfd",
              "metrics": {
                "predictMetrics": null
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "David",
                "labelEntities": [
                  {
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "startCharIndex": 0,
                    "endCharIndex": 4,
                    "entityText": "David"
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
                    "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
                    "values": [
                      {
                        "userText": "David",
                        "displayText": "David",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "40237225-6b32-48b4-9cb2-0814a87266e9",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.005495548248291016,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-10-10T16:19:04.5085169+00:00",
      "lastModifiedDateTime": "2018-10-30T21:34:29+00:00"
    },
    {
      "trainDialogId": "779fea1c-8697-4cdb-88d3-fe002f176ec3",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Hi",
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
              "labelAction": "1d49504d-0d54-409c-be9a-163888520bfd",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.009505510330200195,
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
                "text": "I am Star-Lord",
                "labelEntities": [
                  {
                    "entityId": "c58a1256-a342-4e17-a11a-cae1743ea8c9",
                    "startCharIndex": 5,
                    "endCharIndex": 13,
                    "entityText": "Star-Lord",
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
                    "entityId": "c58a1256-a342-4e17-a11a-cae1743ea8c9",
                    "values": [
                      {
                        "userText": "Star-Lord",
                        "displayText": "Star-Lord",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "44ec0407-ff56-47d3-b799-e07cb8c28cce",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.006745338439941406,
                  "contextDialogBlisTime": 0
                }
              }
            },
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "c58a1256-a342-4e17-a11a-cae1743ea8c9",
                    "values": [
                      {
                        "userText": "Star-Lord",
                        "displayText": "Star-Lord",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "0bfbe99b-88ed-439b-a3e3-4a575a55da11",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.0056018829345703125,
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
                "text": "China",
                "labelEntities": [
                  {
                    "entityId": "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a",
                    "startCharIndex": 0,
                    "endCharIndex": 4,
                    "entityText": "China"
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
                    "entityId": "c58a1256-a342-4e17-a11a-cae1743ea8c9",
                    "values": [
                      {
                        "userText": "Star-Lord",
                        "displayText": "Star-Lord",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a",
                    "values": [
                      {
                        "userText": "China",
                        "displayText": "China",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "ee6eaa60-aef5-49bf-8605-6633a05aeaf2",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.010330677032470703,
                  "contextDialogBlisTime": 0
                }
              }
            }
          ]
        }
      ],
      "initialFilledEntities": [],
      "createdDateTime": "2018-11-01T19:24:10.1771635+00:00",
      "lastModifiedDateTime": "2018-11-01T19:26:44+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "1d49504d-0d54-409c-be9a-163888520bfd",
      "createdDateTime": "2018-10-09T22:05:19.2545227+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What's your name?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "42bced67-10de-45b1-856c-3df25fd6a575"
      ],
      "suggestedEntity": "42bced67-10de-45b1-856c-3df25fd6a575"
    },
    {
      "actionId": "40237225-6b32-48b4-9cb2-0814a87266e9",
      "createdDateTime": "2018-10-09T22:05:24.9440827+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hello \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"42bced67-10de-45b1-856c-3df25fd6a575\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "42bced67-10de-45b1-856c-3df25fd6a575"
      ],
      "requiredEntities": [
        "42bced67-10de-45b1-856c-3df25fd6a575"
      ],
      "negativeEntities": []
    },
    {
      "actionId": "44ec0407-ff56-47d3-b799-e07cb8c28cce",
      "createdDateTime": "2018-11-01T19:21:08.6723608+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"I am groot\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "c58a1256-a342-4e17-a11a-cae1743ea8c9"
      ],
      "negativeEntities": []
    },
    {
      "actionId": "0bfbe99b-88ed-439b-a3e3-4a575a55da11",
      "createdDateTime": "2018-11-01T19:24:03.6870573+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Where are you?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "c58a1256-a342-4e17-a11a-cae1743ea8c9"
      ],
      "negativeEntities": [
        "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a"
      ],
      "suggestedEntity": "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a"
    },
    {
      "actionId": "ee6eaa60-aef5-49bf-8605-6633a05aeaf2",
      "createdDateTime": "2018-11-01T19:26:40.5509044+00:00",
      "actionType": "TEXT",
      "payload": "{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What are you doing in \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"91bbfa97-0ca0-4afa-ba64-4dd67c7e660a\",\"name\":\"PLACE\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$PLACE\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a"
      ],
      "requiredEntities": [
        "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a"
      ],
      "negativeEntities": []
    }
  ],
  "entities": [
    {
      "entityId": "42bced67-10de-45b1-856c-3df25fd6a575",
      "createdDateTime": "2018-10-09T22:05:11.6217189+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "c58a1256-a342-4e17-a11a-cae1743ea8c9",
      "createdDateTime": "2018-11-01T19:20:51.0531385+00:00",
      "entityName": "guardians",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": false
    },
    {
      "entityId": "91bbfa97-0ca0-4afa-ba64-4dd67c7e660a",
      "createdDateTime": "2018-11-01T19:23:48.8586828+00:00",
      "entityName": "PLACE",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false
    }
  ],
  "packageId": "fc6c898c-2c85-4ee9-bda5-9be9711f7784"
}