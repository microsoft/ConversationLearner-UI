/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
////////////////////////////////////////////////////////////////////////////////////
// GENERATED FILE from OBI schema
//
// https://github.com/microsoft/botbuilder-dotnet/edit/4.Future/schemas/sdk.schema
////////////////////////////////////////////////////////////////////////////////////
export enum AllowInterruptions {
    Always = "always",
    Never = "never",
    NotRecognized = "notRecognized",
}

/**
 * Union of components which implement the IRule interface
 *
 * This defines the steps to take when an ConversationUpdate activity is received
 *
 * Defines a rule for an event which is triggered by some source
 *
 * This defines the steps to take when an Intent is recognized (and optionally entities)
 *
 * Defines a sequence of steps to take if there is no other trigger or plan operating
 */
export interface MicrosoftIRule {
    /**
     * Copy the definition by id from a .dialog file.
     */
    $copy?: string;
    /**
     * Extra information for the Bot Framework Designer.
     */
    $designer?: { [key: string]: any };
    /**
     * Inline id for reuse of an inline definition
     */
    $id?: string;
    /**
     * Defines the valid properties for the component you are configuring (from a dialog .schema
     * file)
     */
    $type?: string;
    /**
     * Optional constraint to which must be met for this rule to fire
     */
    constraint?: string;
    /**
     * Sequence of steps or dialogs to execute
     */
    steps?: (OBIDialog | string)[]
    /**
     * Events to trigger this rule for
     */
    events?: Event[];
    /**
     * The entities required to trigger this rule
     */
    entities?: string[];
    /**
     * Intent name to trigger on
     */
    intent?: string;
}

/**
 * Configures a data driven dialog via a collection of steps/dialogs
 */
export interface OBIDialog {
    /**
     * Copy the definition by id from a .dialog file.
     */
    $copy?: string;
    /**
     * Extra information for the Bot Framework Designer.
     */
    $designer?: { [key: string]: any };
    /**
     * Inline id for reuse of an inline definition
     */
    $id?: string;
    /**
     * Defines the valid properties for the component you are configuring (from a dialog .schema
     * file)
     */
    $type?: string;
    /**
     * If this is true the dialog will automatically end when there are no more steps to run.
     * If this is false it is the responsbility of the author to call EndDialog at an
     * appropriate time.
     */
    autoEndDialog?: boolean;
    /**
     * Property path to the memory to return as the result of this dialog ending because
     * AutoEndDialog is true and there are no more steps to execute.
     */
    defaultResultProperty?: string;
    /**
     * Language generator to use for this dialog. (aka: LG file)
     */
    generator?: string;
    /**
     * This defines properties which be passed as arguments to this dialog
     */
    inputBindings?: { [key: string]: string };
    /**
     * This is the property which the EndDialog(result) will be set to when EndDialog() is called
     */
    outputBinding?: string;
    /**
     * This is that will be passed in as InputProperty and also set as the OutputProperty
     *
     * The property to bind to the dialog and store the result in
     *
     * The Memory property path to delete
     *
     * Specifies a path to memory should be returned as the result to the calling dialog.
     *
     * The property to store the result of the HTTP call in (as object or string)
     *
     * The property to set the value of
     */
    property?: string;
    /**
     * Configured recognizer to generate intent and entites from user utterance
     */
    recognizer?: Recognizer | string;
    /**
     * Array of rules to use to evaluate conversation
     */
    rules?: MicrosoftIRule[];
    /**
     * Policy for how to select rule to execute next
     */
    selector?: any;
    /**
     * Initial Sequence of steps or dialogs to execute when dialog is started
     *
     * Steps to execute
     *
     * Step to execute if condition is true.
     */
    steps?: (OBIDialog | string)[]
    /**
     * Always will always consult parent dialogs first, never will not consult parent dialogs,
     * notRecognized will consult parent only when it's not recognized
     */
    allowInterruptions?: AllowInterruptions;
    /**
     * If set to true this will always prompt the user regardless if you already have the value
     * or not.
     */
    alwaysPrompt?: boolean;
    /**
     * Value to return if the value expression can't be evaluated.
     */
    defaultValue?: string;
    /**
     * The message to send to when then input was not valid for the input type.
     */
    invalidPrompt?: string;
    /**
     * The max retry count for this prompt.
     */
    maxTurnCount?: number;
    /**
     * The attachment output format.
     *
     * The output format.
     *
     * The NumberInput output format.
     *
     * The TextInput output format.
     */
    outputFormat?: OutputFormat;
    /**
     * The message to send to as prompt for this input.
     */
    prompt?: string;
    /**
     * The message to send if the last input is not recognized.
     */
    unrecognizedPrompt?: string;
    /**
     * Expressions to validate an input.
     */
    validations?: string[];
    /**
     * The expression that you evaluated for input.
     *
     * Expression to evaluate.
     *
     * Expression against memory to use to get the value.
     *
     * Property path to memory object to send as the value of the trace activity
     */
    value?: string;
    /**
     * This is the dialog to call.
     *
     * This is the dialog to switch to.
     */
    dialog?: OBIDialog | string;
    /**
     * Options to pass to the dialog.
     */
    options?: { [key: string]: any };
    /**
     * The name of event to emit
     */
    eventName?: string;
    /**
     * Optional value to emit along with the event
     */
    eventValue?: { [key: string]: any };
    /**
     * Compose an output activity containing a set of choices
     */
    appendChoices?: boolean;
    choiceOptions?: ChoiceOptions;
    choices?:       Choice[];
    /**
     * The prompts default locale that should be recognized.
     */
    defaultLocale?:     string;
    recognizerOptions?: RecognizerOptions;
    /**
     * The kind of choice list style to generate
     */
    style?:          ListStyle;
    confirmChoices?: ConfirmChoice[];
    /**
     * Memory expression of the array to manipulate.
     */
    arrayProperty?: string;
    /**
     * The array operation to perform
     *
     * The change type to apply to current dialog
     */
    changeType?: ChangeType;
    /**
     * Memory expression of the result of this action.
     */
    resultProperty?: string;
    /**
     * If true this event should propagate to parent dialogs
     */
    bubbleEvent?: boolean;
    /**
     * The memory path which refers to the index of the item
     */
    indexProperty?: string;
    /**
     * Expression to evaluate.
     */
    listProperty?: string;
    /**
     * The memory path which refers to the value of the item
     */
    valueProperty?: string;
    /**
     * The page size
     */
    pageSize?: number;
    /**
     * The body to send in the HTTP call  (supports data binding)
     */
    body?: { [key: string]: any };
    /**
     * Http headers to include with the HTTP request (supports data binding)
     */
    headers?: { [key: string]: any };
    /**
     * The HTTP method to use
     */
    method?: Method;
    /**
     * Describes how to parse the response from the http request. If Activity or Activities,
     * then the they will be sent to the user.
     */
    responseType?: ResponseType;
    /**
     * The url to call (supports data binding)
     */
    url?: string;
    /**
     * Expression to evaluate.
     *
     * Expression to evaluate to switch on.
     */
    condition?: string;
    /**
     * Step to execute if condition is false.
     */
    elseSteps?: (OBIDialog | string)[]
    /**
     * type of value to set the property to, object or array.
     */
    type?: Type;
    /**
     * LG Expression to write to the log
     *
     * Text shown in the OAuth signin card.
     */
    text?: string;
    /**
     * Set to true to also create a TraceActivity with the log text
     */
    traceActivity?: boolean;
    /**
     * The connection name configured in Azure Web App Bot OAuth settings.
     */
    connectionName?: string;
    /**
     * Time out setting for the OAuth signin card.
     */
    timeout?: number;
    /**
     * Title shown in the OAuth signin card.
     */
    title?: string;
    /**
     * Activity to send to the user
     */
    activity?: string;
    cases?:    Case[];
    /**
     * Step to execute if no case is equal to condition
     */
    default?: (OBIDialog | string)[]
    /**
     * Name of the trace activity
     */
    name?: string;
    /**
     * Value type of the trace activity
     */
    valueType?: string;
}

export interface Case {
    /**
     * Steps to execute if case is equal to condition
     */
    steps?: (OBIDialog | string)[]
    /**
     * Value which must match the condition property
     */
    value: string;
    case:  any;
}

export enum Event {
    ActivityReceived = "activityReceived",
    BeginDialog = "beginDialog",
    CancelDialog = "cancelDialog",
    ConsultDialog = "consultDialog",
    RecognizedIntent = "recognizedIntent",
    StepsEnded = "stepsEnded",
    StepsResumed = "stepsResumed",
    StepsSaved = "stepsSaved",
    StepsStarted = "stepsStarted",
    UnknownIntent = "unknownIntent",
}

/**
 * The array operation to perform
 *
 * The change type to apply to current dialog
 */
export enum ChangeType {
    AppendSteps = "AppendSteps",
    Clear = "Clear",
    EndSequence = "EndSequence",
    InsertSteps = "InsertSteps",
    InsertStepsBeforeTags = "InsertStepsBeforeTags",
    Pop = "Pop",
    Push = "Push",
    Remove = "Remove",
    ReplaceSequence = "ReplaceSequence",
    Take = "Take",
}

export interface ChoiceOptions {
    /**
     * If true, inline and list style choices will be prefixed with the index of the choice.
     */
    includeNumbers?: boolean;
    /**
     * Separator inserted between the choices when their are only 2 choices
     */
    inlineOr?: string;
    /**
     * Separator inserted between the last 2 choices when their are more than 2 choices.
     */
    inlineOrMore?: string;
    /**
     * Character used to separate individual choices when there are more than 2 choices
     */
    inlineSeparator?: string;
}

export interface Choice {
    /**
     * Card action for the choice
     */
    action?: { [key: string]: any };
    /**
     * the list of synonyms to recognize in addition to the value. This is optional.
     */
    synonyms?: string[];
    /**
     * the value to return when selected.
     */
    value?: string;
}

export interface ConfirmChoice {
    /**
     * Card action for the choice
     */
    action?: { [key: string]: any };
    /**
     * The list of synonyms to recognize in addition to the value. This is optional.
     */
    synonyms?: string[];
    /**
     * the value to return when selected.
     */
    value?: string;
}

/**
 * The HTTP method to use
 */
export enum Method {
    Get = "GET",
    Post = "POST",
}

/**
 * The attachment output format.
 *
 * The output format.
 *
 * The NumberInput output format.
 *
 * The TextInput output format.
 */
export enum OutputFormat {
    All = "all",
    First = "first",
    Float = "float",
    Index = "index",
    Interger = "interger",
    Lowercase = "lowercase",
    None = "none",
    Trim = "trim",
    Uppercase = "uppercase",
    Value = "value",
}

/**
 * LUIS recognizer.
 *
 * Recognizer which allows you to configure the recognizer per language, and to define the
 * policy for using them
 *
 * Recognizer which uses regex expressions to generate intents and entities.
 */
export interface Recognizer {
    /**
     * Copy the definition by id from a .dialog file.
     */
    $copy?: string;
    /**
     * Extra information for the Bot Framework Designer.
     */
    $designer?: { [key: string]: any };
    /**
     * Inline id for reuse of an inline definition
     */
    $id?: string;
    /**
     * Defines the valid properties for the component you are configuring (from a dialog .schema
     * file)
     */
    $type?:         string;
    applicationId?: string;
    endpoint?:      string;
    endpointKey?:   string;
    /**
     * Defines languages to try per language.
     */
    languagePolicy?: LanguagePolicy;
    /**
     * Map of language -> IRecognizer
     */
    recognizers?: { [key: string]: Recognizer | string };
    /**
     * Pattern->Intents mappings
     */
    intents?: { [key: string]: string };
}

/**
 * Defines languages to try per language.
 *
 * This represents a dialog which gathers a DateTime in a specified range
 */
export interface LanguagePolicy {
    /**
     * Copy the definition by id from a .dialog file.
     */
    $copy?: string;
    /**
     * Extra information for the Bot Framework Designer.
     */
    $designer?: { [key: string]: any };
    /**
     * Inline id for reuse of an inline definition
     */
    $id?: string;
    /**
     * Defines the valid properties for the component you are configuring (from a dialog .schema
     * file)
     */
    $type?: string;
}

export interface RecognizerOptions {
    /**
     * If true, the the choices action.title field will NOT be searched over
     */
    noAction?: boolean;
    /**
     * If true, the choices value field will NOT be search over
     */
    noValue?: boolean;
}

/**
 * Describes how to parse the response from the http request. If Activity or Activities,
 * then the they will be sent to the user.
 */
export enum ResponseType {
    Activities = "Activities",
    Activity = "Activity",
    JSON = "Json",
    None = "None",
}

/**
 * The kind of choice list style to generate
 */
export enum ListStyle {
    Auto = "Auto",
    HeroCard = "HeroCard",
    Inline = "Inline",
    List = "List",
    None = "None",
    SuggestedAction = "SuggestedAction",
}

/**
 * type of value to set the property to, object or array.
 */
export enum Type {
    Array = "array",
    Object = "object",
}
