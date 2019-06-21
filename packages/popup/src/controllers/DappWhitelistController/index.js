import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';

import './DappWhitelistController.scss';

class DappWhitelistController extends React.Component {

    render() {
        const { authorizeDapps, onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        return (
            <div className='insetContainer whitelist'>
                <div className='pageHeader'>
                    <div className='back' onClick={ () => onCancel() }>&nbsp;</div>
                    <FormattedMessage id='SETTING.TITLE.DAPP_WHITELIST' />
                </div>
                <div className='greyModal scroll'>
                    <div className='white'>
                    {
                        Object.values(authorizeDapps).sort((a,b)=>b.addTime - a.addTime).map(({url, addTime, contract},index)=>{
                            return (
                                <div className='dapp'>
                                    <div className='url'>
                                        <FormattedMessage id='DAPP_WHITELIST.URL' />
                                        <a target="_blank" href={'http://'+url}>{url}</a>
                                        <div className='delete' onClick={()=>{
                                            const dapps = Object.values(authorizeDapps).filter(({contract:address}) => contract !== address ).reduce((v,c)=>{v[c.contract] = c;return v;},{});
                                            PopupAPI.setAuthorizeDapps(dapps);
                                        }}>&nbsp;</div>
                                    </div>
                                    <div className='row'>
                                        <FormattedMessage id='DAPP_WHITELIST.CONTRACT_ADDRESS' />
                                        <CopyToClipboard text={ contract } onCopy={() => {
                                                Object.keys(authorizeDapps).forEach((v,i)=>{
                                                    if(i === index){
                                                        document.getElementById('contract'+i).innerText = formatMessage({ id: 'TRANSACTION_DETAIL.HAVE_COPIED' });
                                                    }  else {
                                                        document.getElementById('contract'+i).innerText = formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' });
                                                    }                                              })
                                            }}>
                                            <span data-tip={formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' })} data-for={'contract'+index}>
                                                { contract.substr(0,10)+'...'+contract.substr(-10) }
                                                <ReactTooltip id={'contract'+index} effect='solid' />
                                            </span>
                                        </CopyToClipboard>
                                    </div>
                                    <div className='row'>
                                        <FormattedMessage id='DAPP_WHITELIST.ADD_TIME' />
                                        <span>{moment(addTime).format('YYYY-MM-DD HH:mm')}</span>
                                    </div>
                                </div>)
                        })
                    }
                    {
                        Object.values(authorizeDapps).length === 0 ? <div className='noData'><FormattedMessage id='TRANSACTIONS.NO_DATA' /></div> : null
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export default injectIntl(DappWhitelistController);
