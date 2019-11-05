/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as OF from 'office-ui-fabric-react'
import * as MarkdownIt from 'markdown-it'
import * as AdaptiveCards from 'adaptivecards'
import * as Util from '../../../Utils/util'
import adaptiveCardHostConfig from './AdaptiveCardHostConfig'
import IndexButtons from '../../IndexButtons'
import { FM } from '../../../react-intl-messages'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Template, RenderedActionArgument } from '@conversationlearner/models'
import { State } from '../../../types'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './AdaptiveCardViewer.css'

// Returns raw text of rendered template
// Used to make distance comparison when importing conversations
export function getRawTemplateText(template: Template, actionArguments: RenderedActionArgument[]): any {
    try {
        const filledTemplate = JSON.stringify(getProcessedTemplate(template, actionArguments, false).body)
        // Regex returns all JSON values with the "text" keyword
        const textRegex = /"(text)":("(\\"|[^"])*"|\[("(\\"|[^"])*"(,"(\\"|[^"])*")*)?\])/gmi
        let result: RegExpExecArray | null = null
        let templateRawText = ""
        // tslint:disable-next-line:no-conditional-assignment
        while ((result = textRegex.exec(filledTemplate)) !== null) {
            templateRawText = `${templateRawText} ${result[2]}`
        }
        return templateRawText
    }
    catch {
        // Handle mal-formed template
        return ""
    }
}

function getProcessedTemplate(template: Template, actionArguments: RenderedActionArgument[], hideUndefined: boolean): any {
    let templateString = template.body || ''

    // Substitute argument values
    for (const actionArgument of actionArguments) {
        if (actionArgument && actionArgument.value) {
            templateString = templateString.replace(new RegExp(`{{${actionArgument.parameter}}}`, 'g'), actionArgument.value)
        }
    }

    if (hideUndefined) {
        // Replace unfilled entity references with blank
        templateString = templateString.replace(/{{\s*[\w\.]+\s*}}/g, '');
    } else {
        // Now replace any images that haven't been substituted with a dummy image
        for (const templateVar of template.variables) {
            if (templateVar.type === 'Image') {
                templateString = templateString.replace(new RegExp(`{{${templateVar.key}}}`, 'g'), 'https://c1.staticflickr.com/9/8287/29517736620_3184b66ec8.jpg');
            }
        }
    }
    return JSON.parse(templateString);
}

class AdaptiveCardViewer extends React.Component<Props> {

    private md = new MarkdownIt()

    onDismiss = () => {
        this.props.onDismiss()
    }

    getAdaptiveCardHostConfig(): any {
        return new AdaptiveCards.HostConfig(adaptiveCardHostConfig)
    }

    render() {
        if (!this.props.open || !this.props.template) {
            return null;
        }
        let card: HTMLElement | null = null

        try {
            const template = getProcessedTemplate(this.props.template, this.props.actionArguments, this.props.hideUndefined)
            
            AdaptiveCards.AdaptiveCard.onProcessMarkdown = ((text, result) => {
                result.outputHtml = this.md.render(text)
                result.didProcess = true
            })

            const adaptiveCard = new AdaptiveCards.AdaptiveCard()
            adaptiveCard.hostConfig = this.getAdaptiveCardHostConfig()
            adaptiveCard.parse(template)
            card = adaptiveCard.render()
        }
        catch (e) {
            // Ignore error, show error message below
        }
        return (
            <OF.Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                isBlocking={false}
                containerClassName="cl-modal cl-adaptivecardviewer-modal"
            >
                <div className={this.props.onNext ? "cl-adaptivecardviewer-body" : ""}>
                    <div className="cl-wc-disabled wc-app wc-card wc-adaptive-card">
                        {card 
                            ? <div dangerouslySetInnerHTML={{__html: card.outerHTML}} />
                            : `Unable to render Card Template with the given variables: ${this.props.template.name}`
                        }  
                    </div>
                </div>
                {this.props.onNext && this.props.onPrevious && this.props.totalCards !== undefined && this.props.curIndex !== undefined &&
                    <div className="cl-modal_footer cl-modal-buttons">
                        <div className="cl-modal-buttons_secondary">
                            <IndexButtons
                                onPrevious={this.props.onPrevious}
                                onNext={this.props.onNext}
                                curIndex={this.props.curIndex}
                                total={this.props.totalCards}
                            />
                        </div>
                        <div className="cl-modal-buttons_primary">
                            <OF.DefaultButton
                                onClick={() => this.props.onDismiss()}
                                ariaDescription={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                                text={Util.formatMessageId(this.props.intl, FM.BUTTON_CLOSE)}
                            />
                        </div>
                    </div>
                }
            </OF.Modal>
        );
    }
}

interface ReceivedProps {
    open: boolean;
    template: Template | undefined
    actionArguments: RenderedActionArgument[]
    onDismiss: () => void
    curIndex?: number
    totalCards?: number
    onNext?: () => void 
    onPrevious?: () => void 
    hideUndefined: boolean
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
    }
}
// Props types inferred from mapStateToProps & dispatchToProps
type stateProps = ReturnType<typeof mapStateToProps>
type dispatchProps = ReturnType<typeof mapDispatchToProps>
type Props = stateProps & dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<stateProps, dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AdaptiveCardViewer))