import React from 'react';
import Button from 'components/Button';
import Input from 'components/Input';
import CustomScroll from 'react-custom-scroll';
import TronWeb from 'tronweb';

import { BigNumber } from 'bignumber.js';
import { connect } from 'react-redux';
import { PopupAPI } from '@tronlink/lib/api';
import {
    FormattedMessage,
    FormattedNumber
} from 'react-intl';

import './TokensPage.scss';

class TokensPage extends React.Component {
    state = {
        address: '',
        isLoading: false,
        isValid: false,
        error: false
    };

    constructor(props) {
        super();

        this.onChange = this.onChange.bind(this);
        this.addSmartToken = this.addSmartToken.bind(this);
    }

    async addSmartToken() {
        const {
            address,
            isLoading,
            isValid
        } = this.state;

        const { smart } = this.props.tokens;

        if(isLoading || !isValid)
            return;

        this.setState({
            isLoading: true,
            error: false
        });

        const token = await PopupAPI.getSmartToken(address);

        if(!token) {
            return this.setState({
                isLoading: false,
                error: 'ERRORS.INVALID_TOKEN'
            });
        }

        if(Object.values(smart).some(({ name, symbol }) => token.name === name || token.symbol === symbol)) {
            return this.setState({
                isLoading: false,
                error: 'ERRORS.TOKEN_ADDED'
            });
        }

        await PopupAPI.addSmartToken(address, token.name, token.symbol, token.decimals);

        this.setState({
            isLoading: false,
            error: false,
            isValid: false,
            address: ''
        });
    }

    onChange(address) {
        address = address.trim();

        const { smart } = this.props.tokens;
        const error = Object.keys(smart).includes(address) ? 'ERRORS.TOKEN_ADDED' : false;

        let isValid = !error && address.length === 34;

        try {
            isValid = isValid && TronWeb.isAddress(address);
        } catch {}

        this.setState({
            address,
            isValid,
            error
        });
    }

    renderTokens() {
        const {
            smart,
            basic
        } = this.props.tokens;

        return (
            <div className='tokenList'>
                <CustomScroll heightRelativeToParent='100%'>
                    <FormattedMessage
                        id='TOKENS.SMART'
                        children={ value => (
                            <div className='tokenType'>
                                { value }
                            </div>
                        )}
                    />
                    <div className='tokenGroup smartTokens'>
                        { Object.entries(smart).map(([ address, token ]) => {
                            const BN = BigNumber.clone({
                                DECIMAL_PLACES: token.decimals,
                                ROUNDING_MODE: Math.min(8, token.decimals)
                            });

                            const amount = new BN(token.balance)
                                .shiftedBy(-token.decimals)
                                .toString();

                            return (
                                <div className='token smartToken' key={ address }>
                                    <FormattedNumber
                                        value={ amount }
                                        maximumFractionDigits={ token.decimals }
                                        children={ amount => (
                                            <span className='tokenAmount mono'>
                                                { amount }
                                            </span>
                                        )}
                                    />
                                    <span className='tokenSymbol'>
                                        { token.symbol }
                                    </span>
                                </div>
                            );
                        }) }
                    </div>
                    <FormattedMessage id='TOKENS.BASIC' children={ value => (
                        <div className='tokenType'>
                            { value }
                        </div>
                    )}
                    />
                    <div className='tokenGroup basicTokens'>
                        { Object.entries(basic).map(([ tokenID, token ]) => {
                            const BN = BigNumber.clone({
                                DECIMAL_PLACES: token.decimals,
                                ROUNDING_MODE: Math.min(8, token.decimals)
                            });

                            const amount = new BN(token.balance)
                                .shiftedBy(-token.decimals)
                                .toString();

                            return (
                                <div className='token basicToken' key={ tokenID }>
                                    <FormattedNumber
                                        value={ amount }
                                        maximumFractionDigits={ token.decimals }
                                        children={ amount => (
                                            <span className='tokenAmount mono'>
                                                { amount }
                                            </span>
                                        )}
                                    />
                                    <span className='tokenSymbol'>
                                        { token.name }
                                    </span>
                                    <span className="show_id">
                                        id:{tokenID}
                                    </span>
                                </div>
                            );
                        }) }
                    </div>
                </CustomScroll>
            </div>
        );
    }

    render() {
        const {
            address,
            isLoading,
            isValid,
            error
        } = this.state;

        return (
            <div className='tokensPage'>
                <div className='inputGroup'>
                    <div className='tooltipContainer'>
                        <Input
                            placeholder='INPUT.NEW_TOKEN'
                            value={ address }
                            isDisabled={ isLoading }
                            onChange={ this.onChange }
                            onEnter={ this.addSmartToken }
                            tabIndex={ 1 }
                        />
                        { error ? <FormattedMessage id={ error } /> : '' }
                    </div>
                    <Button
                        id='BUTTON.ADD_TOKEN'
                        isLoading={ isLoading }
                        isValid={ isValid }
                        onClick={ this.addSmartToken }
                    />
                </div>
                { this.renderTokens() }
            </div>
        );
    }
}

export default connect(state => ({
    tokens: state.accounts.selected.tokens
}))(TokensPage);
