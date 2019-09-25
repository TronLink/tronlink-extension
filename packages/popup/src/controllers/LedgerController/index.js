/**
 * Created by tron on 2019/7/3.
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@tronlink/popup/src/components/Button';
import Loading from '@tronlink/popup/src/components/Loading';
import { PopupAPI } from '@tronlink/lib/api';
import { APP_STATE } from "@tronlink/lib/constants";
import { Toast } from 'antd-mobile';

import './LedgerController.scss';
class LedgerController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            connected: false,
            confirmed: false,
            address: "",
            listener:null
        };
        this.listener = this.listener.bind(this);
    }

    listener(event){
        const { formatMessage } = this.props.intl;
        if(event.data.target==='LEDGER-IFRAME'){
            console.log(event.data);
            const { connected,address,error } = event.data;
            if(connected){
                PopupAPI.setLedgerImportAddress([address]);
                PopupAPI.changeState(APP_STATE.LEDGER_IMPORT_ACCOUNT);
                this.setState({loading:false});
            } else {
                let id = '';
                if(error.match(/denied by the user/)){
                    id = 'CREATION.LEDGER.REJECT';
                }else if(error.match(/U2F TIMEOUT/)){
                    id = 'CREATION.LEDGER.AUTHORIZE_TIMEOUT';
                }else{
                    id = 'CREATION.LEDGER.CONNECT_TIMEOUT';
                }
                this.setState({loading: false});
                Toast.fail(formatMessage({id}), 3, () => {}, true);
            }
        }
    }

    componentDidMount(){
        window.addEventListener('message',this.listener,false);
    }

    componentWillUnmount(){
        window.removeEventListener('message',this.listener,false);
    }

    handleClose(){
        this.setState({loading:false});

    }

    async onSubmit() {
        this.setState({loading: true});
        document.querySelector('#tronLedgerBridge').contentWindow.postMessage({target:"LEDGER-IFRAME",action:'connect ledger',data:''},'*');
    }

    render() {
        const { loading } = this.state;
        const { language } = this.props;
        const { formatMessage } = this.props.intl;
        const url = language === 'zh' ? 'https://support.tronlink.org/hc/zh-cn/articles/360030570852-TronLink%E6%8F%92%E4%BB%B6%E6%AD%A3%E5%BC%8F%E5%85%BC%E5%AE%B9Ledger-%E6%94%AF%E6%8C%81%E7%99%BB%E9%99%86%E5%8F%8A%E8%BD%AC%E8%B4%A6-' : 'https://support.tronlink.org/hc/en-us/articles/360030569452-TronLink-Chrome-integrated-with-Ledger-Supporting-account-login-and-transaction-';
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
                        <img style={{height:22}} src={require('@tronlink/popup/src/assets/images/new/ledger/step2_2.png')} alt=""/>
                    </div>
                    <div className="row">
                        <div className="line" index="3">&nbsp;</div>
                        <div className="desc" dangerouslySetInnerHTML={{__html:formatMessage({id:'CREATION.LEDGER.PROCESS_3'})}}></div>
                        <img src={require('@tronlink/popup/src/assets/images/new/ledger/step3.png')} alt=""/>
                    </div>
                    <a className="more" href={url} target="_blank" ><FormattedMessage id='CREATION.LEDGER.KNOW_MORE' /></a>
                </div>
            </div>
        );
    }
}

export default injectIntl(LedgerController);
