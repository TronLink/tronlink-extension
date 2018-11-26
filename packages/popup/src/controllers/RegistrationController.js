import React from 'react';
import Input from 'components/Input';
import Button from 'components/Button';
import InputCriteria from 'components/InputCriteria';

import { FormattedMessage } from 'react-intl';
import { VALIDATION_STATE } from '@tronlink/lib/constants';
import { PopupAPI } from '@tronlink/lib/api';

class RegistrationController extends React.Component {
    state = {
        password: {
            value: '',
            hasLength: false,
            hasSpecial: false,
            isValid: VALIDATION_STATE.NONE
        },
        repeatPassword: {
            value: '',
            isValid: VALIDATION_STATE.NONE
        },
        loading: false,
        error: false
    };

    constructor() {
        super();

        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.onRepeatPasswordChange = this.onRepeatPasswordChange.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    onPasswordChange(value) {
        const trimmed = value.trim();
        const hasLength = trimmed.length >= 8;
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?\d]+/.test(trimmed);

        let isValid = trimmed.length ? VALIDATION_STATE.INVALID : VALIDATION_STATE.NONE;

        if(hasLength && hasSpecial)
            isValid = VALIDATION_STATE.VALID;

        this.setState({
            password: {
                value: trimmed,
                hasLength,
                hasSpecial,
                isValid
            }
        });
    }

    onRepeatPasswordChange(value) {
        const trimmed = value.trim();
        const { password } = this.state;

        let isValid = trimmed.length ? VALIDATION_STATE.INVALID : VALIDATION_STATE.NONE;

        if(trimmed.length && trimmed === password.value)
            isValid = VALIDATION_STATE.VALID;

        this.setState({
            repeatPassword: {
                value: trimmed,
                isValid
            }
        });
    }

    onButtonClick() {
        const { password } = this.state;

        this.setState({
            loading: true
        });

        PopupAPI
            .setPassword(password.value)
            .catch(error => this.setState({
                error
            }))
            .then(() => this.setState({
                loading: false
            }));
    }

    render() {
        const {
            password,
            repeatPassword,
            loading,
            error
        } = this.state;

        const arePasswordsValid =
            password.isValid === VALIDATION_STATE.VALID &&
            repeatPassword.isValid === VALIDATION_STATE.VALID;

        return (
            <div className='insetContainer'>
                <div className='pageHeader'>
                    TronLink
                </div>
                { error ? (
                    <div className='errorModal hasBottomMargin'>
                        <FormattedMessage className='modalTitle' id='ERRORS.ACCOUNT_CREATION_FAILED' />
                        <FormattedMessage className='modalBody' id={ error } />
                    </div>
                ) : '' }
                <div className='greyModal'>
                    <div className='inputGroup hasBottomMargin'>
                        <Input
                            icon='lock'
                            type='password'
                            placeholder='INPUT.PASSWORD'
                            status={ password.isValid }
                            value={ password.value }
                            isDisabled={ loading }
                            onChange={ this.onPasswordChange }
                            tabIndex={ 1 }
                        />
                        <div className='criteria'>
                            <InputCriteria id='PASSWORD_CRITERIA.HAS_LENGTH' isValid={ password.hasLength } />
                            <InputCriteria id='PASSWORD_CRITERIA.HAS_SPECIAL' isValid={ password.hasSpecial } />
                        </div>
                    </div>

                    <Input
                        icon='lock'
                        type='password'
                        className='hasBottomMargin'
                        placeholder='INPUT.REPEAT_PASSWORD'
                        status={ repeatPassword.isValid }
                        value={ repeatPassword.value }
                        isDisabled={ loading }
                        onChange={ this.onRepeatPasswordChange }
                        onEnter={ this.onButtonClick }
                        tabIndex={ 2 }
                    />

                    <Button
                        id='BUTTON.CONTINUE'
                        isValid={ arePasswordsValid }
                        isLoading={ loading }
                        onClick={ this.onButtonClick }
                        tabIndex={ 3 }
                    />
                </div>
            </div>
        );
    }
}

export default RegistrationController;