{
  "trainDialogs": [],
  "actions": [
    {
      "actionId": "0dbb27ad-3d49-4808-9797-5b40971b6496",
      "createdDateTime": "2019-06-11T02:52:31.7375894+00:00",
      "actionType": "TEXT",
      "payload": "{\"text\":\"What would you like on your pizza?\",\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"paragraph\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"What would you like on your pizza?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [],
      "negativeEntities": [
        "267a89dd-be0a-4079-84ba-369eeb81f8cf"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "suggestedEntity": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "6ca0abf4-89db-454a-9e7a-21b100d0c076",
      "createdDateTime": "2019-06-11T02:52:31.7376274+00:00",
      "actionType": "TEXT",
      "payload": "{\"text\":\"You have $Toppings on your pizza.\",\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"paragraph\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"You have \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"267a89dd-be0a-4079-84ba-369eeb81f8cf\",\"name\":\"Toppings\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$Toppings\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\" on your pizza.\",\"marks\":[]}]}]}]}}}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "267a89dd-be0a-4079-84ba-369eeb81f8cf"
      ],
      "negativeEntities": [
        "b2001cd7-42be-4366-b774-f629441cb81b"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "36a2fafa-3ca5-4e3f-a391-fe6479c3cc19",
      "createdDateTime": "2019-06-11T02:52:31.7376371+00:00",
      "actionType": "TEXT",
      "payload": "{\"text\":\"Would you like anything else?\",\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"paragraph\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Would you like anything else?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "267a89dd-be0a-4079-84ba-369eeb81f8cf"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "4df39065-97b0-40cb-8e63-eedaae5e5fb0",
      "createdDateTime": "2019-06-11T02:52:31.737649+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"FinalizeOrder\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "267a89dd-be0a-4079-84ba-369eeb81f8cf"
      ],
      "negativeEntities": [
        "b2001cd7-42be-4366-b774-f629441cb81b"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "7f5fd019-78eb-487b-986b-5ebd44d41ffd",
      "createdDateTime": "2019-06-11T02:52:31.7376566+00:00",
      "actionType": "TEXT",
      "payload": "{\"text\":\"Would you like $LastToppings?\",\"json\":{\"kind\":\"value\",\"document\":{\"kind\":\"document\",\"data\":{},\"nodes\":[{\"kind\":\"block\",\"type\":\"paragraph\",\"isVoid\":false,\"data\":{},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"Would you like \",\"marks\":[]}]},{\"kind\":\"inline\",\"type\":\"mention-inline-node\",\"isVoid\":false,\"data\":{\"completed\":true,\"option\":{\"id\":\"931a7300-c0dd-458c-ba2b-f9dde7ae3a93\",\"name\":\"LastToppings\"}},\"nodes\":[{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"$LastToppings\",\"marks\":[]}]}]},{\"kind\":\"text\",\"leaves\":[{\"kind\":\"leaf\",\"text\":\"?\",\"marks\":[]}]}]}]}}}",
      "isTerminal": true,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "931a7300-c0dd-458c-ba2b-f9dde7ae3a93"
      ],
      "negativeEntities": [
        "267a89dd-be0a-4079-84ba-369eeb81f8cf"
      ],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "79a5acc2-c223-4b4a-9c3d-d7d68825265b",
      "createdDateTime": "2019-06-11T02:52:31.7377473+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"UseLastToppings\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "931a7300-c0dd-458c-ba2b-f9dde7ae3a93"
      ],
      "negativeEntities": [],
      "requiredConditions": [],
      "negativeConditions": [],
      "clientData": {
        "importHashes": []
      }
    },
    {
      "actionId": "2196c0ab-4b3c-4315-9428-c11a84a1771b",
      "createdDateTime": "2019-06-11T02:52:31.7377615+00:00",
      "actionType": "API_LOCAL",
      "payload": "{\"payload\":\"OutOfStock\",\"logicArguments\":[],\"renderArguments\":[]}",
      "isTerminal": false,
      "requiredEntitiesFromPayload": [],
      "requiredEntities": [
        "b2001cd7-42be-4366-b774-f629441cb81b"
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
      "entityId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
      "negativeId": "afa189d2-47e3-47bf-971d-6a78abfe2bb0",
      "createdDateTime": "2019-06-11T02:52:31.7375083+00:00",
      "entityName": "Toppings",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "afa189d2-47e3-47bf-971d-6a78abfe2bb0",
      "positiveId": "267a89dd-be0a-4079-84ba-369eeb81f8cf",
      "createdDateTime": "2019-06-11T02:52:31.7375467+00:00",
      "entityName": "~Toppings",
      "entityType": "LUIS",
      "isMultivalue": true,
      "isNegatible": true,
      "resolverType": "none"
    },
    {
      "entityId": "b2001cd7-42be-4366-b774-f629441cb81b",
      "createdDateTime": "2019-06-11T02:52:31.7375639+00:00",
      "entityName": "OutOfStock",
      "entityType": "LOCAL",
      "isMultivalue": false,
      "isNegatible": false
    },
    {
      "entityId": "931a7300-c0dd-458c-ba2b-f9dde7ae3a93",
      "createdDateTime": "2019-06-11T02:52:31.737578+00:00",
      "entityName": "LastToppings",
      "entityType": "LOCAL",
      "isMultivalue": true,
      "isNegatible": false
    }
  ],
  "packageId": "dbd21d6a-12d5-4641-b8d9-8b2bfaa2b0ca"
}