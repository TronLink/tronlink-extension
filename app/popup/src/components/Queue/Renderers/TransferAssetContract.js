import React, { Component } from 'react';
import TronWeb from 'tronweb';
import { FormattedMessage, FormattedNumber } from 'react-intl';

export default class TransferAssetContract extends Component {
    render() {
        const {
            amount,
            asset_name: tokenName,
            to_address: recipient
        } = this.props.parameters;

        const to = TronWeb.address.fromHex(recipient);
        const token = TronWeb.toUtf8(tokenName);

        return <React.Fragment>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.send.to' />
                    </div>
                    <div className="confirmGroupAddress bold orange">{ to }</div>
                </div>
            </div>

            <div className="confirmGroupTotal">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='words.total' />
                    </div>
                    <div className="confirmGroupAmount bold orange">
                        <FormattedNumber value={ amount } minimumFractionDigits={ 0 } maximumFractionDigits={ 6 } />
                        <span>
                            &nbsp;{ token }
                        </span>
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}
