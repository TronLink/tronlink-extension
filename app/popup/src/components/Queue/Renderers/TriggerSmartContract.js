import React, { Component } from 'react';
import TronWeb from 'tronweb';
import { FormattedMessage, FormattedNumber } from 'react-intl';

export default class TriggerSmartContract extends Component {
    render() {
        const {
            parameters,
            contract
        } = this.props;

        console.log(parameters);
        console.log(contract);

        const amount = parameters.amount;
        const to = TronWeb.address.fromHex(parameters.to_address);


        return <React.Fragment>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.trigger.contract' />
                    </div>
                    <div className="confirmGroupAddress contractAddress bold orange">{ parameters.contract_address }</div>
                </div>
            </div>

            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.trigger.value' />
                    </div>
                    <div className="confirmGroupAmount bold orange">
                        <FormattedNumber value={ contract.parameter.value.call_value ? (contract.parameter.value.call_value / 1000000) : 0} minimumFractionDigits={ 0 } maximumFractionDigits={ 6 } />
                        <span>
                            &nbsp;TRX
                        </span>
                    </div>
                </div>
            </div>

            <div className="confirmGroupTotal">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.trigger.data' />
                    </div>
                </div>
                <div className="confirmGroupTop contractDataContent">
                    <textarea value={
                        parameters.data
                    } className="confirmTextArea maxHeight200" readonly />
                </div>
            </div>
        </React.Fragment>;
    }
}
