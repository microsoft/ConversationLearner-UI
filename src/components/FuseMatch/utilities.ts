/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 import * as models from './models'

 /**
  * Convert Fuse.io search results into match options which are renderable by React
  * Works similarly to the function in ExtractorEditor to segement a string by start and end indicies from label entities
  * Except we're segmenting the start and end indicies from the Fuse result
  *
  * Input:
  *  012345678901234
  * 'I am some text', [[5,9] [10,14]]
  *
  * Segments:
  * 'I am some text'
  * 'I am ','some text'
  * 'I am ','some',' text'
  * 'I am ','some',' ','text'
  *
  * Output:
  * ['I am ', 'some', ' ', 'text']
  *
  * @param inputText text string
  * @param matches List of [startIndex, endIndex] pairs
  * @param original Unmodified original result
  */
export const convertMatchedTextIntoMatchedOption = <T>(inputText: string, matches: [number, number][], original: T): models.MatchedOption<T> => {
    const initialSegment: models.ISegement = {
        text: inputText,
        startIndex: 0,
        endIndex: inputText.length,
        data: {
            matched: false
        }
    }

    const matchedSegments = matches.reduce<models.ISegement[]>((segements, [startIndex, originalEndIndex]) => {
        // TODO: For some reason the Fuse.io library returns the end index before the last character instead of after
        // I opened issue here for explanation: https://github.com/krisk/Fuse/issues/212
        const endIndex = originalEndIndex + 1
        const segementIndexWhereEntityBelongs = segements.findIndex(seg => seg.startIndex <= startIndex && endIndex <= seg.endIndex)
        const prevSegements = segements.slice(0, segementIndexWhereEntityBelongs)
        const nextSegements = segements.slice(segementIndexWhereEntityBelongs + 1, segements.length)
        const segementWhereEntityBelongs = segements[segementIndexWhereEntityBelongs]

        const prevSegementEndIndex = startIndex - segementWhereEntityBelongs.startIndex
        const prevSegementText = segementWhereEntityBelongs.text.substring(0, prevSegementEndIndex)
        const prevSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: prevSegementText,
            endIndex: startIndex,
        }

        const nextSegementStartIndex = endIndex - segementWhereEntityBelongs.startIndex
        const nextSegementText = segementWhereEntityBelongs.text.substring(nextSegementStartIndex, segementWhereEntityBelongs.text.length)
        const nextSegement: models.ISegement = {
            ...segementWhereEntityBelongs,
            text: nextSegementText,
            startIndex: endIndex,
        }

        const newSegement: models.ISegement = {
            text: segementWhereEntityBelongs.text.substring(prevSegementEndIndex, nextSegementStartIndex),
            startIndex: startIndex,
            endIndex: endIndex,
            data: {
                matched: true
            }
        }

        const newSegements = []
        if (prevSegement.startIndex !== prevSegement.endIndex) {
            newSegements.push(prevSegement)
        }

        if (newSegement.startIndex !== newSegement.endIndex) {
            newSegements.push(newSegement)
        }

        if (nextSegement.startIndex !== nextSegement.endIndex) {
            newSegements.push(nextSegement)
        }

        return [...prevSegements, ...newSegements, ...nextSegements]
    }, [
        initialSegment
    ])

    const matchedStrings = matchedSegments
        .map(({ text, data }) => ({
            text,
            matched: data.matched
        }))

    return {
        highlighted: false,
        original,
        matchedStrings
    }
}