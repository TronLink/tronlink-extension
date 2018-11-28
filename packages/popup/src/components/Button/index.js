import React from 'react';
import LoadingIndicator from 'assets/images/loader.svg';

import { BUTTON_TYPE } from '@tronlink/lib/constants';
import { FormattedMessage } from 'react-intl';

import './Button.scss';

const Button = props => {
    const {
        type = BUTTON_TYPE.PRIMARY,
        isLoading = false,
        isValid = true,
        onClick = () => {},
        id
    } = props;

    const classes = [
        'customButton',
        type
    ];

    if(isValid && !isLoading)
        classes.push('is-valid');
    else classes.push('is-invalid');

    if(isLoading)
        classes.push('is-loading');

    return (
        <button className={ classes.join(' ') } onClick={ isValid && !isLoading && onClick }>
            { isLoading ?
                <img className='loadingIndicator' src={ LoadingIndicator } alt='Loading indicator' /> :
                <FormattedMessage id={ id } />
            }
        </button>
    );
};

export default Button;