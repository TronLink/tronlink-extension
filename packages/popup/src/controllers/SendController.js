import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import { PopupAPI } from "@tronlink/lib/api";
import Button from '@tronlink/popup/src/components/Button';
import Loading from '@tronlink/popup/src/components/Loading';
import { VALIDATION_STATE, APP_STATE, CONTRACT_ADDRESS, ACCOUNT_TYPE, TOP_TOKEN } from '@tronlink/lib/constants';
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
                decimals: 6,
                abbr: 'TRX'
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
            loading: false,
            loadingLedger: false,
            allTokens:[],
            selectedAddress:''
        };
        this.listener = this.listener.bind(this);
    }

    listener(event){
        const { selected } = this.props.accounts;
        const { formatMessage } = this.props.intl;
        if(event.data.target==='LEDGER-IFRAME'){
            console.log(event.data);
            if(event.data.success){
                this.setState({loading: false,loadingLedger: false});
                Toast.success(formatMessage({ id: 'SEND.SUCCESS' }), 3, () => {
                    this.onCancel();
                    PopupAPI.setGaEvent('Ledger','Confirmed Transaction',selected.address);
                }, true);
            } else {
                let id = '';
                if(event.data.error === 'User has not unlocked wallet'){
                    id = 'CREATION.LEDGER.CONNECT_TIMEOUT';
                }else if(event.data.error.match(/denied by the user/)){
                    id = 'CREATION.LEDGER.REJECT';
                }else if(event.data.error.match(/U2F TIMEOUT/)){
                    id = 'CREATION.LEDGER.AUTHORIZE_TIMEOUT';
                }else if(event.data.error === "Cannot read property 'message' of undefined"){
                    id = 'CREATION.LEDGER.NO_TOKEN';
                }else if(event.data.error === "address not match"){
                    id = 'CREATION.LEDGER.NOT_MATCH';
                }
                this.setState({loadingLedger: false,loading: false});
                Toast.fail(id ? formatMessage({id}) : event.data.error, 3, () => {
                    PopupAPI.setGaEvent('Ledger','Rejected Transaction',selected.address);
                }, true);
            }
        }
    }
    async componentDidMount() {
        const allTokens = await PopupAPI.getAllTokens();
        this.setState({allTokens});
        let {selectedToken,selected} = this.props.accounts;
        selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10 ,  6) : selectedToken.amount;
        this.setState({selectedToken,selectedAddress:selected.address});
        window.addEventListener('message',this.listener,false);
    }

    componentWillUnmount(){
        window.removeEventListener('message',this.listener,false);
    }

    componentWillReceiveProps(nextProps) {
        const { selected } = nextProps.accounts;
        const { selectedToken } = this.state;
        const field = selectedToken.id.match(/^T/) ? 'smart':'basic';
        const balance = selected.tokens[field].hasOwnProperty(selectedToken.id) ? selected.tokens[field][ selectedToken.id ].balance : 0;
        const decimals = selected.tokens[field].hasOwnProperty(selectedToken.id) ? selected.tokens[field][ selectedToken.id ].decimals : 6;
        if(selectedToken.id === '_') {
            selectedToken.amount = selected.balance / Math.pow(10, 6);
        } else {
            selectedToken.amount = balance / (Math.pow(10, decimals));
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

    async changeAccount(address, e) {
        e.stopPropagation();
        const { isOpen,recipient } = this.state;
        isOpen.account = !isOpen.account;
        const { selected, accounts } = this.props.accounts;
        const selectedToken = {
            isMapping : true,
            imgUrl: trxImg,
            id: '_',
            name: 'TRX',
            decimals: 6,
            amount: new BigNumber(accounts[ address ].balance).shiftedBy(-6).toString(),
            balance : new BigNumber(accounts[ address ].balance - accounts[ address ].frozenBalance).shiftedBy(-6).toString(),
            frozenBalance : new BigNumber(accounts[ address ].frozenBalance).shiftedBy(-6).toString()
        };

        if(selected.address === address)
            return;

        await PopupAPI.selectAccount(address);
        await PopupAPI.setSelectedToken(selectedToken);
        this.setState({ isOpen, selectedToken, selectedAddress:address },() => { this.validateAmount() });
        await this.onRecipientChange(recipient.value);

    }

    async onRecipientChange(address) {
        const { selectedAddress } = this.state;
        const { chains } = this.props;
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
            if(!account[chains.selected === '_'? 'mainchain' : 'sidechain' ].address) {
                recipient.isActivated = false;
                recipient.valid = true;
                recipient.error = 'EXCEPTION.SEND.ADDRESS_UNACTIVATED_ERROR';
            } else if(address === selectedAddress) {
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
                if(id === '_' && value.gt(new BigNumber(selected.balance).shiftedBy(-6).minus(0.1)) || id !=='_' && new BigNumber(selected.balance).shiftedBy(-6).lt(new BigNumber(0.1))) {
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: false,
                            error: 'ACCOUNT.TRANSFER.WARNING.TRX_NOT_ENOUGH'
                        }
                    });
                }
            }else{
                if(id === '_' && selected.netLimit - selected.netUsed < 300 && value.gt(new BigNumber(selected.balance).shiftedBy(-6).minus(1))){
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: false,
                            error: 'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_TRX_ERROR'
                        }
                    });
                }
            }
            if(id.match(/^T/)) {
                const valid = this.state.recipient.isActivated ? true : false;
                if(valid) {
                    const isEnough = new BigNumber(selected.balance).shiftedBy(-6).gte(new BigNumber(1))   ? true : false;
                    if(selected.netLimit - selected.netUsed < 300 && selected.energy - selected.energyUsed > 10000){
                        return this.setState({
                            amount: {
                                ...amount,
                                valid:isEnough,
                                error: 'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_ERROR'
                            }
                        });
                    } else if(selected.netLimit - selected.netUsed >= 300 && selected.energy - selected.energyUsed < 10000) {
                        return this.setState({
                            amount: {
                                ...amount,
                                valid:isEnough,
                                error: 'EXCEPTION.SEND.ENERGY_NOT_ENOUGH_ERROR'
                            }
                        });
                    } else if(selected.netLimit - selected.netUsed < 300 && selected.energy - selected.energyUsed < 10000) {
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
                            //valid,
                            valid:true,
                            //error: 'EXCEPTION.SEND.ADDRESS_UNACTIVATED_TRC20_ERROR',
                            error:''
                        }
                    });
                }
            } else {
                if(selected.netLimit - selected.netUsed < 300){
                    return this.setState({
                        amount: {
                            ...amount,
                            valid: id === '_' ? value.lte(new BigNumber(selected.balance).shiftedBy(-6).minus(1)) : new BigNumber(selected.balance).shiftedBy(-6).gte(new BigNumber(1)),   //new BigNumber(selected.balance).shiftedBy(-6).gte(new BigNumber(1)) ? true : false,
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
        BigNumber.config({ EXPONENTIAL_AT: [-20,30] });
        this.setState({
            loading: true,
            success: false
        });
        const { selectedToken, selected } = this.props.accounts;
        const { formatMessage } = this.props.intl;
        const { value: recipient } = this.state.recipient;
        const { value: amount } = this.state.amount;

        const {
            id,
            decimals,
            name
        } = this.state.selectedToken;
        if(selected.type !== ACCOUNT_TYPE.LEDGER) {
            let func;
            if (id === "_") {
                func = PopupAPI.sendTrx(
                    recipient,
                    new BigNumber(amount).shiftedBy(6).toString()
                );
            } else if (id.match(/^T/)) {
                func = PopupAPI.sendSmartToken(
                    recipient,
                    new BigNumber(amount).shiftedBy(decimals).toString(),
                    id
                );
            } else {
                func = PopupAPI.sendBasicToken(
                    recipient,
                    new BigNumber(amount).shiftedBy(decimals).toString(),
                    id
                );
            }
            func.then((res) => {
                this.setState({loading: false});
                Toast.success(formatMessage({ id: 'SEND.SUCCESS' }), 3, () => this.onCancel(), true);
                // PopupAPI.setPushMessage({
                //     title:`-${amount}${selectedToken.abbr} ${formatMessage({id:'NOTIFICATIONS.TITLE'})}`,
                //     message:formatMessage({id:'NOTIFICATIONS.MESSAGE'}),
                //     hash:res
                // });
            }).catch(error => {
                Toast.fail(JSON.stringify(error), 3, () => {
                    this.setState({
                        loading: false
                    });
                }, true);
            });
        } else {
            const iframe = document.querySelector('#tronLedgerBridge').contentWindow;
            const fromAddress = selected.address;
            const toAddress = recipient;
            this.setState({loadingLedger:true});
            if (id === "_") {
                iframe.postMessage({target:"LEDGER-IFRAME",action:'send trx',data:{toAddress,fromAddress,amount:new BigNumber(amount).shiftedBy(6).toString()}},'*')
            }else if(id.match(/^T/)){
                iframe.postMessage({target:"LEDGER-IFRAME",action:'send trc20',data:{id,toAddress,fromAddress,amount:new BigNumber(amount).shiftedBy(decimals).toString(),decimals,TokenName:name}},'*')
            }else{
                iframe.postMessage({target:"LEDGER-IFRAME",action:'send trc10',data:{id,toAddress,fromAddress,amount:new BigNumber(amount).shiftedBy(decimals).toString()}},'*')
            }
        }
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
                frozenBalance: selectedToken.frozenBalance || 0,
                isMapping : selectedToken.isMapping
            };
            PopupAPI.setSelectedToken(selectedCurrency);
            PopupAPI.changeState(APP_STATE.TRANSACTIONS);
            PopupAPI.changeDealCurrencyPage(0);
        }else {
            PopupAPI.changeState(APP_STATE.READY);
        }
    }

    handleClose(){
        const { formatMessage } = this.props.intl;
        const iframe = document.querySelector('#tronLedgerBridge').contentWindow;
        iframe.postMessage({target:"LEDGER-IFRAME",action:'cancel transaction',data:{}},'*');
        this.setState({loadingLedger:false,loading:false},()=>{
            Toast.fail(formatMessage({id:'CREATION.LEDGER.TIP_CANCEL_TRANSACTION'}),3,()=>{},true);
        });
    }

    render() {
        const {chains} = this.props;
        const { isOpen, selectedToken, loading, amount, recipient, loadingLedger,allTokens } = this.state;
        const { selected, accounts } = this.props.accounts;
        const trx = { tokenId: '_', name: 'TRX', balance: selected.balance,frozenBalance: selected.frozenBalance, abbr: 'TRX', decimals: 6, imgUrl: trxImg,isMapping:true };
        let tokens = { ...selected.tokens.basic, ...selected.tokens.smart};
        const topArray = [];
        allTokens.length && TOP_TOKEN[chains.selected === '_' ? 'mainchain':'sidechain'].forEach(v=>{
            if(tokens.hasOwnProperty(v)){
                if(v === CONTRACT_ADDRESS.USDT){
                    const f = allTokens.filter(({tokenId})=> tokenId === v);
                    tokens[v].imgUrl = f.length ? allTokens.filter(({tokenId})=> tokenId === v)[0].imgUrl : false;
                }
                topArray.push({...tokens[v],tokenId:v});
            }else{
                topArray.push({...allTokens.filter(({tokenId})=> tokenId === v)[0],tokenId:v,price:'0',balance:'0',isLocked:false})
            }
        });
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId, token]) => typeof token === 'object' && !token.hasOwnProperty('chain') || token.chain === chains.selected ).map(v => { v[1].isMapping = v[1].hasOwnProperty('isMapping')?v[1].isMapping:true;v[ 1 ].tokenId = v[ 0 ];return v[ 1 ]; }), 'abbr' ,'symbol',topArray);
        tokens = [trx, ...tokens];
        return (
            <div className='insetContainer send' onClick={() => this.setState({ isOpen: { account: false, token: false } }) }>
                <Loading show={loadingLedger} onClose={this.handleClose.bind(this)} />
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
                            <input type='text' onChange={(e) => this.onRecipientChange(e.target.value) }/>
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
                                    tokens.filter(({ isLocked = false }) => !isLocked ).map(({ tokenId: id, balance, name, decimals, decimal = false, abbr = false, symbol = false, imgUrl = false,frozenBalance = 0 }) => {
                                        const d =  decimal || decimals;
                                        const BN = BigNumber.clone({
                                            DECIMAL_PLACES: d,
                                            ROUNDING_MODE: Math.min(8, d)
                                        });
                                        const amount = new BN(balance)
                                            .shiftedBy(-d)
                                            .toString();
                                        const frozenAmount = new BN(frozenBalance)
                                            .shiftedBy(-d)
                                            .toString();
                                        const token = { id, amount, name, decimals:d, abbr: abbr || symbol,imgUrl};
                                        return <div onClick={(e) => this.changeToken(id === '_'? {...token, balance:amount, frozenBalance:frozenAmount}:token, e) } className={'dropItem' + (id === selectedToken.id ? ' selected' : '')}><span title={`${name}(${amount})`}>{`${name}(${amount})`}</span>{id !== '_' ? (<span>id:{id.length === 7 ? id : id.substr(0, 6) + '...' + id.substr(-6)}</span>) : ''}</div>

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
