/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as CLM from '@conversationlearner/models'
import * as Util from '../../Utils/util'
import * as DialogUtils from '../../Utils/dialogUtils'
import * as OF from 'office-ui-fabric-react'
import DialogMetadata from './DialogMetadata'
import { Modal } from 'office-ui-fabric-react/lib/Modal'
import { FM } from '../../react-intl-messages'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import './MergeModal.css'

interface ReceivedProps {
    onCancel: Function
    onMerge: (description: string, tags: string[]) => void
    open: boolean
    savedTrainDialog: CLM.TrainDialog | null,
    existingTrainDialog: CLM.TrainDialog | null,
    allUniqueTags: string[]
}

interface ComponentState {
    description: string
    tags: string[]
    userInput: string
}

type Props = ReceivedProps & InjectedIntlProps

class MergeModal extends React.Component<Props, ComponentState> {

    state: ComponentState = {
        description: "",
        tags: [],
        userInput: ""
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.savedTrainDialog !== prevProps.savedTrainDialog ||
            this.props.existingTrainDialog !== prevProps.existingTrainDialog) {

            if (this.props.savedTrainDialog && this.props.existingTrainDialog) {

                const userInput = DialogUtils.isTrainDialogLonger(this.props.savedTrainDialog, this.props.existingTrainDialog)
                    ? DialogUtils.trainDialogSampleInput(this.props.savedTrainDialog)
                    : DialogUtils.trainDialogSampleInput(this.props.existingTrainDialog)

                this.setState({
                    description: DialogUtils.mergeTrainDialogDescription(this.props.savedTrainDialog, this.props.existingTrainDialog),
                    tags: DialogUtils.mergeTrainDialogTags(this.props.savedTrainDialog, this.props.existingTrainDialog),
                    userInput
                })
            }
        }
    }

    @OF.autobind
    onAddTag(tag: string) {
        this.setState(prevState => ({
            tags: [...prevState.tags, tag]
        }))
    }

    @OF.autobind
    onRemoveTag(tag: string) {
        this.setState(prevState => ({
            tags: prevState.tags.filter(t => t !== tag)
        }))
    }

    @OF.autobind
    onChangeDescription(description: string) {
        this.setState({
            description
        })
    }

    render() {

        if (!this.props.savedTrainDialog || !this.props.existingTrainDialog) {
            return null
        }

        const { intl } = this.props
        return (
            <Modal
                containerClassName='cl-modal cl-modal--small'
                isOpen={this.props.open}
                isBlocking={true}
            >

                <div className='cl-modal_header'>
                    <span className={OF.FontClassNames.xxLarge}>
                        {Util.formatMessageId(intl, FM.MERGE_TITLE)}
                    </span>
                </div>
                <div className="cl-modal_subheader">
                    <div>
                        {Util.formatMessageId(intl, FM.MERGE_BODY1)}
                    </div>
                    <div>
                        {Util.formatMessageId(intl, FM.MERGE_BODY2)}
                    </div>
                    <div>
                        {Util.formatMessageId(intl, FM.MERGE_BODY3)}
                    </div>
                </div>    
                <div>
                    <OF.Label className="ms-Label--tight cl-label">
                        {Util.formatMessageId(intl, FM.MERGE_BUTTON_MERGE)}
                    </OF.Label>
                    <div className="cl-merge-box">
                        <DialogMetadata
                                description={this.state.description}
                                tags={this.state.tags}
                                userInput={this.state.userInput}
                                allUniqueTags={this.props.allUniqueTags}
                                onChangeDescription={this.onChangeDescription}
                                onAddTag={this.onAddTag}
                                onRemoveTag={this.onRemoveTag}
                        />
                    </div>
                    <OF.Label className="ms-Label--tight cl-label">
                        {Util.formatMessageId(intl, FM.MERGE_LABEL_SAVED)}
                    </OF.Label>
                    <div className="cl-merge-box cl-merge-box--readonly">
                        <DialogMetadata
                                description={this.props.savedTrainDialog.description}
                                userInput={DialogUtils.trainDialogSampleInput(this.props.savedTrainDialog)}
                                tags={this.props.savedTrainDialog.tags}
                                allUniqueTags={[]}
                                readOnly={true}
                        />
                    </div>
                    <OF.Label className="ms-Label--tight cl-label">
                        {Util.formatMessageId(intl, FM.MERGE_LABEL_EQUIVALENT)}
                    </OF.Label>
                    <div className="cl-merge-box cl-merge-box--readonly">
                        <DialogMetadata
                                description={this.props.existingTrainDialog.description}
                                userInput={DialogUtils.trainDialogSampleInput(this.props.existingTrainDialog)}
                                tags={this.props.existingTrainDialog.tags}
                                allUniqueTags={[]}
                                readOnly={true}
                        />
                    </div>
                </div>              
                <OF.DialogFooter>
                    <OF.PrimaryButton
                        onClick={() => this.props.onMerge(this.state.description, this.state.tags)}
                        className="cl-rotate"
                        text={Util.formatMessageId(intl, FM.MERGE_BUTTON_MERGE)}
                        iconProps={{ iconName: 'Merge' }}
                        data-testid="confirm-cancel-modal-ok"
                    />
                    <OF.DefaultButton
                        onClick={() => this.props.onCancel()}
                        text={Util.formatMessageId(intl, FM.MERGE_BUTTON_SAVE)}
                        iconProps={{ iconName: 'Accept' }}
                        data-testid="confirm-cancel-modal-cancel"
                    />
                </OF.DialogFooter>        
            </Modal>
        )
    }
}

export default injectIntl(MergeModal)