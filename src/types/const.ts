export enum ErrorType {
    Error,
    Warning
}

export enum DialogMode {
    Extractor = "Extract",    // Waiting for Extractor feedback
    Scorer = "Score",        // Waiting for Scorer feedback
    Wait = "Wait"           // Waiting for user input
}

export enum SenderType {
    User = 0,
    Bot = 1
}
