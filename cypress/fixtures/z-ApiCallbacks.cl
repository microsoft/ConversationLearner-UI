﻿{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "826a7141-fab1-490a-bcb7-110bf6f34c5b",
      "createdDateTime": "2019-05-30T02:15:07.4213219+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4213757+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4213883+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4213956+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4214109+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4214196+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4214264+00:00",
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
      "createdDateTime": "2019-05-30T02:15:44.7253706+00:00",
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
      "createdDateTime": "2019-05-30T02:15:07.4211666+00:00",
      "entityName": "1stArg",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "8df75e1c-10c4-4372-ae8b-c00f9c2e7f45",
      "createdDateTime": "2019-05-30T02:15:07.4212318+00:00",
      "entityName": "2ndArg",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": false,
      "resolverType": "none"
    },
    {
      "entityId": "3193f801-7392-4376-88e4-f225892d7de4",
      "negativeId": "c6a7590d-da9e-487e-aa7f-3c68a8f57a50",
      "createdDateTime": "2019-05-30T02:15:07.421244+00:00",
      "entityName": "entityError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "c6a7590d-da9e-487e-aa7f-3c68a8f57a50",
      "positiveId": "3193f801-7392-4376-88e4-f225892d7de4",
      "createdDateTime": "2019-05-30T02:15:07.4212536+00:00",
      "entityName": "~entityError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
      "negativeId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
      "createdDateTime": "2019-05-30T02:15:07.4212629+00:00",
      "entityName": "logicError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "7ede7886-9e83-42be-8fa5-4706bba0142a",
      "positiveId": "20bb488e-c2e5-4fb9-b45e-5579c18b1ae3",
      "createdDateTime": "2019-05-30T02:15:07.4212726+00:00",
      "entityName": "~logicError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
      "negativeId": "d21d1aff-5226-48bd-8cb2-5d98107c0474",
      "createdDateTime": "2019-05-30T02:15:07.4212919+00:00",
      "entityName": "renderError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "d21d1aff-5226-48bd-8cb2-5d98107c0474",
      "positiveId": "b20331c0-5999-4d5e-878f-52c3014bce5b",
      "createdDateTime": "2019-05-30T02:15:07.4213025+00:00",
      "entityName": "~renderError",
      "entityType": "LUIS",
      "isMultivalue": false,
      "isNegatible": true,
      "resolverType": "none"
    }
  ],
  "packageId": "81c64555-68d3-4494-91a5-9d0fb8a44682"
}