import React from 'react';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import {PopupAPI} from "@tronlink/lib/api";
import Button from '@tronlink/popup/src/components/Button';
import {VALIDATION_STATE} from "@tronlink/lib/constants";
import TronWeb from "tronweb";
import WarningComponent from '@tronlink/popup/src/components/WarningComponent';
const trxImg = require('@tronlink/popup/src/assets/images/new/trx.png');
class SendController extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isOpen:{
                account:false,
                token:false
            },
            selectedToken:{
                id:'_',
                name:'TRX',
                amount:0,
                decimals:6
            },
            loading:false,
            recipient:{
                value:'',
                valid:false
            },
            amount:{
                value:0,
                valid:false
            },
            showWarning:false,
            showWarningContent:'SEND.SUCCESS'
        }
    }
    componentDidMount() {
        const {selectedToken} = this.state;
        const {selected} = this.props.accounts;
        selectedToken.amount = selected.balance / Math.pow(10, 6);
        this.setState({selectedToken});
    }
    componentWillReceiveProps(nextProps){
        const {selected,accounts} = nextProps.accounts;
        const {selectedToken} = this.state;
        if(selectedToken.id === '_'){
            selectedToken.amount = accounts[selected.address].balance / Math.pow(10, 6);
        } else {
            if(selectedToken.id.match(/^T/)){
                selectedToken.amount = selected.tokens.smart[selectedToken.id].balance / Math.pow(10, selected.tokens.smart[selectedToken.id].decimals);
            }else{
                selectedToken.amount = selected.tokens.basic[selectedToken.id].balance / Math.pow(10, selected.tokens.basic[selectedToken.id].decimals);
            }
        }
        this.setState({selectedToken});
    }
    changeToken(selectedToken){
        const {isOpen} = this.state;
        isOpen.token = !isOpen.token;
        this.setState({isOpen,selectedToken},() => this.validateAmount());
    }
    changeAccount(address){
        const {isOpen} = this.state;
        isOpen.account = !isOpen.account;
        const { selected,accounts } = this.props.accounts;
        const selectedToken = {
            id:'_',
            name:'TRX',
            decimals:6,
            amount:new BigNumber(accounts[address].balance).shiftedBy(-6).toString()
        };
        this.setState({isOpen,selectedToken},()=>{this.validateAmount()});
        if(selected.address === address)
            return;
        PopupAPI.selectAccount(address);
    }
    onRecipientChange(e) {
        const address = e.target.value;

        const recipient = {
            value: address,
            valid: VALIDATION_STATE.NONE
        };

        if(!address.length)
            return this.setState({ recipient });

        if(!TronWeb.isAddress(address))
            recipient.valid = false;
        else recipient.valid = true;

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
        }, () => {
             this.validateAmount()
        });
    }
    validateAmount(){
        const {
            amount,
            decimals
        } = this.state.selectedToken;
        let {value} = this.state.amount;
        value = new BigNumber(value);
        if(
            value.isNaN() ||
            value.lte(0) ||
            (
                decimals == 0 &&
                !value.isInteger()
            )
        ) {
            return this.setState({
                amount: {
                    valid: false,
                    value
                }
            });
        }
        this.setState({
            amount: {
                valid: value.lte(amount) ? true : false,
                value
            }
        });
    }
    onSend(){
        this.setState({
            loading: true,
            success: false
        });

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
        }else if(id.match(/^T/)){
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

        // if(address) {
        //     func = PopupAPI.sendSmartToken(
        //         recipient,
        //         new BigNumber(amount).shiftedBy(decimals).toString(),
        //         address
        //     );
        // }
        //
        func.then(() => {
            this.setState({
                loading: false,
                showWarning:true
            },()=>{
                setTimeout(()=>{
                    this.setState({showWarning:false});
                },3000)
            });
        }).catch(error => {
            this.setState({
                loading: false,
                showWarning: true,
                showWarningContent: error
            }, () => {
                setTimeout(() => {
                    this.setState({showWarning: false});
                }, 3000)
            })
        });

    }
    render() {
        const { isOpen,selectedToken,loading,showWarning,showWarningContent,amount } = this.state;
        const {onCancel} = this.props;
        const {selected, accounts} = this.props.accounts;
        const trx = ["_",{name:"TRX",balance:selected.balance,abbr:"TRX",decimals:6,imgUrl:trxImg}];
        const tokens = [trx,...Object.entries({...selected.tokens.basic,...selected.tokens.smart}).sort((a,b)=>b[1].balance/Math.pow(10,b[1].decimals) - a[1].balance/Math.pow(10,a[1].decimals))];
        return (
            <div className='insetContainer send'>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <FormattedMessage id="ACCOUNT.SEND"/>
                </div>
                <div className='greyModal'>
                    <WarningComponent show={showWarning} id={showWarningContent} />
                    <div className="input-group">
                        <label><FormattedMessage id="ACCOUNT.SEND.PAY_ACCOUNT"/></label>
                        <div className={"input dropDown"+(isOpen.account?" isOpen":"")}>
                            <div className="selected" onClick={ ()=>{isOpen.account = !isOpen.account; this.setState({isOpen})} }>{ selected.address }</div>
                            <div className="dropWrap" style={isOpen.account?(Object.entries(accounts).length<=5?{height:36*Object.entries(accounts).length}:{height:180,overflow:'scroll'}):{}}>
                                {
                                    Object.entries(accounts).map(([address])=><div onClick={()=>{this.changeAccount(address)}} className={"dropItem"+(address===selected.address?" selected":"")}>{address}</div>)
                                }
                            </div>
                        </div>
                        <div className="otherInfo">
                            <FormattedMessage id="COMMON.BALANCE"/>:&nbsp;
                            {selected.balance/Math.pow(10,6)} TRX
                        </div>
                    </div>
                    <div className="input-group">
                        <label><FormattedMessage id="ACCOUNT.SEND.RECEIVE_ADDRESS"/></label>
                        <div className="input">
                            <input type="text" onChange={(e)=>{this.onRecipientChange(e)} }/>
                        </div>
                    </div>
                    <div className="input-group">
                        <label><FormattedMessage id="ACCOUNT.SEND.CHOOSE_TOKEN"/></label>
                        <div className={"input dropDown"+(isOpen.token?" isOpen":"")}>
                            <div className="selected" onClick={ ()=>{isOpen.token = !isOpen.token; this.setState({isOpen})} }>{`${selectedToken.name}(${selectedToken.amount})${selectedToken.id!='_'?'id:'+selectedToken.id:''}`}</div>
                            <div className="dropWrap" style={isOpen.token?(tokens.length<=5?{height:36*tokens.length}:{height:180,overflow:'scroll'}):{}}>
                                {
                                    tokens.map(([id,{balance,name,decimals}])=>{
                                        const BN = BigNumber.clone({
                                            DECIMAL_PLACES: decimals,
                                            ROUNDING_MODE: Math.min(8, decimals)
                                        });
                                        const amount = new BN(balance)
                                            .shiftedBy(-decimals)
                                            .toString();
                                        return (
                                            <div onClick={()=>{this.changeToken({id,amount,name,decimals})}} className={"dropItem"+(id===selectedToken.id?" selected":"")}>{`${name}(${amount})${id!='_'?'id:'+id:''}`}</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className="input-group hasBottomMargin">
                        <label><FormattedMessage id="ACCOUNT.SEND.TRANSFER_AMOUNT"/></label>
                        <div className="input">
                            <input type="text" onChange={ (e)=>{this.onAmountChange(e)} }/>
                        </div>
                    </div>
                    <Button
                        id='ACCOUNT.SEND'
                        isLoading={ loading }
                        isValid={
                            this.state.amount.valid &&
                            this.state.recipient.valid
                        }
                        onClick={ ()=>this.onSend() }
                    />
                </div>
            </div>
        );
    }
};

export default SendController;
