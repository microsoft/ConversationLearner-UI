import * as React from 'react';

export interface Props {
    title: string;
    description: string;
}
const TrainingGroundArenaHeader: React.SFC<Props> = (props: Props) => {
    return (
        <div className='trainingGroundArenaHeader'>
            <span className="ms-font-xxl trainingGroundHeaderContent">{props.title}</span>
            <span className="ms-font-m-plus trainingGroundHeaderContent">{props.description}</span>
        </div>
    )
}
export default TrainingGroundArenaHeader;