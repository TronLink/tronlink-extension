import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';
import { ArrowLeftIcon } from 'components/Icons';
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
                <NavLink to="/main/accounts" className="importBackButton"><ArrowLeftIcon /></NavLink>
                <div className="importHeader">Import Wallet</div>
                <div className="importText">Click your preferred import method below.</div>
                <div className="importOptions">
                    <div className="importOptionGroupHeader">Site-Specific :</div>
                    <div className="importOptionGroup">
                        <NavLink to="/main/import/tronwatch" className="importOption">
                            <div className="importOptionHeader">TronWatch</div>
                            <div className="importOptionBody">24 word backup phrase generated from TronWatch</div>
                        </NavLink>
                        <NavLink to="/main/import/tronscan" className="importOption">
                            <div className="importOptionHeader">TronScan</div>
                            <div className="importOptionBody">KeyStore file contents generated from tronscan.org</div>
                        </NavLink>
                    </div>
                    <div className="importOptionGroupHeader">Generic :</div>
                    <div className="importOptionGroup">
                        <NavLink to="/main/import/wordlist" className="importOption">
                            <div className="importOptionHeader">Word List</div>
                            <div className="importOptionBody">24 word backup phrase</div>
                        </NavLink>
                        <NavLink to="/main/import/privatekey" className="importOption">
                            <div className="importOptionHeader">Private Key</div>
                            <div className="importOptionBody">Generic private key</div>
                        </NavLink>
                    </div>
                </div>
            </div>
        );
    }
}

export default Import;