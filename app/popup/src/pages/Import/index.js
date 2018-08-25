import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';

import './Import.css';

class Import extends Component {
    state = {
        privateKey: ''
    }

    handlePrivateKeyChange({ target: { value: privateKey }}) {
        this.setState({ privateKey });
    }

    render() {
        return (
            <div className="import">
                <div className="importHeader">Import Wallet</div>
                <div className="importText">Click your preferred import method below.</div>
                <div className="importOptions">
                    <div className="importOptionGroupHeader">Site-Specific :</div>
                    <div className="importOptionGroup">
                        <div className="importOption">
                            <div className="importOptionHeader">TronWatch</div>
                            <div className="importOptionBody">24 word backup phrase generated from TronWatch</div>
                        </div>
                        <div className="importOption">
                            <div className="importOptionHeader">TronScan</div>
                            <div className="importOptionBody">KeyStore file contents generated from tronscan.org</div>
                        </div>
                    </div>
                    <div className="importOptionGroupHeader">Generic :</div>
                    <div className="importOptionGroup">
                        <div className="importOption">
                            <div className="importOptionHeader">Word List</div>
                            <div className="importOptionBody">24 word backup phrase</div>
                        </div>
                        <div className="importOption">
                            <div className="importOptionHeader">Private Key</div>
                            <div className="importOptionBody">Generic private key</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Import;