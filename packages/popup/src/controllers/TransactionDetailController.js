import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import ReactTooltip from 'react-tooltip';
import { Popover } from 'antd-mobile';
import CopyToClipboard from 'react-copy-to-clipboard';
const myImg = src => <img src={`https://gw.alipayobjects.com/zos/rmsportal/${src}.svg`} className='am-icon am-icon-xs' alt="" />
class TransactionDetailController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ids: [ 'ownerAddress', 'toAddress', 'hash', 'block' ],
            help: false
        };
        this.copy = this.copy.bind(this);
    }
    copy(id) {
        const { ids } = this.state;
        const { formatMessage } = this.props.intl;
        for(let i = 0; i < ids.length; i++) {
            if( ids[ i ] === id ) {
                document.getElementById(id).innerText = formatMessage({ id: 'TRANSACTION_DETAIL.HAVE_COPIED' });
            } else {
                document.getElementById(ids[ i ]).innerText = formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' });
            }
        }
    }
    render() {
        const { help } = this.state;
        const { selectedToken, selected, onCancel } = this.props;
        const { formatMessage } = this.props.intl;
        const { transactionDetail: t, address, } = selected;
        let amount = t.contractType === 31 ? ( t.tokenTransferInfo ? t.tokenTransferInfo.amount_str : t.trigger_info.call_value ) : t.contractData.amount;
        amount = new BigNumber(amount).shiftedBy(-selectedToken.decimals).toString();
        return (
            <div className='insetContainer transactions' onClick={ () => { this.setState({ isOpen: { account: false, token: false } }); } }>
                <div className='pageHeader'>
                    <div className='back' onClick={onCancel}> </div>
                    <FormattedMessage id='TRANSACTION_DETAIL'/>
                </div>
                <div className='greyModal detail'>
                    <div className='part1'>
                        <div className='icon'> </div>
                        <div className='state'><FormattedMessage id='TRANSACTION_DETAIL.TRANSFER_SUCCESS' /></div>
                        <div className='amount'>
                            {t.toAddress === address ? '+' : '-'}{ amount } {selectedToken.abbr}
                        </div>
                    </div>
                    <div className='part2'>
                        <div className='cell'>
                            <div className='title'>
                                <FormattedMessage id='TRANSACTION_DETAIL.SEND_ADDRESS' />
                            </div>
                            <CopyToClipboard text={ t.ownerAddress } onCopy={(e) => this.copy('ownerAddress')}>
                                <div className='content'>
                                    <a data-tip={formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' })} data-for='ownerAddress'>
                                        { t.ownerAddress }
                                    </a>
                                    <ReactTooltip id='ownerAddress' effect='solid' />
                                </div>
                            </CopyToClipboard>
                        </div>
                        <div className='cell'>
                            <div className='title'>
                                 <FormattedMessage id='TRANSACTION_DETAIL.RECEIVE_ADDRESS' />
                            </div>
                            <CopyToClipboard text={ t.toAddress } onCopy={(e) => this.copy('toAddress')}>
                                <div className='content'>
                                    <a data-tip={formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' })} data-for='toAddress'>
                                        { t.toAddress }
                                    </a>
                                    <ReactTooltip id='toAddress' effect='solid' />
                                </div>
                            </CopyToClipboard>
                        </div>
                        <div className='cell'>
                            <div className='title'>
                                <FormattedMessage id='TRANSACTION_DETAIL.ID' />
                            </div>
                            <CopyToClipboard text={ t.hash } onCopy={(e) => this.copy('hash')}>
                                <div className='content'>
                                    <a data-tip={formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' })} data-for='hash'>
                                        { t.hash }
                                    </a>
                                    <ReactTooltip id='hash' effect='solid' />
                                </div>
                            </CopyToClipboard>
                        </div>
                        <div className='cell'>
                            <div className='title'>
                                <FormattedMessage id='TRANSACTION_DETAIL.BLOCK_HEIGHT' />
                            </div>
                            <CopyToClipboard text={ t.block } onCopy={(e) => this.copy('block')}>
                                <div className='content'>
                                    <a data-tip={formatMessage({ id: 'TRANSACTION_DETAIL.ENABLE_COPY' })} data-for='block'>
                                        { t.block }
                                    </a>
                                    <ReactTooltip id='block' effect='solid' />
                                </div>
                            </CopyToClipboard>
                        </div>
                        {
                            t.cost.energy_fee >= 0 && t.cost.net_fee >= 0 && t.cost.energy_fee + t.cost.net_fee > 0
                                ?
                                <div className='cell'>
                                    <div className='title'>
                                        <FormattedMessage id='TRANSACTION_DETAIL.FEE' />
                                            <Popover
                                                 overlayClassName='fortest'
                                                 overlayStyle={{ color: 'currentColor' }}
                                                 visible={ help }
                                                 overlay={<div style={{padding:10}}> <FormattedMessage id='TRANSACTION_DETAIL.EXPLAIN.CONSUME' /> </div>}
                                                 placement='right'
                                                 align={{
                                                     overflow: { adjustY: 0, adjustX: 0 },
                                                     offset: [10, 0],
                                                 }}
                                            >
                                                <div className='help' onMouseEnter={() => this.setState({ help: true })}
                                                     onMouseLeave={() => this.setState({ help: false })}>
                                                    {myImg('uQIYTFeRrjPELImDRrPt')}
                                                </div>
                                            </Popover>
                                    </div>
                                    <div className='content'>
                                        {new BigNumber(t.cost.energy_fee + t.cost.net_fee).shiftedBy(-6).toString()} TRX
                                    </div>
                                </div>
                                :
                                null
                        }
                    </div>
                    <div className='part3' onClick={() => window.open(`https://tronscan.org/#/transaction/${t.hash}`)}>
                        <FormattedMessage id='TRANSACTION_DETAIL.GO_TRONSCAN' />
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(TransactionDetailController);
