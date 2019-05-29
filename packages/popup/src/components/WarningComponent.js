import React from 'react';
import { FormattedMessage } from 'react-intl';
const WarningComponent = props => {
    const {id,show} = props;
    return (
        <div className={'warning'+(show?' show':'')}>
            <FormattedMessage id={ id } />
        </div>
    );

}
export default WarningComponent;
