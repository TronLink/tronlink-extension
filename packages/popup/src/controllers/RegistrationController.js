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
            isValid: VALIDATION_STATE.NONE,
            showCriteria:false
        },
        repeatPassword: {
            value: '',
            isValid: VALIDATION_STATE.NONE,
            showCriteria:false
        },
        loading: false,
        error: false,
        languages: [
            { name: 'English', key: 'en', selected: true },
            { name: '中文', key: 'zh', selected: false },
            { name: '日本語', key: 'ja', selected: false },
        ]
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
        const showCriteria = trimmed.length ? true : false;
        let isValid = trimmed.length ? VALIDATION_STATE.INVALID : VALIDATION_STATE.NONE;

        if(hasLength && hasSpecial)
            isValid = VALIDATION_STATE.VALID;

        this.setState({
            password: {
                value: trimmed,
                hasLength,
                hasSpecial,
                isValid,
                showCriteria
            }
        });
    }

    onRepeatPasswordChange(value) {
        let showCriteria;
        const trimmed = value.trim();
        const { password } = this.state;

        let isValid = trimmed.length ? VALIDATION_STATE.INVALID : VALIDATION_STATE.NONE;

        if(trimmed.length && trimmed === password.value){
            isValid = VALIDATION_STATE.VALID;
            showCriteria = false;
        }else{
            showCriteria = true;
        }

        this.setState({
            repeatPassword: {
                value: trimmed,
                isValid,
                showCriteria
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
            error,
            languages
        } = this.state;
        const { language } = this.props;
        const arePasswordsValid =
            password.isValid === VALIDATION_STATE.VALID &&
            repeatPassword.isValid === VALIDATION_STATE.VALID;
        const fliterLanguage = languages.filter(v=>v.key===language)[0];
        return (
            <div className='insetContainer logoWrap'>
                <div className="setLanguage">
                    <div className={"language "+fliterLanguage.key}>
                        {
                            fliterLanguage.name
                        }
                        <div className="drop">
                            {
                                languages.map(({key,name})=><div onClick={ ()=>PopupAPI.setLanguage(key) } className={"item "+key}>{name}</div>)
                            }
                        </div>
                    </div>
                </div>
                <div className='pageHeader hasBottomMargin'>
                    <div className="pageHeaderLogoWrap">
                        <div className="logo1"></div>
                        <div className="logo2"></div>
                    </div>
                </div>
                { error ? (
                    <div className='errorModal hasBottomMargin'>
                        <FormattedMessage className='modalTitle' id='ERRORS.ACCOUNT_CREATION_FAILED' />
                        <FormattedMessage className='modalBody' id={ error } />
                    </div>
                ) : '' }
                <div className='greyModal registrationModel'>
                    <div className='inputGroup'>
                        <Input
                            type='password'
                            placeholder='INPUT.PASSWORD'
                            status={ password.isValid }
                            value={ password.value }
                            isDisabled={ loading }
                            onChange={ this.onPasswordChange }
                            tabIndex={ 1 }
                        />
                        {
                            password.showCriteria?
                                <div className='criteria'>
                                    <InputCriteria id='PASSWORD_CRITERIA.HAS_LENGTH' isValid={ password.hasLength } />
                                    <InputCriteria id='PASSWORD_CRITERIA.HAS_SPECIAL' isValid={ password.hasSpecial } />
                                </div>
                                :
                                null
                        }
                    </div>
                    <div className='inputGroup'>
                        <Input
                            type='password'
                            placeholder='INPUT.REPEAT_PASSWORD'
                            status={ repeatPassword.isValid }
                            value={ repeatPassword.value }
                            isDisabled={ loading }
                            onChange={ this.onRepeatPasswordChange }
                            onEnter={ this.onButtonClick }
                            tabIndex={ 2 }
                        />
                        {
                            repeatPassword.showCriteria?
                                <div className='criteria'>
                                    <InputCriteria id='PASSWORD_CRITERIA.NO_REPEAT' isValid={ !repeatPassword.showCriteria } />
                                </div>
                                :
                                null
                        }
                    </div>
                    <Button
                        id='BUTTON.CONTINUE'
                        isValid={ arePasswordsValid }
                        isLoading={ loading }
                        onClick={ this.onButtonClick }
                        tabIndex={ 3 }
                    />
                    <div className="passwordNotForgot">
                        <FormattedMessage id='PASSWORD_TIP.NOT_FORGOT' />
                    </div>
                </div>
            </div>
        );
    }
}

export default RegistrationController;
