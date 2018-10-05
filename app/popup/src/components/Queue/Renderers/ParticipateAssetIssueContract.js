import React, { Component } from 'react';
import TronWeb from 'tronweb';
import { FormattedMessage, FormattedNumber } from 'react-intl';

export default class ParticipateAssetIssueContract extends Component {
    render() {
        const {
            parameters,
        } = this.props;

        const name = TronWeb.toUtf8(parameters.name);

        return <React.Fragment>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.issue.name' />
                    </div>
                    <div className="confirmGroupAddress bold orange">{ name }</div>
                </div>
            </div>

            <div className="confirmGroupTotal">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.participate.amount' />
                    </div>
                    <div className="confirmGroupAmount bold orange">
                        <FormattedNumber value={ parameters.amount } minimumFractionDigits={ 0 } maximumFractionDigits={ 0 } />
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}
