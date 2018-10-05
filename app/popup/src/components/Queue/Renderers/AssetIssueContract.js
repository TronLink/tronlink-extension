import React, { Component } from 'react';
import TronWeb from 'tronweb';
import { FormattedMessage } from 'react-intl';

export default class AssetIssueContract extends Component {
    render() {
        const {
            parameters
        } = this.props;

        const name = TronWeb.toUtf8(parameters.name);
        const abbreviation = TronWeb.toUtf8(parameters.abbr);
        const description = parameters.description && TronWeb.toUtf8(parameters.description);

        // This is horrendous. React app needs to be refactored ASAP.

        return <React.Fragment>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.issue.name' />
                    </div>
                    <div className="confirmGroupAddress bold orange">{ name }</div>
                </div>
            </div>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.issue.abbreviation' />
                    </div>
                    <div className="confirmGroupAddress bold orange">{ abbreviation }</div>
                </div>
            </div>
            <div className="confirmGroup">
                <div className="confirmGroupTop">
                    <div className="confirmGroupHeader bold">
                        <FormattedMessage id='queue.issue.name' />
                    </div>
                    <div className="confirmGroupAddress bold orange">{ name }</div>
                </div>
            </div>
            <div className="confirmGroup">
                <div className='confirmTextArea'>
                    { description }
                </div>
            </div>
        </React.Fragment>;
    }
}
