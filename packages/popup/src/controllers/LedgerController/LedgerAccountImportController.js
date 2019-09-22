import React from 'react';
import AccountName from '@tronlink/popup/src/components/AccountName';
import Button from '@tronlink/popup/src/components/Button';
import { APP_STATE } from '@tronlink/lib/constants';
import { Toast } from 'antd-mobile';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import NodeService from '@tronlink/backgroundScript/services/NodeService';
import { PopupAPI } from '@tronlink/lib/api';

//import './MnemonicImport.scss';
const IMPORT_STAGE = {
    ENTERING_MNEMONIC: 0,
    SELECTING_ACCOUNTS: 1
};

class LedgerAccountImportController extends React.Component {
    state = {
        subStage: 'choose account',
        isLoading: false,
        error:'',
        accounts:[],
        address:'',
        name:'',
        isValid:false
    };

    constructor() {
        super();
        this.import = this.import.bind(this);
    }

    async componentDidMount(){
        const { chains } = this.props;
        const accounts = [];
        const { ledgerImportAddress } = this.props;
        for(const address of ledgerImportAddress){
            const account = await PopupAPI.getAccountInfo(address);
            let balance = account[chains === '_'? 'mainchain':'sidechain'].balance;
            balance = balance ? balance:0;
            accounts.push({address,balance:balance});
        }
        this.setState({accounts});
    }

    handleCancel(){
        this.setState({subStage: 'choose account'});
    }

    async handleSubmit(name){

        const { address } = this.state;

        const res = await PopupAPI.importAccount(
            address,
            name
        );
        PopupAPI.setGaEvent('Ledger','Login',address);
        if(res)PopupAPI.resetState();
    }

    toggleAddress(address,index) {
        const { ledgerImportAddress } = this.props;
        ledgerImportAddress.forEach((v,i)=>{
            if(i === index){
                this.refs['option' + index].classList.toggle('isSelected');
                this.refs['option' + index].getElementsByClassName('checkbox')[0].classList.toggle('isSelected');
                if(this.refs['option' + index].classList.contains('isSelected')){
                    this.setState({address,isValid:true});
                } else {
                    this.setState({address:'',isValid:false});
                }
            }else{
                this.refs['option'+i].classList.remove('isSelected');
                this.refs['option'+i].getElementsByClassName('checkbox')[0].classList.remove('isSelected');
            }
        });
    }


    async import() {
        const { formatMessage } = this.props.intl;
        const { accounts } = this.props;
        const { address } = this.state;
        if(Object.keys(accounts).includes(address)){
            Toast.fail(formatMessage({id:'CREATION.LEDGER.REPEAT_IMPORT'}), 3, () => {}, true);
            return;
        }
        this.setState({subStage:'fill name'});
    }

    renderAccounts() {
        const { accounts,isValid } = this.state;
        const { isLoading } = this.state;
        return (
            <div className='insetContainer mnemonicImport'>
                <div className='pageHeader'>
                    <div className="back" onClick={ () => PopupAPI.changeState(APP_STATE.LEDGER) }>&nbsp;</div>
                    <FormattedMessage id="CREATION.RESTORE.MNEMONIC.RELATED_TO.ACCOUNT.TITLE" />
                </div>
                <div className='greyModal'>
                    <div className='modalDesc'>
                        <FormattedMessage id='CREATION.LEDGER.CHOOSE_ADDRESS' />
                    </div>
                    <div className='addressList'>

                        { accounts.map(({address,balance}, index) => {
                            return (
                                <div
                                    ref={ 'option'+index }
                                    className='addressOption'
                                    key={ index }
                                    tabIndex={ index + 1 }
                                    onClick={ () => !isLoading && this.toggleAddress(address,index) }
                                >
                                    <div className='checkbox'>&nbsp;</div>
                                    <span className="address">
                                        <span>{ `${address.substr(0,10)}...${address.substr(-10)}` }</span>
                                        <span><FormattedMessage id="COMMON.BALANCE" /> <FormattedMessage id="ACCOUNT.BALANCE" values={{amount:balance/1000000}} /></span>
                                    </span>
                                </div>
                            );
                        }) }
                    </div>
                    <div className='buttonRow'>
                        <Button
                            isValid={ isValid }
                            id='BUTTON.IMPORT'
                            onClick={ () => this.import() }
                            isLoading={ isLoading }
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { subStage } = this.state;
        if(subStage === 'choose account'){
            return this.renderAccounts();
        } else {
            return <AccountName onCancel={this.handleCancel.bind(this)} onSubmit={this.handleSubmit.bind(this)} />;
        }


    }
}

export default injectIntl(
    connect(state => ({
        accounts:state.accounts.accounts,
        ledgerImportAddress: state.app.ledgerImportAddress
    }))(LedgerAccountImportController)
);
