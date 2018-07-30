import React from 'react';
import { connect } from 'react-redux';
import './Queue.css';

import { CONFIRMATION_TYPE } from '../../extension/constants';

import Send from './SendTRX.js';
import CreateSmartContract from './CreateSmartContract.js';

class Queue extends React.Component {
    renderConfirmationType() {
        const confirmation = this.props.confirmations[0];

        switch(confirmation.type) {
            case CONFIRMATION_TYPE.SEND_TRON:
                return <Send />;
            case CONFIRMATION_TYPE.CREATE_SMARTCONTRACT:
                return <CreateSmartContract/>;
            default:
                return (
                    <span>
                        Failed to find confirmation
                    </span>
                );
        }
    }

    render() {
        return (
            <div className="queue">
                { this.renderConfirmationType() }
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    accounts: state.wallet.accounts
}))(Queue);