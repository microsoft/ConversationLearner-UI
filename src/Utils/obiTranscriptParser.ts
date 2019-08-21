/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as CLM from '@conversationlearner/models'
import * as Util from './util'
import * as OBIUtils from './obiUtils'  
import * as BB from 'botbuilder'

export class ObiTranscriptParser {
    private app: CLM.AppBase
    private actions: CLM.ActionBase[] = []
    private entities: CLM.EntityBase[] = []
    private trainDialogs: CLM.TrainDialog[] = []
    private createActionThunkAsync: ((appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>) | undefined
    private createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    
    constructor(
        app: CLM.AppBase,
        actions: CLM.ActionBase[],
        entities: CLM.EntityBase[],
        trainDialogs: CLM.TrainDialog[],
        createActionThunkAsync: (appId: string, action: CLM.ActionBase) => Promise<CLM.ActionBase | null>,
        createEntityThunkAsync: (appId: string, entity: CLM.EntityBase) => Promise<CLM.EntityBase | null>
    ) {
        this.app = app
        this.actions = actions
        this.entities = entities
        this.trainDialogs = trainDialogs
        this.createActionThunkAsync = createActionThunkAsync
        this.createEntityThunkAsync = createEntityThunkAsync
    }

    async getTrainDialogs(transcriptFiles: File[], lgFiles: File[] | null): Promise<CLM.TrainDialog[]> {

        const lgMap = await OBIUtils.lgMapFromLGFiles(lgFiles)

        const importedTrainDialogs: CLM.TrainDialog[] = []
        for (const transcriptFile of transcriptFiles) {

            if (!transcriptFile.name.endsWith('.transcript')) {
                throw new Error(`Expecting .transcript file.\n\n Given: ${transcriptFile.name}`)
            }

            let source = await Util.readFileAsync(transcriptFile)
            try {
                const transcript: BB.Activity[] = JSON.parse(source)
                const transcriptHash = Util.hashText(JSON.stringify(transcript))
    
                // If transcript has already been imported, skip it
                if (!this.hasTranscriptBeenImported(transcriptHash)) {
            
                    const importedTrainDialog = await OBIUtils.trainDialogFromTranscriptImport(
                        transcript,
                        lgMap,
                        this.entities,
                        this.actions,
                        this.app,
                        this.createActionThunkAsync as any,
                        this.createEntityThunkAsync as any
                    )
        
                    importedTrainDialogs.push(importedTrainDialog)
                }
            }
            catch (e) {
                const error = e as Error
                throw new Error(`.transcript file (${transcriptFile.name}) ${error.message}`)
            }
        }

        return importedTrainDialogs
    }

    hasTranscriptBeenImported(importHash: string): boolean {
        return this.trainDialogs.find(td => td.clientData ? (td.clientData.importHashes.find(ih => ih === importHash) !== undefined) : false) !== undefined
    }
}