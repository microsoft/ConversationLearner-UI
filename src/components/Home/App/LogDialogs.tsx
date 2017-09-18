import * as React from 'react'
import { CommandButton, SearchBox } from 'office-ui-fabric-react'

const component = (props: any) => (
    <div className="blis-page">
        <h1 className="ms-font-xxl">Log Dialogs</h1>
        <p className="ms-font-m-plus">Use this tool to test the current versions of your application, to check if you are progressing on the right track ...</p>
        <div>
            <CommandButton
                data-automation-id='randomID20'
                disabled={false}
                className='blis-button blis-button--primary'
                ariaDescription='Create a New Chat Session'
                text='New Chat Session'
            />
        </div>
        <SearchBox
            className="ms-font-m-plus"
        />

    </div>
)

export default component