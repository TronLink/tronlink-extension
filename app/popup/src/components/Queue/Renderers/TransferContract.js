import React, { Component } from 'react';
import TronWeb from 'tronweb';
import { FormattedMessage, FormattedNumber } from 'react-intl';

export default class TransferContract extends Component {
    render() {
        const {
            parameters,
            price
        } = this.props;

        const amount = parameters.amount;
        const to = TronWeb.address.fromHex(parameters.to_address);

        const trxPrice = Number(
            amount * price
        ) || 0;

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
                            &nbsp;TRX
                        </span>
                    </div>
                </div>
                <div className="confirmGroupBottom">
                    <FormattedNumber value={ trxPrice } style='currency' currency='USD' minimumFractionDigits={ 0 } maximumFractionDigits={ 2 } />
                    <span>
                        &nbsp;USD
                    </span>
                </div>
            </div>
        </React.Fragment>;
    }
}