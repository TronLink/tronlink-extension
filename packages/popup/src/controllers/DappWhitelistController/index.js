import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import moment from 'moment';

import './DappWhitelistController.scss';

class DappWhitelistController extends React.Component {

    render() {
        const { authorizeDapps, onCancel } = this.props;
        return (
            <div className='insetContainer whitelist'>
                <div className='pageHeader'>
                    <div className='back' onClick={ () => onCancel() }></div>
                    <FormattedMessage id='SETTING.TITLE.DAPP_WHITELIST' />
                </div>
                <div className='greyModal scroll'>
                    <div className='white'>
                    {
                        Object.values(authorizeDapps).sort((a,b)=>b.addTime - a.addTime).map(({url, addTime, contract})=>{
                            return (
                                <div className='dapp'>
                                    <div className='url'>
                                        <FormattedMessage id='DAPP_WHITELIST.URL' />
                                        <span>{url}</span>
                                        <div className='delete' onClick={()=>{
                                            const dapps = Object.values(authorizeDapps).filter(({contract:address}) => contract !== address ).reduce((v,c)=>{v[c.contract] = c;return v;},{});
                                            PopupAPI.setAuthorizeDapps(dapps);
                                        }}>&nbsp;</div>
                                    </div>
                                    <div className='row'>
                                        <FormattedMessage id='DAPP_WHITELIST.CONTRACT_ADDRESS' />
                                        <span>{contract.substr(0,10)+'...'+contract.substr(-10)}</span>
                                    </div>
                                    <div className='row'>
                                        <FormattedMessage id='DAPP_WHITELIST.ADD_TIME' />
                                        <span>{moment(addTime).format('YYYY.MM.DD')}</span>
                                    </div>
                                </div>)
                        })
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export default DappWhitelistController;
