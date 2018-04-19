/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { connect } from 'react-redux';
import { Dialog, DialogType, Checkbox } from 'office-ui-fabric-react';
import { ErrorInjector } from '../../ErrorInjector';
import { AT } from '../../types/ActionTypes'

class ErrorInjectionEditor extends React.Component<ReceivedProps, {}> {

    render() {
        return (

            <Dialog
                hidden={!this.props.open}
                onDismiss={() => this.props.onClose()}
                dialogContentProps={{
                    type: DialogType.normal,
                }}
                modalProps={{
                    isBlocking: false
                }}
            >
            {Object.keys(AT).filter(key => key.indexOf("ASYNC") > -1).map(key => {
                return ( 
                    <Checkbox
                        key={key}
                        label={key}
                        onChange={ (ev, isChecked) => this._onCheckboxChange(ev, isChecked, key) }
                        defaultChecked={ErrorInjector.ShouldError(AT[key])}
                    />
                    )})
            }
            </Dialog>
        )
    }
   
    private _onCheckboxChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean, actionType: string) {
        ErrorInjector.SetError(actionType, isChecked);
    }
}

interface ReceivedProps {
    onClose: Function;
    open: boolean;
}

export default connect<ReceivedProps, {}, {}>(null, null)(ErrorInjectionEditor);