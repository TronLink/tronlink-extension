/*
 * @Author: lxm
 * @Date: 2019-03-19 15:18:05
 * @Last Modified by: lxm
 * @Last Modified time: 2019-03-19 22:23:52
 * TronBankPage
 */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import { Flex, NavBar, Icon, List, InputItem, } from 'antd-mobile';
import {
    APP_STATE
} from '@tronlink/lib/constants';
import './TronBankController.scss';

class BankController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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

    onRecipientChange() {
        //reacipientchange
    }

    render() {
        const { selected } = this.props.accounts;
        const { formatMessage } = this.props.intl;
        return (
            <div className='TronBankContainer'>
                <NavBar
                    className='navbar'
                    mode='light'
                    icon={<Icon type='left' />}
                    onLeftClick={() => PopupAPI.changeState(APP_STATE.READY)}
                    rightContent={[
                        <Icon key='1' type='ellipsis' />,
                    ]}
                >TronBank
                </NavBar>
                <div className='bankContent'>
                    {/* account pay receive */}
                    <div className='accountContent'>
                        <section className='accountInfo infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.PAY_ACCOUNT'/></label>
                            <div className='selectedAccount'>
                                <FormattedMessage id='BANK.INDEX.ACCOUNT'/>一<span>{ selected.address }</span>
                            </div>
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.BALANCE'/>
                                {/* &nbsp; {selected.balance / Math.pow(10, 6)} TRX */}
                            </div>
                        </section>
                        <section className='receiveInfo infoSec'>
                            <label><FormattedMessage id='ACCOUNT.SEND.RECEIVE_ADDRESS'/></label>
                            <div className='receiveAccount'>
                                <input placeholder={ formatMessage({ id: 'BANK.INDEX.PLACEHOLDER' })}/>
                            </div>
                            <div className='balance'>
                                <FormattedMessage id='BANK.INDEX.USED'/>/<FormattedMessage id='BANK.INDEX.TOTAL'/>
                            </div>
                        </section>
                    </div>
                    {/* rent num day */}
                    <div className='rentContent'>
                        <section className='rentNumInfo infoSec'>
                            <label><FormattedMessage id='BANK.INDEX.RENTNUM'/></label>
                            <div className='receiveAccount'>
                                <input placeholder={ formatMessage({ id: 'BANK.INDEX.PLACEHOLDER' })} />TRX
                            </div>
                        </section>
                        <section className='rentDayInfo infoSec'>
                            <label><FormattedMessage id='BANK.INDEX.RENTDAY'/></label>
                            <div className='balance'>
                                
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(BankController);
