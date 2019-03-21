/*
 * @Author: lxm
 * @Date: 2019-03-19 15:18:05
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-20 19:51:22
 * TronBankPage
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import TronWeb from 'tronweb';
import { VALIDATION_STATE, APP_STATE } from '@tronlink/lib/constants';
import { NavBar, Button, Modal } from 'antd-mobile';
import './TronBankController.scss';

class BankController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            maskVisible: true,
            modalVisible: false,
            selected: '',
            isOpen: {
                account: false,
                token: false
            },
            selectedToken: {
                id: '_',
                name: 'TRX',
                amount: 0,
                decimals: 6
            },
            loading: false
        };
    }

    componentDidMount() { // data by props
        const { selectedToken, selected } = this.props.accounts;
        selectedToken.amount = selectedToken.id === '_' ? selected.balance / Math.pow(10, 6) : selectedToken.amount;
        this.setState({ selectedToken });
        console.log(selectedToken, selected);
    }

    onRecipientChange(e) {
        //reacipientchange
        const address = e.target.value;
        const recipient = {
            value: address,
            valid: VALIDATION_STATE.NONE
        };

        if(!address.length)
            return this.setState({ recipient });

        if(!TronWeb.isAddress(address))
            recipient.valid = false;
        else recipient.valid = true;

        this.setState({
            recipient
        });
    }

    onModalClose = key => () => {
        this.setState({
            [ key ]: false,
        });
    };

    render() {
        const { selected } = this.props.accounts;
        const { formatMessage } = this.props.intl;
        const myImg = src => { return require(`../../assets/images/new/tronBank/${src}.svg`); };
        console.log(myImg('more'));
        return (
            <div className='TronBankContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<div className='commonBack'></div>}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.READY)}
                    rightContent={<img className='rightMore' src={myImg('more')} alt={'more'}/>}
                >TronBank
                </NavBar>
                <div className='bankContent'>
                    {/* account pay,receive */}
                    <div className='accountContent'>
                        <section className='accountInfo infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.PAY_ACCOUNT'/></label>
                            <div className='selectedAccount'>
                                <FormattedMessage id='BANK.INDEX.ACCOUNT'/>一<span>{ selected.address }</span>
                            </div>
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.BALANCE' values={{ amount: selected.balance / Math.pow(10, 6) }}/>
                            </div>
                        </section>
                        <section className='infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.RECEIVE_ADDRESS'/></label>
                            <div className='receiveAccount'>
                                <input onChange={(e) => { this.onRecipientChange(e); } } placeholder={ formatMessage({ id: 'BANK.INDEX.PLACEHOLDER' })}/>
                            </div>
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.USED'/>/<FormattedMessage id='BANK.INDEX.TOTAL'/>
                            </div>
                        </section>
                    </div>
                    {/* rent num,day */}
                    <div className='rentContent'>
                        <section className='infoSec'>
                            <label><FormattedMessage id='BANK.INDEX.RENTNUM'/><img onClick={() => { this.setState({ modalVisible: true }); }} className='rentNumEntrance' src={myImg('question')} alt={'question'}/></label>
                            <div className='receiveAccount'>
                                <input className='rentNumInput' placeholder={ formatMessage({ id: 'BANK.INDEX.FREEZEPLACEHOLDER' })} />TRX
                            </div>
                        </section>
                        <section className='infoSec'>
                            <label><FormattedMessage id='BANK.INDEX.RENTDAY'/></label>
                            <div className='dayRange'>
                                <span><Button className='operatingBtn' icon={<img className='operationReduceIcon' src={myImg('subtrac')} alt='subtrac' />} inline size='small'></Button></span>
                                <input className='rentDay' placeholder={ formatMessage({ id: 'BANK.INDEX.RENTPLACEHOLDER' })} type='text' />
                                <span><Button className='operatingBtn' icon={<img className='operationAddIcon' src={myImg('add')} alt='add' />} inline size='small'></Button></span>
                            </div>
                        </section>
                        <section className='rentIntroduce'>
                            <FormattedMessage id='BANK.INDEX.RENTINTRODUCE'/>
                        </section>
                    </div>
                    {/* subbtn */}
                    <Button className='bankSubmit' disabled style={{ background: '#C2C8D5' }}>
                        <FormattedMessage id='BANK.INDEX.BUTTON'/>
                    </Button>
                </div>
                <Modal
                    className='modalWrapper'
                    visible={this.state.modalVisible}
                    transparent
                    maskClosable={false}
                    onClose={this.onModalClose('modalVisible')}
                    title='租用量说明'
                    footer={[{ text: 'Ok', onPress: () => { this.onModalClose('modalVisible')(); } }]}
                    afterClose={() => { console.log('afterClose'); }}
                >
                    <div className='rentIntroduceCont'>
                        文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容文案内容
                    </div>
                </Modal>
            </div>
        );
    }
}

export default injectIntl(BankController);
