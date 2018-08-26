import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';
import Button from 'components/Button';

import './Import.css';

class Import extends Component {
    render() {
        return (
            <React.Fragment>
                <Header 
                    navbarTitle={ 'Import Account' }
                    navbarLabel={ 'We support four unique import methods' }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute='/main/accounts'
                    hideNav={ true }
                />
                <div className="import">
                    <NavLink to="/main/import/tronwatch" className="importOption">
                        <div className="importOptionHeader">
                            TronWatch
                        </div>
                        <div className="importOptionBody">
                            Mnemonic phrase generated in the <strong>TronWatch Desktop</strong> application
                        </div>
                    </NavLink>
                    <NavLink to="/main/import/tronscan" className="importOption">
                        <div className="importOptionHeader">
                            TronScan
                        </div>
                        <div className="importOptionBody">
                            Encrypted keystore file created by <strong>TronScan</strong>
                        </div>
                    </NavLink>
                    <NavLink to="/main/import/mnemonic" className="importOption">
                        <div className="importOptionHeader">
                            Mnemonic Phrase
                        </div>
                        <div className="importOptionBody">
                            List of 24 words created by <strong>Ledger</strong>, <strong>Trezor</strong>, <strong>TronLink</strong> or others
                        </div>
                    </NavLink>
                    <NavLink to="/main/import/privatekey" className="importOption">
                        <div className="importOptionHeader">
                            Private Key
                        </div>
                        <div className="importOptionBody">
                            Hexadecimal <strong>private key</strong> with no encryption
                        </div>
                    </NavLink>
                </div>
            </React.Fragment>
        );
    }
}

export default Import;