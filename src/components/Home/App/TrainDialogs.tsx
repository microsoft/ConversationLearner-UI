import * as React from 'react'
import { PrimaryButton, SearchBox } from 'office-ui-fabric-react'

const component = (props: any) => (
    <div className="blis-page">
        <h1 className="ms-font-xxl">Train Dialogs</h1>
        <p className="ms-font-m-plus">Use this tool to train and improve the current versions of your application ...</p>
        <div>
            <PrimaryButton
                className='blis-button blis-button--primary'
                ariaDescription='Create a New Teach Session'
                text='New Teach Session'
            />
        </div>
        <SearchBox
            className="ms-font-m-plus"
        />
    </div>
)

export default component