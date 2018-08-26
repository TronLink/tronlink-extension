import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';
import { ArrowLeftIcon } from 'components/Icons';
import './TronScan.css';

class TronScan extends Component {
    state = {
        keyStore: ''
    }

    handleChange({ target: { value: keyStore }}) {
        this.setState({ keyStore });
    }

    render() {
        return (
            <div className="import">
                <NavLink to="/main/import" className="importBackButton"><ArrowLeftIcon /></NavLink>
                <div className="importHeader">TronScan KeyStore Import</div>
                <div className="importText">Paste the content from your KeyStore file generated on tronscan.org below.</div>
                <textarea
                    placeholder="Enter KeyStore Content..."
                    className="textAreaImport"
                    value={ this.state.privateKey }
                    onChange={ event => this.handleChange(event) }
                />
                <Button type={ 'black' } style={{ marginTop: '20px' }}>
                    <FormattedMessage id='import.button' />
                </Button>
            </div>
        );
    }
}

export default TronScan;