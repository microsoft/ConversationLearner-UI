{
  "trainDialogs": [
    {
      "tags": [],
      "description": "",
      "trainDialogId": "289a2359-c39f-4111-bc73-951dbf36f305",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "We will delete this entity.",
                "labelEntities": [
                  {
                    "entityId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
                    "startCharIndex": 20,
                    "endCharIndex": 25,
                    "entityText": "entity",
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
                    "entityId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
                    "values": [
                      {
                        "userText": "entity",
                        "displayText": "entity",
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
                  "blisTime": 0.013550996780395507,
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
                "text": "Will also delete this entity.",
                "labelEntities": [
                  {
                    "entityId": "ad3a5e85-6219-4225-abd7-fdcd080ca4fd",
                    "startCharIndex": 22,
                    "endCharIndex": 27,
                    "entityText": "entity",
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
                    "entityId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
                    "values": [
                      {
                        "userText": "entity",
                        "displayText": "entity",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "ad3a5e85-6219-4225-abd7-fdcd080ca4fd",
                    "values": [
                      {
                        "userText": "entity",
                        "displayText": "entity",
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
                  "blisTime": 0.010617494583129882,
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
      "createdDateTime": "2019-07-10T02:11:41.8483814+00:00",
      "lastModifiedDateTime": "2019-07-10T02:11:41+00:00"
    },
    {
      "tags": [
        "Tag1abc"
      ],
      "description": "Abc123",
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
      "createdDateTime": "2019-07-10T02:11:41.8483629+00:00",
      "lastModifiedDateTime": "2019-07-11T01:01:08+00:00"
    },
    {
      "tags": [
        "Tag2xyz"
      ],
      "description": "Xyz789",
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
      "createdDateTime": "2019-07-10T02:11:41.848338+00:00",
      "lastModifiedDateTime": "2019-07-11T01:01:43+00:00"
    },
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
      "createdDateTime": "2019-07-10T02:11:41.8482632+00:00",
      "lastModifiedDateTime": "2019-07-10T02:11:41+00:00"
    },
    {
      "validity": "invalid",
      "tags": [
        "Tag3UseItAllUp"
      ],
      "description": "Use all the actions and entities",
      "trainDialogId": "ef577abb-d9dc-4f75-a1fc-9d9727095682",
      "rounds": [
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Use all Actions and Entities",
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
              "labelAction": "5d49b81b-c817-4ac5-b4e5-4049dfd146ca",
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
                "text": "Why a Dollar Sign in front of name?",
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
                "predictMetrics": null
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Michael",
                "labelEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "startCharIndex": 0,
                    "endCharIndex": 6,
                    "entityText": "Michael"
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
                        "userText": "Michael",
                        "displayText": "Michael",
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
                "predictMetrics": null
              }
            }
          ]
        },
        {
          "extractorStep": {
            "textVariations": [
              {
                "text": "Do you have any chocolate?",
                "labelEntities": [
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "startCharIndex": 16,
                    "endCharIndex": 24,
                    "entityText": "chocolate",
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
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
                  "blisTime": 0.009536027908325195,
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
                "text": "A working test suite!",
                "labelEntities": [
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "startCharIndex": 0,
                    "endCharIndex": 20,
                    "entityText": "A working test suite!"
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
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "A working test suite!",
                        "displayText": "A working test suite!",
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
                  "blisTime": 0.014495134353637695,
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
                "text": "Call me at (425) 372-1234",
                "labelEntities": [
                  {
                    "entityId": "302f1cc9-1c1f-467a-a1bb-2ec1257e6528",
                    "startCharIndex": 11,
                    "endCharIndex": 24,
                    "entityText": "(425) 372-1234",
                    "resolution": {
                      "score": "1",
                      "value": "(425) 372-1234"
                    },
                    "builtinType": "builtin.phonenumber"
                  },
                  {
                    "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
                    "startCharIndex": 11,
                    "endCharIndex": 24,
                    "entityText": "(425) 372-1234",
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
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "A working test suite!",
                        "displayText": "A working test suite!",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
                    "values": [
                      {
                        "userText": "(425) 372-1234",
                        "displayText": "(425) 372-1234",
                        "builtinType": "builtin.phonenumber",
                        "resolution": {
                          "score": "1",
                          "value": "(425) 372-1234"
                        }
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "5d3c2eec-4023-4dd6-842c-0f19380da191",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.012289762496948242,
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
                "text": "I like to win!",
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
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "A working test suite!",
                        "displayText": "A working test suite!",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
                    "values": [
                      {
                        "userText": "(425) 372-1234",
                        "displayText": "(425) 372-1234",
                        "builtinType": "builtin.phonenumber",
                        "resolution": {
                          "score": "1",
                          "value": "(425) 372-1234"
                        }
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "9be2399d-08b8-4397-abdb-bab2225462ed",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01341104507446289,
                  "contextDialogBlisTime": 0
                }
              },
              "logicResult": {
                "logicValue": "\"The Logic Args: 'Michael', 'chocolate', 'A working test suite!', '4', '5', '6', '7'\"",
                "changedFilledEntities": []
              }
            },
            {
              "input": {
                "filledEntities": [
                  {
                    "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
                    "values": [
                      {
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "A working test suite!",
                        "displayText": "A working test suite!",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
                    "values": [
                      {
                        "userText": "(425) 372-1234",
                        "displayText": "(425) 372-1234",
                        "builtinType": "builtin.phonenumber",
                        "resolution": {
                          "score": "1",
                          "value": "(425) 372-1234"
                        }
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
                  "blisTime": 0.006253480911254883,
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
                "text": "I'm feeling lucky!",
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
                        "userText": "Michael",
                        "displayText": "Michael",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
                    "values": [
                      {
                        "userText": "chocolate",
                        "displayText": "chocolate",
                        "builtinType": "LUIS",
                        "resolution": {}
                      }
                    ]
                  },
                  {
                    "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
                    "values": [
                      {
                        "userText": "A working test suite!",
                        "displayText": "A working test suite!",
                        "builtinType": null,
                        "resolution": null
                      }
                    ]
                  },
                  {
                    "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
                    "values": [
                      {
                        "userText": "(425) 372-1234",
                        "displayText": "(425) 372-1234",
                        "builtinType": "builtin.phonenumber",
                        "resolution": {
                          "score": "1",
                          "value": "(425) 372-1234"
                        }
                      }
                    ]
                  }
                ],
                "context": {},
                "maskedActions": []
              },
              "labelAction": "e1e9831b-167c-414a-bf59-e3687484d243",
              "metrics": {
                "predictMetrics": {
                  "blisTime": 0.01230001449584961,
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
      "createdDateTime": "2019-07-11T01:33:22.6636863+00:00",
      "lastModifiedDateTime": "2019-07-11T02:25:02+00:00"
    }
  ],
  "actions": [
    {
      "actionId": "4b790d93-867b-4c08-bf63-b9e1ab241e3f",
      "createdDateTime": "2019-07-10T02:11:41.8480986+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8481486+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8481675+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8481776+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8481853+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8482107+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8482181+00:00",
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
      "createdDateTime": "2019-07-10T02:11:41.8482271+00:00",
      "actionType": "CARD",
      "payload": "{\"payload\":\"prompt\",\"arguments\":[{\"parameter\":\"question\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Hi \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"404f9cd3-46ec-4924-9324-226db8823a9b\",\"name\":\"name\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$name\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" at \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"87b4870c-b2b3-4417-a13b-ef2134cb9278\",\"name\":\"mobilePhoneNumber\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$mobilePhoneNumber\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"button1\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"I like to win!\",\"marks\":[]}]}]}]}}}},{\"parameter\":\"button2\",\"value\":{\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"line\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"I'm feeling lucky!\",\"marks\":[]}]}]}]}}}}]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [
        "87b4870c-b2b3-4417-a13b-ef2134cb9278",
        "404f9cd3-46ec-4924-9324-226db8823a9b"
      ],
      "requiredEntities": [
        "87b4870c-b2b3-4417-a13b-ef2134cb9278",
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
      "doNotMemorize": true,
      "entityId": "302f1cc9-1c1f-467a-a1bb-2ec1257e6528",
      "createdDateTime": "2019-07-10T17:46:29.808997+00:00",
      "entityName": "builtin-phonenumber",
      "entityType": "phonenumber",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "404f9cd3-46ec-4924-9324-226db8823a9b",
      "createdDateTime": "2019-07-10T02:11:41.8479948+00:00",
      "entityName": "name",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "5848b1fb-c443-4b92-841d-ba96f0e8c7b3",
      "createdDateTime": "2019-07-10T02:11:41.8480382+00:00",
      "entityName": "want",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "f823b377-e2a3-4352-a9ce-ab0021e5e04f",
      "createdDateTime": "2019-07-10T02:11:41.8480559+00:00",
      "entityName": "sweets",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
      "negativeId": "d0390686-8fc3-4c9c-bfa1-889efd0b126c",
      "createdDateTime": "2019-07-10T02:11:41.8480658+00:00",
      "entityName": "canBeDeleted",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "d0390686-8fc3-4c9c-bfa1-889efd0b126c",
      "positiveId": "8b3f059b-c37f-4826-ba7f-9e88e92c1cdf",
      "createdDateTime": "2019-07-10T02:11:41.8480754+00:00",
      "entityName": "~canBeDeleted",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "ad3a5e85-6219-4225-abd7-fdcd080ca4fd",
      "createdDateTime": "2019-07-10T02:11:41.8480853+00:00",
      "entityName": "canBeDeletedToo",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "87b4870c-b2b3-4417-a13b-ef2134cb9278",
      "createdDateTime": "2019-07-10T17:46:29.6522946+00:00",
      "entityName": "mobilePhoneNumber",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "phonenumber"
    }
  ],
  "packageId": "6ccd6132-2132-4f5a-9225-3aad7cdfb126"
}