import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedHTMLMessage } from 'react-intl';

import './InputCriteria.scss';

const InputCriteria = props => {
    const {
        isValid = false,
        id
    } = props;

    return (
        <div className={ `inputCriteria is-${ isValid ? 'valid' : 'invalid' }` }>
            <FontAwesomeIcon
                className={ 'statusIcon' }
                icon={ isValid ? 'check-circle' : 'times-circle' }
            />
            <FormattedHTMLMessage id={ id } />
        </div>
    );
};

export default InputCriteria;