import * as CLM from '@conversationlearner/models'

export class EntityLabelConflictError extends Error {
    textVariations: CLM.TextVariation[]

    constructor(message: string, textVariations: CLM.TextVariation[]) {
        super(message)
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, EntityLabelConflictError.prototype)

        this.textVariations = textVariations

        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, EntityLabelConflictError)
        }
    }
}