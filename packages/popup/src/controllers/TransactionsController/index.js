import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import {APP_STATE} from "@tronlink/lib/constants";
class  TransactionsController extends React.Component{
    constructor(props){
        super(props);
        this.state={index :0 };
    }
    render() {
        const { index } = this.state;
        const {
            accounts,
            onCancel,
        } = this.props;
        const {address} = accounts.selected;
        const {id='_',name='TRX',decimals=6} = accounts.selectedToken;
        const transactionGroup = accounts.selected.transactions[id];
        return (
            <div className='insetContainer transactions'>
                <div className='pageHeader'>
                    <div className="back" onClick={onCancel}></div>
                    <span>{name}</span>
                </div>
                <div className='greyModal'>
                    <div className="tabNav">
                        <div className={index==0?"active":""} onClick={() => {
                            this.setState({index:0});
                        }}>
                            <FormattedMessage id="ACCOUNT.ALL"/>
                        </div>
                        <div className={index==2?"active":""} onClick={() => { this.setState({index:2}) }}>
                            <FormattedMessage id="ACCOUNT.RECEIVE" />
                        </div>
                        <div className={index==1?"active":""} onClick={() => { this.setState({index:1}) }}>
                            <FormattedMessage id="ACCOUNT.SEND"  />
                        </div>
                    </div>
                    <div className="transaction scroll">
                        {
                            transactionGroup ?
                                Object.entries(transactionGroup).map(([v, transactions], i) =>
                                    <div className="lists" style={i == index ? {display: 'flex'} : {display: 'none'}}>
                                        {
                                            transactions.map(v => {
                                                const direction = v.transferToAddress === address ? 'receive' : 'send';
                                                const addr = v.transferToAddress === address ? v.transferFromAddress : v.transferToAddress;
                                                return (
                                                    <div className={"item " + direction}>
                                                        <div className="left">
                                                            <div
                                                                className="address">{addr.substr(0, 4) + '...' + addr.substr(-12)}</div>
                                                            <div className="time">{moment(v.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                        </div>
                                                        <div className="right">
                                                            {v.amount / Math.pow(10, decimals)}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                                :
                                <div className="noData">
                                    <FormattedMessage id="TRANSACTIONS.NO_DATA"  />
                                </div>
                        }
                        </div>
                </div>
                <div className="buttonGroup">
                    <button className="receive" onClick={ () => PopupAPI.changeState(APP_STATE.RECEIVE) }>
                        <FormattedMessage id="ACCOUNT.RECEIVE"/>
                    </button>
                    <button className="send" onClick={ () => PopupAPI.changeState(APP_STATE.SEND) }>
                        <FormattedMessage id="ACCOUNT.SEND"/>
                    </button>
                </div>
            </div>
        );
    }
}

export default TransactionsController;
