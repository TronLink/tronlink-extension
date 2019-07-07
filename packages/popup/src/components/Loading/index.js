/**
 * Created by tron on 2019/7/3.
 */
import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import LoadingGif from 'assets/images/loading_black.gif';

import { injectIntl } from 'react-intl';

import './Loading.scss';

class Loading extends React.Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(document.getElementById('tronLedgerBridge')){
            document.head.removeChild(document.getElementById('tronLedgerBridge'));
        }
        const iframe = document.createElement('iframe');
        iframe.id = 'tronLedgerBridge';
        iframe.src = 'https://zacharyle.github.io/tron-ledger-bridge?new='+Math.random();
        document.head.appendChild(iframe);
    }

    render() {
        const {formatMessage} = this.props.intl;
        const {
            show = true,
            title = formatMessage({id: 'CREATION.LEDGER.LOADING'})
        } = this.props;

        return (
            show
                ?
                <div className="loading">
                    <div className="wrap">
                        <div className="title">
                            {title}
                        </div>
                        <img src={LoadingGif} alt=""/>
                        <Button id="BUTTON.CANCEL" onClick={this.props.onClose}/>
                    </div>
                </div>
                :
                null
        );
    }
};

export default injectIntl(Loading);