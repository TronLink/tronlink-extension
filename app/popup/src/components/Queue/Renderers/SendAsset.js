import React, { Component } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

export default class SendAsset extends Component {
    renderNote() {
        const {
            hostname,
            desc
        } = this.props.confirmation;

        return desc ? (
            <div className="confirmSubContainer">
                <div className="noteTitle">
                    <FormattedMessage id="queue.send.note" values={{ hostname }} />
                </div>
                <div className="noteBody">{ desc }</div>
            </div>
        ) : (
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id="queue.send.site"
                         />
                    </div>
                    <div className="confirmGroupAmount bold orange">{ hostname }</div>
                </div>
            </div>
        );
    }

    render() {
        const confirmation = this.props.confirmation;
        const amount = confirmation.amount / 1000000;

        const trxPrice = Number(
            amount * this.props.price
        ) || 0;

        return (
            <div className="confirmSend">
                { this.props.queueLength }
                { this.renderNote() }

                <div className="confirmGroup">
                    <div className="confirmGroupTop">
                        <div className="confirmGroupHeader bold">
                            <FormattedMessage id='queue.send.to' />
                        </div>
                        <div className="confirmGroupAddress bold orange">{ confirmation.recipient }</div>
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
                                &nbsp;{confirmation.asset}
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

                <div className="confirmWarningHeader">
                    &#9888;
                    <FormattedMessage id='queue.send.warning.header' />
                </div>

                <div className="confirmWarningBody">
                    <FormattedMessage id='queue.send.warning.body' />
                </div>

                { this.props.buttons }
            </div>
        );
    }
}
