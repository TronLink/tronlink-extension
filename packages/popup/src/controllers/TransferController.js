/**
 * Created by tron on 2019/9/3.
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import { PopupAPI } from "@tronlink/lib/api";
import Button from '@tronlink/popup/src/components/Button';
import { VALIDATION_STATE, APP_STATE, CONTRACT_ADDRESS, ACCOUNT_TYPE, TOP_TOKEN,FEE } from '@tronlink/lib/constants';
import { Toast } from 'antd-mobile';
import { Popover } from 'antd-mobile';
import Utils  from '@tronlink/lib/utils';
import Alert from '@tronlink/popup/src/components/Alert';
const trxImg = require('@tronlink/popup/src/assets/images/new/trx.png');
class TransferController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: {
                chain: false,
                token: false
            },
            selectedToken: {
                id: '_',
                name: 'TRX',
                amount: 0,
                decimals: 6,
                abbr: 'TRX'
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
            help: false
        };
    }


    async componentDidMount() {
        const allTokens = await PopupAPI.getAllTokens();
        this.setState({allTokens});
        let {selectedToken,selected} = this.props.accounts;
        selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10 ,  6) : selectedToken.amount;
        this.setState({selectedToken});
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

    changeChain(chainId, e) {
        e.stopPropagation();
        const { isOpen } = this.state;
        isOpen.chain = !isOpen.chain;
        //const { chains } = this.props;
        // const selectedToken = {
        //     id: '_',
        //     name: 'TRX',
        //     decimals: 6,
        //     amount: new BigNumber(accounts[ address ].balance).shiftedBy(-6).toString()
        // };
        this.setState({ isOpen });

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

   async validateAmount() {
        const {
            amount:tokenCount,
            decimals,
            id
        } = this.state.selectedToken;
        const { chains } = this.props;
        const { selected } = this.props.accounts;
        const accountInfo = await PopupAPI.getAccountInfo(selected.address);
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
        if(chains.selected !== '_' && !accountInfo.mainchain.address){
            return this.setState({
                amount: {
                    ...amount,
                    valid: false,
                    error: 'EXCEPTION.TRANSFER.MAIN_ADDRESS_NO_ACTIVATE'
                }
            });
        }
        if(value.isNaN() || value.lte(0)) {
            return this.setState({
                amount: {
                    ...amount,
                    valid: false,
                    error: 'EXCEPTION.SEND.AMOUNT_FORMAT_ERROR'
                }
            });
        } else if(value.gt(tokenCount)) {
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
            const min = new BigNumber(FEE.MIN_DEPOSIT_OR_WITHDRAW).shiftedBy(-6);
            const valid = id === '_' ? ( value.gte(min) && value.lte(new BigNumber(selected.balance - (chains.selected === '_'? 0 : FEE.WITHDRAW_FEE) - 1000000).shiftedBy(-6))) : new BigNumber(selected.balance - ( chains.selected === '_' ? 0 : FEE.MIN_DEPOSIT_OR_WITHDRAW ) ).shiftedBy(-6).gte(new BigNumber(1));

            if(id === '_' && value.lt(new BigNumber(10))){
                return this.setState({
                    amount: {
                        ...amount,
                        valid:false,
                        error: 'ACCOUNT.TRANSFER.WARNING.TRX_LIMIT'
                    }
                });
            } else if(id !== '_' && chains.selected !== '_' && new BigNumber(selected.balance).shiftedBy(-6).lt(new BigNumber(FEE.WITHDRAW_FEE).shiftedBy(-6))){
                return this.setState({
                    amount: {
                        ...amount,
                        valid: false,
                        error: 'ACCOUNT.TRANSFER.WARNING.TRX_NOT_ENOUGH'
                    }
                });
            } else if(id === '_' && chains.selected !== '_' && new BigNumber(selected.balance - FEE.WITHDRAW_FEE).shiftedBy(-6).lt(value) ){
                return this.setState({
                    amount: {
                        ...amount,
                        valid: false,
                        error: 'ACCOUNT.TRANSFER.WARNING.TRX_NOT_ENOUGH'
                    }
                });
            }


            if(selected.netLimit - selected.netUsed < 300 && selected.energy - selected.energyUsed > 10000){
                return this.setState({
                    amount: {
                        ...amount,
                        valid,
                        error: valid?'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_ERROR':'EXCEPTION.SEND.BANDWIDTH_NOT_ENOUGH_TRX_ERROR'
                    }
                });
            } else if(selected.netLimit - selected.netUsed >= 300 && selected.energy - selected.energyUsed < 10000) {
                return this.setState({
                    amount: {
                        ...amount,
                        valid,
                        error: valid?'EXCEPTION.SEND.ENERGY_NOT_ENOUGH_ERROR':'EXCEPTION.SEND.ENERGY_NOT_ENOUGH_TRX_ERROR'
                    }
                });
            } else if(selected.netLimit - selected.netUsed < 300 && selected.energy - selected.energyUsed < 10000) {
                return this.setState({
                    amount: {
                        ...amount,
                        valid:valid,
                        error: valid?'EXCEPTION.SEND.BANDWIDTH_ENERGY_NOT_ENOUGH_ERROR':'EXCEPTION.SEND.ENERGY_NOT_ENOUGH_TRX_ERROR'
                    }
                });
            } else {
                //const v = id === '_' ? ( chains.selected !== '_' &&   ) : ()
                return this.setState({
                    amount: {
                        ...amount,
                        valid: true,
                        error: ''
                    }
                });
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
        const { chains, onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        const { value: amount } = this.state.amount;
        const {
            id,
            decimals
        } = this.state.selectedToken;
            let func;
            if (id === "_") {
                if(chains.selected === '_'){
                    func = PopupAPI.depositTrx(new BigNumber(amount).shiftedBy(6).toString());
                }else{
                    func = PopupAPI.withdrawTrx(new BigNumber(amount).shiftedBy(6).toString());
                }
            } else if (id.match(/^T/)) {
                if(chains.selected === '_') {
                    func = PopupAPI.depositTrc20(id, new BigNumber(amount).shiftedBy(decimals).toString());
                }else{
                    func = PopupAPI.withdrawTrc20(id, new BigNumber(amount).shiftedBy(decimals).toString());
                }
            } else {
                if(chains.selected === '_') {
                    func = PopupAPI.depositTrc10(
                        id,
                        new BigNumber(amount).shiftedBy(decimals).toString(),
                    );
                }else{
                    func = PopupAPI.withdrawTrc10(
                        id,
                        new BigNumber(amount).shiftedBy(decimals).toString(),
                    );
                }
            }
            func.then((res) => {
                this.setState({loading: false});
                Toast.success(formatMessage({ id: 'SEND.SUCCESS' }), 3, () => onCancel(), true);
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

    }

    render() {
        const { isOpen, selectedToken, loading, amount,allTokens,help } = this.state;
        const { selected } = this.props.accounts;
        const { chains,onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        const trx = { tokenId: '_', name: 'TRX', balance: selected.balance, frozenBalance:selected.frozenBalance ,abbr: 'TRX', decimals: 6, imgUrl: trxImg,isMapping:true };
        let tokens = { ...selected.tokens.basic, ...selected.tokens.smart };
        const topArray = [];
        allTokens.length && TOP_TOKEN[chains.selected === "_" ? 'mainchain':'sidechain'].forEach(v=>{
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
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId, token]) => typeof token === 'object' && (!token.hasOwnProperty('chain') || token.chain === chains.selected) ).map(v => { v[ 1 ].tokenId = v[ 0 ];return v[ 1 ]; }), 'abbr' ,'symbol',topArray);
        tokens = tokens.map(v=>{ v.isMapping = v.hasOwnProperty('isMapping') ? v.isMapping:( v.tokenId.match(/^T/) ? false : true); return v;}).filter(({isMapping = false})=> isMapping);
        tokens = [trx, ...tokens];
        return (
            <div className='insetContainer send' onClick={() => this.setState({ isOpen: { account: false, token: false } }) }>
                <div className='pageHeader'>
                    <div className='back' onClick={(e) => onCancel() }>&nbsp;</div>
                    <FormattedMessage id={'ACCOUNT.TRANSFER'+(chains.selected === '_'?'':'2')} />
                    <div className='help' onClick={() => this.setState({ help: true })}>&nbsp;</div>
                </div>
                <div className='greyModal'>
                    <div className='input-group'>
                        <label><FormattedMessage id='ACCOUNT.TRANSFER.SELECT_CHAIN'/></label>
                        <div className='input dropDown noArrow'>
                            <div className='selected'>{ Object.entries(chains.chains).filter(([chainId])=>chainId !== chains.selected)[0][1].name }</div>
                        </div>
                        <div className='otherInfo'>
                            <FormattedMessage id='COMMON.BALANCE'/>:&nbsp;
                            {selected.balance / Math.pow(10, 6)} TRX
                        </div>
                    </div>
                    <div className='input-group'>
                        <label><FormattedMessage id='ACCOUNT.SEND.CHOOSE_TOKEN'/></label>
                        <div className={'input dropDown' + (isOpen.token ? ' isOpen' : '')} onClick={ (e) => { e.stopPropagation();isOpen.chain = false; isOpen.token = !isOpen.token; this.setState({ isOpen }); } }>
                            <div className='selected'>
                                <span title={`${selectedToken.name}(${selectedToken.amount})`}>{`${selectedToken.name}(${selectedToken.amount})`}</span>{selectedToken.id !== '_' ? (<span>id:{selectedToken.id.length === 7 ? selectedToken.id : selectedToken.id.substr(0, 6) + '...' + selectedToken.id.substr(-6)}</span>) : ''}</div>
                            <div className='dropWrap' style={isOpen.token ? (tokens.length <= 5 ? { height: 36 * tokens.length } : { height: 180, overflow: 'scroll' }) : {}}>
                                {
                                    tokens.filter(({ isLocked = false }) => !isLocked ).map(({ tokenId: id, balance, name, decimals, decimal = false, abbr = false, symbol = false,imgUrl=false,frozenBalance = 0, isMapping }) => {
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
                                        const token = { id, amount, name, decimals:d , abbr: abbr || symbol, imgUrl, isMapping};
                                        return <div onClick={(e) => this.changeToken(id === '_'?{...token,balance:amount,frozenBalance:frozenAmount}:token, e) } className={'dropItem' + (id === selectedToken.id ? ' selected' : '')}><span title={`${name}(${amount})`}>{`${name}(${amount})`}</span>{id !== '_' ? (<span>id:{id.length === 7 ? id : id.substr(0, 6) + '...' + id.substr(-6)}</span>) : ''}</div>

                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className={'input-group hasBottomMargin' + (amount.error ? ' error' : '')}>
                        <label>
                            <FormattedMessage id='ACCOUNT.SEND.TRANSFER_AMOUNT' />
                            {chains.selected !== '_'?
                                <div className="tip">
                                    <FormattedMessage id='ACCOUNT.TRANSFER.WARNING.WITHDRAW_FEE'/>
                                </div>
                                :
                                null
                            }
                        </label>
                        <div className='input'>
                            <input type='text' value={amount.value} placeholder={selectedToken.id === '_'?formatMessage({id:'ACCOUNT.TRANSFER.WARNING.TRX_LIMIT'}):''} onChange={ (e) => {
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
                        id={'ACCOUNT.TRANSFER'+(chains.selected === '_'? '':'2')}
                        isLoading={ loading }
                        isValid={ amount.valid }
                        onClick={ () => this.onSend() }
                    />
                </div>
                {
                    help
                        ?
                        <div className="alertWrap">
                            <Alert show={help} buttonText="BUTTON.GOT_IT"
                                   title={formatMessage({id: "ACCOUNT.TRANSFER"+(chains.selected === '_'? '':'2')})}
                                   body={formatMessage({id: "ACCOUNT.TRANSFER.DESC"+(chains.selected === '_'? '':'2')})}
                                   onClose={async() => {
                                       this.setState({help:false})
                                   }} />
                        </div>
                        :
                        null
                }
            </div>
        );
    }
}

export default injectIntl(TransferController);
