import React, { Component } from 'react';
import TronWeb from 'tronweb';

import { 
    FormattedMessage, 
    FormattedNumber 
} from 'react-intl';

export default class TriggerSmartContract extends Component {
    render() {
        const input = this.props.input;
        const amount = (input.call_value || 0) / 1000000;

        return <React.Fragment>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.trigger.contract' />
                    </div>
                    <div className="confirmGroupAddress contractAddress bold orange">
                        { TronWeb.address.fromHex(input.contract_address) }
                    </div>
                </div>
            </div>

            { amount > 0 && <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.trigger.value' />
                    </div>
                    <div className="confirmGroupAmount bold orange">
                        <FormattedNumber value={ amount } minimumFractionDigits={ 0 } maximumFractionDigits={ 6 } />
                        <span>
                            &nbsp;TRX
                        </span>
                    </div>
                </div>
            </div> }

            <div className="confirmGroupTotal">
                <div className="confirmGroupTop contractDataContent">
                    <div className='confirmTextArea center'>
                        { input.function_selector }
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}
