import * as React from 'react';

export default class Emulator extends React.Component<any, any> {
    constructor(p: any) {
        super(p)
    }
    render() {
        return (
            <div className='dummyContent'>
                <span className="ms-font-su dummyText">WEBCHAT EMULATOR</span>
            </div>
        )
    }
}