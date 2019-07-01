import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import { PopupAPI } from "@tronlink/lib/api";
import Button from '@tronlink/popup/src/components/Button';
import { VALIDATION_STATE, APP_STATE, CONTRACT_ADDRESS } from '@tronlink/lib/constants';
import TronWeb from "tronweb";
import { Toast } from 'antd-mobile';
import Utils  from '@tronlink/lib/utils';
const trxImg = require('@tronlink/popup/src/assets/images/new/trx.png');
class SendController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: {
                account: false,
                token: false
            },
            selectedToken: {
                id: '_',
                name: 'TRX',
                amount: 0,
                decimals: 6
            },
            recipient: {
                error: '',
                value: '',
                valid: false,
                isActivated: true
            },
            amount: {
                error: '',
                value: '',
                valid: false,
                values: ''
            },
            loading: false
        };
    }

    componentDidMount() {
        let {selectedToken,selected} = this.props.accounts;
        selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10 ,  6) : selectedToken.amount;
        this.setState({selectedToken});
    }

    componentWillReceiveProps(nextProps) {
        const { selected } = nextProps.accounts;
        const { selectedToken } = this.state;
        if(selectedToken.id === '_') {
            selectedToken.amount = selected.balance / Math.pow(10, 6);
        } else {
            if(selectedToken.id.match(/^T/)) {
                selectedToken.amount = selected.tokens.smart[ selectedToken.id ].balance / Math.pow(10, selected.tokens.smart[ selectedToken.id ].decimals);
            } else {
                selectedToken.amount = selected.tokens.basic[ selectedToken.id ].balance / Math.pow(10, selected.tokens.basic[ selectedToken.id ].decimals);
            }
        }
        this.setState({ selectedToken });
    }

    changeToken(selectedToken,e) {
        e.stopPropagation();
        const { isOpen } = this.state;
        const { value } = this.state.amount;
        isOpen.token = !isOpen.token;
        this.setState({ isOpen, selectedToken },() =>  value!=='' && this.validateAmount());
        PopupAPI.setSelectedToken(selectedToken);
    }

    changeAccount(address, e) {
        e.stopPropagation();
        const { isOpen } = this.state;
        isOpen.account = !isOpen.account;
        const { selected, accounts } = this.props.accounts;
        const selectedToken = {
            id: '_',
            name: 'TRX',
            decimals: 6,
            amount: new BigNumber(accounts[ address ].balance).shiftedBy(-6).toString()
        };
        this.setState({ isOpen, selectedToken },() => { this.validateAmount() });
        if(selected.address === address)
            return;
        PopupAPI.selectAccount(address);
    }

    async onRecipientChange(e) {
        const { selected } = this.props.accounts;
        const address = e.target.value;

        const recipient = {
            value: address,
            valid: VALIDATION_STATE.NONE
        };

        if(!address.length)
            return this.setState({recipient:{value: '', valid: false, error: ''}});

        if(!TronWeb.isAddress(address)) {
            recipient.valid = false;
            recipient.error = 'EXCEPTION.SEND.ADDRESS_FORMAT_ERROR';
        } else {
            const account = await PopupAPI.getAccountInfo(address);
            if(!account.address) {
                recipient.isActivated = false;
                recipient.valid = true;
                recipient.error = 'EXCEPTION.SEND.ADDRESS_UNACTIVATED_ERROR';
            } else if(address === selected.address) {
                recipient.isActivated = true;
                recipient.valid = false;
                recipient.error = 'EXCEPTION.SEND.ADDRESS_SAME_ERROR';
            } else {
                recipient.isActivated = true;
                recipient.valid = true;
                recipient.error = '';
            }
        }
        this.setState({
            recipient
        });
    }

    onAmountChange(e) {
        const amount = e.target.value;
        this.setState({
            amount: {
                value: amount,
                valid: false
            }
        }

           ,() => this.validateAmount()
        );
        console.log(amount,isNaN(amount));
    }

    validateAmount() {
        const {
            amount:tokenCount,
            decimals,
            id
        } = this.state.selectedToken;
        const { selected } = this.props.accounts;
        let { amount } = this.state;
        if(amount.value === '') {
            return this.setState({
                amount: {
                    valid: false,
                    value: '',
                    error: ''
                }
            });
        }
        const value = new BigNumber(amount.value);
        if(value.isNaN() || value.lte(0)) {
            return this.setState({
                amount: {
                    ...amount,
                    valid: false,
                    error: 'EXCEPTION.SEND.AMOUNT_FORMAT_ERROR'
                }
            });
        }else if(value.gt(tokenCount)) {
            return this.setState({
                amount: {
                    ...amount,
                    valid: false,
                    error: 'EXCEPTION.SEND.AMOUNT_NOT_ENOUGH_ERROR'
                }
            });
        }else if(value.dp() > decimals) {
            return this.setState({
                amount: {
                    ...amount,
                    valid: false,
                    error: 'EXCEPTION.SEND.AMOUNT_DECIMALS_ERROR',
                    values: { decimals: ( decimals === 0 ? '' : '0.' + Array.from({ length: decimals - 1 }, v => 0).join('')) + '1' }
                }
            });
        } else {
            if(!this.state.recipient.isActivated) {
                if(id === '_' && value.gt(new BigNumber(selected.balance).shiftedBy(-6).minus(0.1))) {
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: false,
                            error: 'EXCEPTION.SEND.AMOUNT_NOT_ENOUGH_ERROR'
                        }
                    });
                }
            }
            if(id.match(/^T/)) {
                const valid = this.state.recipient.isActivated ? true : false;
                if(valid) {
                    const isEnough = new BigNumber(selected.balance).shiftedBy(-6).gte(new BigNumber(1)) ? true : false;
                    if(selected.netLimit - selected.netUsed < 200 && selected.energy - selected.energyUsed > 10000){
                        return this.setState({
                            amount: {
                                ...amount,
                                valid:isEnough,
                                error: 'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_ERROR'
                            }
                        });
                    } else if(selected.netLimit - selected.netUsed >= 200 && selected.energy - selected.energyUsed < 10000) {
                        return this.setState({
                            amount: {
                                ...amount,
                                valid:isEnough,
                                error: 'EXCEPTION.SEND.ENERGY_NOT_ENOUGH_ERROR'
                            }
                        });
                    } else if(selected.netLimit - selected.netUsed < 200 && selected.energy - selected.energyUsed < 10000) {
                        return this.setState({
                            amount: {
                                ...amount,
                                valid:isEnough,
                                error: 'EXCEPTION.SEND.BANDWIDTH_ENERGY_NOT_ENOUGH_ERROR'
                            }
                        });

                    } else {
                        return this.setState({
                            amount: {
                                ...amount,
                                valid: true,
                                error: ''
                            }
                        });
                    }
                } else {
                    return this.setState({
                        amount: {
                            ...amount,
                            valid,
                            error: 'EXCEPTION.SEND.ADDRESS_UNACTIVATED_TRC20_ERROR'
                        }
                    });
                }
            } else {
                if(selected.netLimit - selected.netUsed < 200){
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: new BigNumber(selected.balance).shiftedBy(-6).gte(new BigNumber(1)) ? true : false,
                            error: 'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_ERROR'
                        }
                    });
                } else {
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: true,
                            error: ''
                        }
                    });
                }

            }
            return this.setState({
                amount: {
                    ...amount,
                    valid: true,
                    error: ''
                }
            });
        }
    }

    onSend() {
        BigNumber.config({ EXPONENTIAL_AT: [-20,30] })
        this.setState({
            loading: true,
            success: false
        });
        const { formatMessage } = this.props.intl;
        const { value: recipient } = this.state.recipient;
        const { value: amount } = this.state.amount;

        const {
            id,
            decimals
        } = this.state.selectedToken;

        let func;
        if(id === "_") {
            func = PopupAPI.sendTrx(
                recipient,
                new BigNumber(amount).shiftedBy(6).toString()
            );
        }else if(id.match(/^T/)) {
            func = PopupAPI.sendSmartToken(
                    recipient,
                    new BigNumber(amount).shiftedBy(decimals).toString(),
                    id
            );
        }else{
            func = PopupAPI.sendBasicToken(
                recipient,
                new BigNumber(amount).shiftedBy(decimals).toString(),
                id
            );
        }


        func.then(() => {
            Toast.success(formatMessage({ id: 'SEND.SUCCESS' }), 3, () => {
                this.onCancel();
                this.setState({
                    loading: false
                });
            }, true);
        }).catch(error => {
            Toast.fail(JSON.stringify(error), 3, () => {
                this.setState({
                    loading: false
                });
            }, true);
        });
    }

    onCancel() {
        const { selected, selectedToken } = this.props.accounts;
        const token10DefaultImg = require('@tronlink/popup/src/assets/images/new/token_10_default.png');
        if( selected.dealCurrencyPage == 1) {
            const selectedCurrency = {
                id: selectedToken.id,
                name: selectedToken.name,
                abbr: selectedToken.abbr || selectedToken.symbol,
                decimals: selectedToken.decimals,
                amount: selectedToken.amount,
                price: selectedToken.price,
                imgUrl: selectedToken.imgUrl ? selectedToken.imgUrl : token10DefaultImg,
                balance: selectedToken.balance || 0,
                frozenBalance: selectedToken.frozenBalance || 0
            };
            PopupAPI.setSelectedToken(selectedCurrency);
            PopupAPI.changeState(APP_STATE.TRANSACTIONS);
            PopupAPI.changeDealCurrencyPage(0);
        }else {
            PopupAPI.changeState(APP_STATE.READY);
        }
    }

    render() {
        const { isOpen, selectedToken, loading, amount, recipient } = this.state;
        const { selected, accounts } = this.props.accounts;
        const usdt = { tokenId: CONTRACT_ADDRESS.USDT, ...selected.tokens.smart[ CONTRACT_ADDRESS.USDT ] };
        const trx = { tokenId: '_', name: 'TRX', balance: selected.balance, abbr: 'TRX', decimals: 6, imgUrl: trxImg };
        let tokens = { ...selected.tokens.basic, ...selected.tokens.smart};
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId, token]) => typeof token === 'object' && tokenId !== CONTRACT_ADDRESS.USDT ).map(v => { v[ 1 ].tokenId = v[ 0 ];return v[ 1 ]; }), 'abbr' ,'symbol');
        tokens = [usdt, trx, ...tokens];
        return (
            <div className='insetContainer send' onClick={() => this.setState({ isOpen: { account: false, token: false } }) }>
                <div className='pageHeader'>
                    <div className='back' onClick={(e) => this.onCancel() }>&nbsp;</div>
                    <FormattedMessage id='ACCOUNT.SEND' />
                </div>
                <div className='greyModal'>
                    <div className='input-group'>
                        <label><FormattedMessage id='ACCOUNT.SEND.PAY_ACCOUNT'/></label>
                        <div className={'input dropDown' + (isOpen.account ? ' isOpen' : '')} onClick={ (e) => { e.stopPropagation();isOpen.token = false ;isOpen.account = !isOpen.account; this.setState({ isOpen }); } }>
                            <div className='selected'>{ selected.address }</div>
                            <div className='dropWrap' style={isOpen.account ? (Object.entries(accounts).length <= 5 ? { height : 36 * Object.entries(accounts).length } : { height: 180, overflow: 'scroll'}) : {}}>
                                {
                                    Object.entries(accounts).map(([address]) => <div onClick={(e) => this.changeAccount(address, e) } className={'dropItem'+(address === selected.address?" selected":"")}>{address}</div>)
                                }
                            </div>
                        </div>
                        <div className='otherInfo'>
                            <FormattedMessage id='COMMON.BALANCE'/>:&nbsp;
                            {selected.balance / Math.pow(10, 6)} TRX
                        </div>
                    </div>
                    <div className={'input-group' + (recipient.error ? ' error' : '')}>
                        <label><FormattedMessage id='ACCOUNT.SEND.RECEIVE_ADDRESS' /></label>
                        <div className='input'>
                            <input type='text' onChange={(e) => this.onRecipientChange(e) }/>
                        </div>
                        <div className='tipError'>
                            {recipient.error ? <FormattedMessage id={recipient.error} /> : null}
                        </div>
                    </div>
                    <div className='input-group'>
                        <label><FormattedMessage id='ACCOUNT.SEND.CHOOSE_TOKEN'/></label>
                        <div className={'input dropDown' + (isOpen.token ? ' isOpen' : '')} onClick={ (e) => { e.stopPropagation();isOpen.account = false; isOpen.token = !isOpen.token; this.setState({ isOpen }); } }>
                            <div className='selected'>
                                <span title={`${selectedToken.name}(${selectedToken.amount})`}>{`${selectedToken.name}(${selectedToken.amount})`}</span>{selectedToken.id !== '_' ? (<span>id:{selectedToken.id.length === 7 ? selectedToken.id : selectedToken.id.substr(0, 6) + '...' + selectedToken.id.substr(-6)}</span>) : ''}</div>
                            <div className='dropWrap' style={isOpen.token ? (tokens.length <= 5 ? { height: 36 * tokens.length } : { height: 180, overflow: 'scroll' }) : {}}>
                                {
                                    tokens.filter(({ isLocked = false }) => !isLocked ).map(({ tokenId: id, balance, name, decimals }) => {
                                        const BN = BigNumber.clone({
                                            DECIMAL_PLACES: decimals,
                                            ROUNDING_MODE: Math.min(8, decimals)
                                        });
                                        const amount = new BN(balance)
                                            .shiftedBy(-decimals)
                                            .toString();
                                        return <div onClick={(e) => this.changeToken({ id, amount, name, decimals }, e) } className={'dropItem' + (id === selectedToken.id ? ' selected' : '')}><span title={`${name}(${amount})`}>{`${name}(${amount})`}</span>{id !== '_' ? (<span>id:{id.length === 7 ? id : id.substr(0, 6) + '...' + id.substr(-6)}</span>) : ''}</div>

                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className={'input-group hasBottomMargin' + (amount.error ? ' error' : '')}>
                        <label><FormattedMessage id='ACCOUNT.SEND.TRANSFER_AMOUNT' /></label>
                        <div className='input'>
                            <input type='text' value={amount.value} onChange={ (e) => {
                                if(e.target.value != selectedToken.amount){
                                    this.refs['max'].classList.remove('selected');
                                }else{
                                    this.refs['max'].classList.add('selected');
                                }
                                this.onAmountChange(e);
                            }}/>
                            <button className='max' ref='max' onClick={(e)=> {
                                e.target.classList.add('selected');
                                this.setState({
                                        amount: {
                                            value: selectedToken.amount,
                                            valid: false,
                                            error:''
                                        }
                                    }, () => this.validateAmount()
                                );
                            }}>MAX</button>
                        </div>
                        <div className='tipError'>
                            {amount.error ? (amount.values ? <FormattedMessage id={amount.error} values={amount.values} /> : <FormattedMessage id={amount.error} />) : null}
                        </div>
                    </div>
                    <Button
                        id='ACCOUNT.SEND'
                        isLoading={ loading }
                        isValid={
                            amount.valid &&
                            recipient.valid
                        }
                        onClick={ () => this.onSend() }
                    />
                </div>
            </div>
        );
    }
}

export default injectIntl(SendController);
