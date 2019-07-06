/**
 * Created by tron on 2019/7/3.
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@tronlink/popup/src/components/Button';
import Loading from '@tronlink/popup/src/components/Loading';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE, CONTRACT_ADDRESS } from "@tronlink/lib/constants";
import LedgerDevice from "@tronlink/lib/ledger/LedgerBridge";
import Util from '@tronlink/lib/utils'

import './LedgerController.scss';
class LedgerController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            connected: false,
            confirmed: false,
            address: ""
        };
    }

    componentDidMount(){
        window.addEventListener('message',(e)=>{
            if(e.data.target==='LEDGER-IFRAME'){
                console.log(e.data);
                const { address } = e.data;
                PopupAPI.setLedgerImportAddress([address]);
                PopupAPI.changeState(APP_STATE.LEDGER_IMPORT_ACCOUNT);
                this.setState({loading:false});
            }
        },false);
    }

    handleClose(){
        this.setState({loading:false});

    }

    async onSubmit() {
        this.setState({loading: true});
        console.log(document.querySelector('#tronLedgerBridge'));
        document.querySelector('#tronLedgerBridge').contentWindow.postMessage({target:"LEDGER-IFRAME",data:'connect ledger'},'*');
    }

    render() {
        const { loading } = this.state;
        const { formatMessage } = this.props.intl;

        return (
            <div className='insetContainer ledger'>
                <Loading show={loading} onClose={this.handleClose.bind(this)} />
                <div className='pageHeader'>
                    <div className='back' onClick={()=>PopupAPI.resetState()}>&nbsp;</div>
                    <FormattedMessage id='CREATION.LEDGER.CONNECT_TITLE' />
                </div>
                <div className='greyModal scroll'>
                    <div className="top">
                        <div className="icon">&nbsp;</div>
                        <Button
                            id='CREATION.LEDGER.CONNECT'
                            onClick={ () => this.onSubmit() }
                        />
                    </div>
                    <div className="row">
                        <div className="line" index="1">&nbsp;</div>
                        <div className="desc" dangerouslySetInnerHTML={{__html:formatMessage({id:'CREATION.LEDGER.PROCESS_1'})}}></div>
                        <img src={require('@tronlink/popup/src/assets/images/new/ledger/step1.png')} alt=""/>
                    </div>
                    <div className="row">
                        <div className="line" index="2">&nbsp;</div>
                        <div className="desc" dangerouslySetInnerHTML={{__html:formatMessage({id:'CREATION.LEDGER.PROCESS_2'})}}></div>
                        <img style={{height:60}} src={require('@tronlink/popup/src/assets/images/new/ledger/step2.png')} alt=""/>
                    </div>
                    <div className="row">
                        <div className="line" index="3">&nbsp;</div>
                        <div className="desc" dangerouslySetInnerHTML={{__html:formatMessage({id:'CREATION.LEDGER.PROCESS_3'})}}></div>
                        <img src={require('@tronlink/popup/src/assets/images/new/ledger/step3.png')} alt=""/>
                    </div>
                    <a className="more" href="javascript:;" target="_blank" ><FormattedMessage id='CREATION.LEDGER.KNOW_MORE' /></a>
                </div>
            </div>
        );
    }
}

export default injectIntl(LedgerController);
