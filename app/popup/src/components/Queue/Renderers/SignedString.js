import React, { Component } from 'react';

import {
    FormattedMessage
} from 'react-intl';

export default class SignedString extends Component {
    renderType(contractType) {
        return (
            <div className="contractNameHeader">
                <FormattedMessage id={ `${ contractType }` } />
            </div>
        );
    }

    renderNote() {
        const {
            hostname
        } = this.props.confirmation;

        return (
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id="queue.send.site" />
                    </div>
                    <div className="confirmGroupAmount bold orange">{ hostname }</div>
                </div>
            </div>
        );
    }

    rawTransaction(message) {
        return <React.Fragment>
            <div className="contractNameHeader">
                <FormattedMessage id={ `You are signing this message:` } />
            </div>

            <div className="confirmGroup">
                <div className='confirmTextArea'>
                    { message }
                </div>
            </div>
        </React.Fragment>;
    }

    render() {
        const confirmation = this.props.confirmation;
        const input = confirmation.input;
        console.log('props:');
        console.log(this.props);

        return (
            <div className="confirmSend">
                { this.props.queueLength }

                { this.renderType("Sign Message") }
                { this.renderNote() }

                { this.rawTransaction(this.props.confirmation.input) }
                { this.props.buttons }
            </div>
        );
    }
}
