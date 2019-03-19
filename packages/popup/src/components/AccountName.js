import React from 'react';
import Input from '@tronlink/popup/src/components/Input';
import Button from '@tronlink/popup/src/components/Button';
import InputCriteria from '@tronlink/popup/src/components/InputCriteria';

// import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import {
    VALIDATION_STATE
} from '@tronlink/lib/constants';

class AccountName extends React.Component {
    state = {
        name: '',
        isValid: VALIDATION_STATE.NONE,
        hasLength: false,
        isAlphanumeric: false,
        isUnique: false,
        showCriteria: false
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
    }

    onChange(name) {
        const { accounts } = this.props;
        const trimmed = name.replace(/\s{2,}/g, ' ');
        const showCriteria = trimmed.length===0?false:true;
        const state = {
            name: '',
            isValid: VALIDATION_STATE.NONE,
            hasLength: false,
            isAlphanumeric: false,
            isUnique: false,
            showCriteria
        };

        if(/^\s$/.test(name) || !trimmed.length)
            return this.setState(state);

        if(trimmed.trim().length >= 4)
            state.hasLength = true;

        if(/^([A-Za-z\d\s])+$/.test(trimmed))
            state.isAlphanumeric = true;

        if(!Object.values(accounts).some(({ name }) => name === trimmed.trim()))
            state.isUnique = true;

        if(state.hasLength && state.isAlphanumeric && state.isUnique)
            state.isValid = VALIDATION_STATE.VALID;
        else state.isValid = VALIDATION_STATE.INVALID;

        state.name = trimmed;
        this.setState(state);
    }

    render() {
        const {
            onCancel = () => {},
            onSubmit = () => {}
        } = this.props;

        const {
            name,
            isValid,
            hasLength,
            isAlphanumeric,
            isUnique,
            showCriteria
        } = this.state;

        const isNameValid = isValid === VALIDATION_STATE.VALID;

        return (
            <div className='insetContainer logoWrap'>
                <div className="back" onClick={ onCancel }></div>
                <div className='pageHeader'>
                    <div className="pageHeaderLogoWrap hasBottomMargin">
                        <div className="logo1"></div>
                        <div className="logo2"></div>
                    </div>
                </div>
                <div className='greyModal registrationModel'>
                    <div className='inputGroup hasBottomMargin'>
                        <Input
                            className="accountName"
                            placeholder='INPUT.ACCOUNT_NAME'
                            status={ isValid }
                            value={ name }
                            onChange={ this.onChange }
                            onEnter={ () => isNameValid && onSubmit(name) }
                            tabIndex={ 1 }
                        />
                        {
                            showCriteria?
                                <div className='criteria'>
                                    <InputCriteria id='CREATION_CRITERIA.HAS_LENGTH' isValid={ hasLength } />
                                    <InputCriteria id='CREATION_CRITERIA.IS_ALPHANUMERIC' isValid={ isAlphanumeric } />
                                    <InputCriteria id='CREATION_CRITERIA.IS_UNIQUE' isValid={ isUnique } />
                                </div>
                                :
                                null
                        }
                    </div>
                    <Button
                        id='BUTTON.CONTINUE'
                        isValid={ isNameValid }
                        onClick={ () => isNameValid && onSubmit(name) }
                        tabIndex={ 2 }
                    />
                </div>
                {/*<div className='greyModal'>*/}
                    {/*<div className='modalDesc hasBottomMargin'>*/}
                        {/*<FormattedMessage id='ACCOUNT_NAME.DESC' />*/}
                    {/*</div>*/}
                    {/*<div className='inputGroup hasBottomMargin'>*/}
                        {/*<Input*/}
                            {/*icon='lock'*/}
                            {/*placeholder='INPUT.ACCOUNT_NAME'*/}
                            {/*status={ isValid }*/}
                            {/*value={ name }*/}
                            {/*onChange={ this.onChange }*/}
                            {/*onEnter={ () => isNameValid && onSubmit(name) }*/}
                            {/*tabIndex={ 1 }*/}
                        {/*/>*/}
                        {/*<div className='criteria'>*/}
                            {/*<InputCriteria id='CREATION_CRITERIA.HAS_LENGTH' isValid={ hasLength } />*/}
                            {/*<InputCriteria id='CREATION_CRITERIA.IS_ALPHANUMERIC' isValid={ isAlphanumeric } />*/}
                            {/*<InputCriteria id='CREATION_CRITERIA.IS_UNIQUE' isValid={ isUnique } />*/}
                        {/*</div>*/}
                    {/*</div>*/}

                    {/*<div className='buttonRow'>*/}
                        {/*<Button*/}
                            {/*id='BUTTON.GO_BACK'*/}
                            {/*type={ BUTTON_TYPE.DANGER }*/}
                            {/*onClick={ onCancel }*/}
                            {/*tabIndex={ 3 }*/}
                        {/*/>*/}
                        {/*<Button*/}
                            {/*id='BUTTON.CONTINUE'*/}
                            {/*isValid={ isNameValid }*/}
                            {/*onClick={ () => isNameValid && onSubmit(name) }*/}
                            {/*tabIndex={ 2 }*/}
                        {/*/>*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default connect(state => ({
    accounts: state.accounts.accounts
}))(AccountName);
