import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage, FormattedNumber } from 'react-intl';

import './AddressView.css';

class AddressView extends Component {
    render() {
        const address = this.props.account.publicKey;
        const balance = (this.props.account.balance || 0) / 1000000;
        const trimmed = `${address.substr(0, 8)}...${address.substr(address.length - 8)}`;

        const usdValue = Number(
            this.props.price * balance
        ).toFixed(2).toLocaleString();

        return (
            <div className="send container">
                <div className="flowLine"></div>
                <div className="txDataContainer">
                    <div className="txAccountData">
                        <div className="txAccountDataLeft">
                            <div className="txAccountDataLabel">
                                <FormattedHTMLMessage tagName='div' id='send.from' values={{ accountName: this.props.account.name }} />
                            </div>
                            <div className="txAccountDataLabel">{ trimmed }</div>
                        </div>
                        <div className="txAccountDataRight">
                            <div className="txAccountDataLabel">
                                <FormattedNumber value={ balance } minimumFractionDigits={ 0 } maximumFractionDigits={ 6 } />
                                <span>
                                    &nbsp;TRX
                                </span>
                            </div>
                            <div className="txAccountDataLabel">
                                <FormattedNumber value={ usdValue } style='currency' currency='USD' minimumFractionDigits={ 0 } maximumFractionDigits={ 2 } />
                                <span>
                                    &nbsp;USD
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="txToData">
                        <div className="txToDataHeader">
                            <FormattedMessage id='send.to' />
                        </div>
                        <input 
                            placeholder="Enter Address to Send to..."
                            className="txToDataAddress"
                            type="text"
                            spellcheck="false"
                            onChange={ ({ target: { value } }) => this.props.onSetAddress(value) }
                            onFocus={ e => e.target.select() }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account,
    price: state.wallet.price
}))(AddressView);;
