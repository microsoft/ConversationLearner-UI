/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as Util from './util'
import * as fs from 'fs-extra'
import * as fspath from 'path'

describe('obiDialogParser', () => {
    /**
     * Given a path __relative to this test file__, returns a `File` wrapping that file.
     */
    function pathToFileObject(path: string): File {
        const thisFilePath = module.filename
        const thisFileDir = fspath.dirname(fspath.resolve(thisFilePath))
        const filePath = fspath.join(thisFileDir, path)
        const content = fs.readFileSync(filePath)
        return new File([content], path)
    }

    describe('foo', () => {
        test('Test foo', async () => {
            console.log(`!!!!! In ${module.filename}`)
            const path = '../_testdata/bunny.txt'
//            const content = fs.readFileSync(path)
//            const file = new File([content], path)
            const file = pathToFileObject(path)
            const fileText = await Util.readFileAsync(file)
            console.log(`Got text ${fileText}`)
        })
    })
})
