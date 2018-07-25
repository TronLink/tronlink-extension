import React from 'react';
import { connect } from 'react-redux';
import Send from './send';
import { CONFIRMATION_TYPE } from '../../extension/constants';

import './Queue.css';

class Queue extends React.Component {
    renderConfirmationType() {
        const confirmation = this.props.confirmations[0];

        switch(confirmation.type) {
            case CONFIRMATION_TYPE.SEND_TRON:
                return <Send />;
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
            <div>
                { this.renderConfirmationType() }
            </div>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    accounts: state.wallet.accounts
}))(Queue);