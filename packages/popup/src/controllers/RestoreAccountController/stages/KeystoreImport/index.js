import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import Utils from '@tronlink/lib/utils';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { bytesToString } from "@tronscan/client/src/utils/bytes";
import { hexStr2byteArray } from "@tronscan/client/src/lib/code";
import { pkToAddress } from "@tronscan/client/src/utils/crypto";

import './KeystoreImport.scss';


class KeystoreImport extends React.Component {
    constructor() {
        super();
        this.state = {
            isValid: false,
            isLoading: false,
            error:'',
            selectedFile:{
                show:false,
                name:'',
                contents:''     
            },
            password:''    
        };
    }

    async unlockKeyFile(){
        this.setState({isLoading: true});
        const { name, accounts } = this.props;
        const { formatMessage } = this.props.intl;
        const {password, selectedFile:{ contents }} = this.state;
        try {
            const {key, address, salt} = JSON.parse(bytesToString(hexStr2byteArray(contents)));
            const privateKey = Utils.decryptString(password, salt, key);
            if (Utils.validatePrivateKey(privateKey) && pkToAddress(privateKey) === address) {
                if (address in accounts) {
                    Toast.fail(formatMessage({id: 'EXCEPTION.ACCOUNT_EXIST'}), 3, () => {
                        this.setState({isLoading: false});
                    });
                } else {
                    const res = await PopupAPI.importAccount(privateKey, name);
                    if (res) {
                        this.setState({isLoading: false});
                        PopupAPI.resetState();
                    }
                }
            } else {
                Toast.fail(formatMessage({id: 'CREATION.RESTORE.KEY_STORE.EXCEPTION'}), 3, () => {
                    this.setState({isLoading: false});
                });
            }
        } catch(e){
            Toast.fail(formatMessage({id: 'CREATION.RESTORE.KEY_STORE.EXCEPTION'}), 3, () => {
                this.setState({isLoading: false});
            });
        }
    }
    

    render() {
        const { selectedFile,password,isLoading } = this.state;
        const { onCancel } = this.props;
        return (
            <div className='insetContainer keystoreImport'>
                <div className='pageHeader'>
                    <div className='back' onClick={ () => onCancel() }></div>
                    <FormattedMessage id='CHOOSING_TYPE.KEY_STORE.TITLE' />
                </div>
                <div className='greyModal'>
                    <div className='uploadDesc'>
                        <FormattedMessage id='CREATION.RESTORE.KEY_STORE.UPLOAD_DESC' />
                    </div>
                    <div className='uploadWrap'>
                        <input type='file' ref='file' accept='.txt' onChange={async(e) => {
                                if (e.target.value.endsWith(".txt")){
                                    const files = e.target.files;
                                    const contents = await Utils.readFileContentsFromEvent(e);
                                    const name = files[0].name.length>14?files[0].name.substr(0,5)+'...'+files[0].name.substr(-9,5)+'.txt':files[0].name;
                                    this.refs.file.value = '';
                                    const selectedFile = { show: true, name, contents };
                                    this.setState({selectedFile});
                                }
                            }} />
                        <div className='icon'>&nbsp;</div>
                        <div className='text'>
                            <FormattedMessage id='CREATION.RESTORE.KEY_STORE.SELECT_FILE' />
                        </div> 
                    </div>
                    <div className='passwordWrap'>
                        {
                            selectedFile.show ?
                            <div className='selectedFile'>
                                <span>{selectedFile.name}</span>                            
                            </div>
                            :
                            null
                        }       
                        <div className='password'>
                            <label>
                                <FormattedMessage id='CREATION.RESTORE.KEY_STORE.INPUT_PASSWORD' />
                            </label>
                            <input type="password" onChange={e=> this.setState({password:e.target.value})} />
                        </div> 
                        <Button id='CREATION.RESTORE.TITLE' isLoading={isLoading} isValid={selectedFile.show && selectedFile.name && password} onClick={()=> this.unlockKeyFile()} />  
                    </div>
                </div>
            </div>
        )
    }
}

export default injectIntl(connect(state => ({
        accounts: state.accounts.accounts
    }))(KeystoreImport));
