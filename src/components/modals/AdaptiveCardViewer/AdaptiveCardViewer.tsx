/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { Template, RenderedActionArgument } from '@conversationlearner/models'
import { State } from '../../../types'
import * as AdaptiveCards from 'adaptivecards'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import adaptiveCardHostConfig from './AdaptiveCardHostConfig'

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

class AdaptiveCardViewer extends React.Component<Props, {}> {

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
        const template = getProcessedTemplate(this.props.template, this.props.actionArguments, this.props.hideUndefined)
        const adaptiveCard = new AdaptiveCards.AdaptiveCard()
        adaptiveCard.hostConfig = this.getAdaptiveCardHostConfig()
        adaptiveCard.parse(template)
        const card = adaptiveCard.render()
        return (
            <Modal
                isOpen={this.props.open}
                onDismiss={this.onDismiss}
                isBlocking={false}
                containerClassName="cl-modal"
            >
                <div className="cl-wc-disabled wc-app wc-card wc-adaptive-card">
                    <div dangerouslySetInnerHTML={{__html: card.outerHTML}} />
                </div>
            </Modal>
        );
    }
}

interface ReceivedProps {
    open: boolean;
    template: Template | undefined
    actionArguments: RenderedActionArgument[]
    onDismiss: () => void
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
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps & ReceivedProps & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(injectIntl(AdaptiveCardViewer))