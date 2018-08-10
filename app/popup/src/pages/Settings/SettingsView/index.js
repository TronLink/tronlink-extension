import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedRelative } from 'react-intl';

import Button from 'components/Button';

import './Settings.css';

class Settings extends Component {
    render() {
        return (
            <div className="settings">
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.network' />
                    </div>
                    <div className="settingSubHeader">
                        { this.props.wallet.networks[this.props.wallet.selectedNetwork].name }
                    </div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.price.header' />
                    </div>
                    <div className="settingSubHeader">
                        <FormattedMessage id='settings.price.updated' values={{ 
                            ago: <FormattedRelative value={ this.props.wallet.lastPriceUpdate } /> 
                        }} />
                    </div>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.logs.header' />
                    </div>
                    <Button type='black'>
                        <FormattedMessage id='settings.logs.button' />
                    </Button>
                </div>
                <div className="settingsContainer">
                    <div className="settingHeader">
                        <FormattedMessage id='settings.wipe.header' />
                    </div>
                    <Button type='black'>
                        <FormattedMessage id='settings.wipe.button' />
                    </Button>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    wallet: state.wallet
}))(Settings);