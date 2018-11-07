/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { Dialog, DialogType, Checkbox } from 'office-ui-fabric-react'
import { ErrorInjector } from '../../Utils/ErrorInjector'
import { AT } from '../../types/ActionTypes'

interface Props {
    onClose: Function;
    open: boolean;
}

class ErrorInjectionEditor extends React.Component<Props, {}> {
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
            {Object.keys(AT).filter(key => key.includes("ASYNC")).map(key => {
                return ( 
                    <Checkbox
                        key={key}
                        label={key}
                        onChange={(ev, isChecked) => this.onCheckboxChange(ev!, isChecked!, key)}
                        defaultChecked={ErrorInjector.ShouldError(AT[key])}
                    />
                    )})
            }
            </Dialog>
        )
    }
   
    private onCheckboxChange(ev: React.FormEvent<HTMLElement>, isChecked: boolean, actionType: string) {
        ErrorInjector.SetError(actionType, isChecked);
    }
}

export default ErrorInjectionEditor