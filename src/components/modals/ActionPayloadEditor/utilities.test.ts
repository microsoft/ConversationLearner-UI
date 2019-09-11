/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as CLM from '@conversationlearner/models'
import Plain from 'slate-plain-serializer'
import HtmlSerializer from './htmlSerializer'
import * as utilities from './utilities'
import { Value } from 'slate'

describe('Action Payload Editor', () => {
    describe('utilities', () => {
        test('should create Slate value from Text Variation the same as from JSON', () => {
            // Arrange
            const testString = 'Suffix'
            const textVariation: CLM.TextVariation = {
                text: 'This required $myEntity and optional otherEntity ending.',
                labelEntities: [
                    {
                        "entityId": "1f99bb7a-41af-46bb-b2f0-9c5c23404266",
                        "startCharIndex": 14,
                        "endCharIndex": 23,
                        "entityText": "$myEntity",
                        "resolution": {},
                        "builtinType": "LUIS"
                    }
                ],
            }
            const entities: CLM.EntityBase[] = [
                {
                    "entityId": "1f99bb7a-41af-46bb-b2f0-9c5c23404266",
                    "createdDateTime": "2019-09-09T19:41:08.3926437+00:00",
                    "entityName": "myEntity",
                    "entityType": "LUIS",
                    "isMultivalue": false,
                    "isNegatible": false,
                    "resolverType": "none",
                    version: null,
                    packageCreationId: null,
                    packageDeletionId: null,
                    negativeId: null,
                    positiveId: null,
                    doNotMemorize: null,
                },
                {
                    "entityId": "7d27f6a3-566a-487f-9345-79ea1db62708",
                    "createdDateTime": "2019-09-09T19:41:15.2059338+00:00",
                    "entityName": "otherEntity",
                    "entityType": "LUIS",
                    "isMultivalue": false,
                    "isNegatible": false,
                    "resolverType": "none",
                    version: null,
                    packageCreationId: null,
                    packageDeletionId: null,
                    negativeId: null,
                    positiveId: null,
                    doNotMemorize: null,
                }
            ]

            const testData = {
                expectedHtml: `<p>${testString}This required <b data-id="1f99bb7a-41af-46bb-b2f0-9c5c23404266" data-name="myEntity">$myEntity</b> and optional otherEntity ending.</p>`,
                textVariation,
                entities,
                json: { "kind": "value", "document": { "kind": "document", "data": {}, "nodes": [{ "kind": "block", "type": "line", "isVoid": false, "data": {}, "nodes": [{ "kind": "text", "leaves": [{ "kind": "leaf", "text": "This required ", "marks": [] }] }, { "kind": "inline", "type": "mention-inline-node", "isVoid": false, "data": { "completed": true, "option": { "id": "1f99bb7a-41af-46bb-b2f0-9c5c23404266", "name": "myEntity" } }, "nodes": [{ "kind": "text", "leaves": [{ "kind": "leaf", "text": "$myEntity", "marks": [] }] }] }, { "kind": "text", "leaves": [{ "kind": "leaf", "text": " and optional otherEntity ending.", "marks": [] }] }] }] } }
            }

            // Act
            let slateValueFromTextVariation = utilities.createSlateValueFromTextVariation(testData.textVariation, testData.entities)
            let slateValueFromJson = Value.fromJSON(testData.json)

            const editiedSlateValueFromTextVariation = (slateValueFromTextVariation as any).change()
                .insertText(testString)
                .value

            const editiedSlateValueFromJson = slateValueFromJson.change()
                .insertText(testString)
                .value

            const stringFromTextVariation = Plain.serialize(editiedSlateValueFromTextVariation)
            const stringFromJson = Plain.serialize(editiedSlateValueFromJson)
            const stringFromTextVariation2 = HtmlSerializer.serialize(editiedSlateValueFromTextVariation)
            const stringFromJson2 = HtmlSerializer.serialize(editiedSlateValueFromJson)

            // Assert
            expect(stringFromJson2).toEqual(testData.expectedHtml)
            expect(stringFromTextVariation).toEqual(stringFromJson)
            expect(stringFromTextVariation2).toEqual(stringFromJson2)
        })
    })
})