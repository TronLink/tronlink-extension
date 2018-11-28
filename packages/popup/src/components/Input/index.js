import React from 'react';

import { injectIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VALIDATION_STATE } from '@tronlink/lib/constants';

import './Input.scss';

const renderStatus = status => {
    let icon = false;

    if(status === VALIDATION_STATE.VALID)
        icon = 'check-circle';

    if(status === VALIDATION_STATE.INVALID)
        icon = 'times-circle';

    return (
        <div className='inputStatus'>
            { icon ? <FontAwesomeIcon icon={ icon } className={ `stateIcon ${ status }` } /> : '' }
        </div>
    );
};

const onKeyPress = ({ key }, onEnter) => {
    if(key === 'Enter')
        onEnter();
};

const Input = props => {
    const {
        icon = false,
        status = false,
        isDisabled = false,
        type = 'text',
        value = '',
        className = '',
        onChange = () => {},
        onEnter = () => {},
        validator = false,
        intl
    } = props;

    let {
        placeholder = ''
    } = props;

    if(placeholder)
        placeholder = intl.messages[ placeholder ];

    const inputClasses = [ ];

    if(icon)
        inputClasses.push('has-icon');

    if(status)
        inputClasses.push('has-status');

    if(isDisabled)
        inputClasses.push('is-disabled');

    const handleChange = value => {
        if(isDisabled)
            return;

        if(validator && !validator.test(value))
            return;

        onChange(value);
    };

    return (
        <div className={ `customInput ${ className }` }>
            { icon ? <FontAwesomeIcon icon={ icon } className='inputIcon' /> : '' }
            <input
                className={ inputClasses.join(' ') }
                placeholder={ placeholder }
                type={ type }
                value={ value }
                onChange={ ({ target: { value } }) => handleChange(value) }
                onKeyPress={ event => !isDisabled && onKeyPress(event, onEnter) }
                readOnly={ isDisabled }
            />
            { status ? renderStatus(status) : '' }
        </div>

    );
};

export default injectIntl(Input);