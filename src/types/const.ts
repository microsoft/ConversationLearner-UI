export enum DisplayMode {
    AppList,
    AppAdmin,
    Teach,
    Session
}

export enum TeachMode {
    Extractor = "Extract",    // Waiting for Extractor feedback
    Scorer = "Score",        // Waiting for Scorer feedback
    Wait  = "Wait"           // Waiting for user input
}