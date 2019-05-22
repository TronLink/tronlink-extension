import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import Utils from '@tronlink/lib/utils';
import Toast, { T } from 'react-toast-mobile';
import { Switch } from 'antd-mobile';
import TronWeb from 'tronweb';
import { CONTRACT_ADDRESS } from '@tronlink/lib/constants';
const token10DefaultImg = require('@tronlink/popup/src/assets/images/new/token_10_default.png');
class AssetManageController extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: {
                value: '',
                valid: false
            },
            allTokens: [],
            filterTokens: [],
            deleteToken: {
                show: false,
                tokenId: ''
            }
        };
    }

    async componentDidMount() {
        const allTokens = await PopupAPI.getAllTokens();
        this.setState({ allTokens: Utils.dataLetterSort(allTokens, 'abbr') });
    }

    renderDeleteToken(tokens, deleteToken) {
        if(deleteToken.show) {
            const field = deleteToken.tokenId.match(/^T/) ? 'smart' : 'basic';
            const { imgUrl = false, name, abbr = false, symbol = false } = tokens[ field ][ deleteToken.tokenId ];
            return (
                <div className='deleteTokenWrap'>
                    <div className='deleteToken'>
                        <div className='title'>
                            <FormattedMessage id='ASSET.CONFIRM.HIDE_TOKEN'/>
                        </div>
                        <div className='icon'>
                            <img src={imgUrl ? imgUrl : token10DefaultImg} />
                        </div>
                        <div className='name'>
                            {name}({abbr || symbol})
                        </div>
                        <div className='desc'>
                            <FormattedMessage id='ASSET.CONFIRM.CONTENT'/>
                        </div>
                        <div className='btnGroup'>
                            <button className='cancel' onClick={ () => this.cancelDeleteToken() }>
                                <FormattedMessage id='ASSET.CONFIRM.CANCEL'/>
                            </button>
                            <button className='confirm' onClick={ () => this.confirmDeleteToken() }>
                                <FormattedMessage id='ASSET.CONFIRM.HIDE'/>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    cancelDeleteToken() {
        const deleteToken = { show: false, tokenId: '' };
        this.setState({ deleteToken });
    }

    confirmDeleteToken() {
        const { selected } = this.props;
        const { deleteToken, filterTokens } = this.state;
        const { tokenId } = deleteToken;
        const field = tokenId.match(/^T/) ? 'smart' : 'basic';
        selected.tokens[ field ][ tokenId ].isLocked = true;
        const fs = filterTokens.map(({ tokenId: id, ...token }) => {
            if(id === tokenId)
                token.isList = false;
            return { tokenId: id, ...token };
        });
        this.setState({ filterTokens: fs, deleteToken: { show: false, tokenId: '' } });
        PopupAPI.updateTokens(selected.tokens);
    }

    render() {
        const { formatMessage } = this.props.intl;
        const { selected, onCancel } = this.props;
        const { address, allTokens, filterTokens, deleteToken } = this.state;
        let tokens = { ...selected.tokens.basic, ...selected.tokens.smart };
        tokens = Utils.dataLetterSort(Object.entries(tokens).filter(([tokenId, token]) => tokenId !== CONTRACT_ADDRESS.USDT && typeof token === 'object' ).map(v => { v[ 1 ].tokenId = v[ 0 ];return v[ 1 ]; }).filter(v => v.balance > 0 || (v.balance == 0 && !v.isLocked) ), 'abbr', 'symbol');
        return (
            <div className='insetContainer asset scroll'>
                { this.renderDeleteToken(selected.tokens, deleteToken) }
                <div className='pageHeader'>
                    <div className='back' onClick={onCancel}> </div>
                    <FormattedMessage id='ASSET.ASSET_MANAGE' />
                </div>
                <div className='greyModal'>
                    <Toast />
                    <div className='title'>
                        <FormattedMessage id='ASSET.ADD_TOKEN' />
                    </div>
                    <div className={ 'input' + ( address.value === '' ? '' : ' hasValue' ) }>
                        <input type='text' onChange={ async(e) => {
                            const value = e.target.value;
                            let fTokens = [];
                            if(value !== '') {
                                if(TronWeb.isAddress(value)) {
                                    const token = await PopupAPI.getSmartToken(value);
                                    if(!token) {
                                        T.notify(formatMessage({ id: 'ERRORS.INVALID_TOKEN' }));
                                        return;
                                    } else {
                                        fTokens = allTokens.filter(({ tokenId }) => tokenId === value);
                                        if(!fTokens.length) {
                                            fTokens[ 0 ] = {
                                                tokenId: value,
                                                imgUrl: false,
                                                name: token.name,
                                                symbol: token.symbol,
                                                decimals: token.decimals,
                                                balance: token.balance,
                                                price: 0
                                            };
                                        } else {
                                            fTokens[ 0 ].symbol = fTokens[ 0 ].abbr;
                                            fTokens[ 0 ].price = selected.tokens.smart.hasOwnProperty(value) ? selected.tokens.smart[ value ].price : 0;
                                        }
                                        fTokens[ 0 ].isList = selected.tokens.smart.hasOwnProperty(value) && (!selected.tokens.smart[ value ].hasOwnProperty('isLocked') || !selected.tokens.smart[ value ].isLocked ) ? true : false;
                                    }
                                } else {
                                    const regexp = new RegExp(value, 'i');
                                    fTokens = allTokens.filter(({ name, abbr }) => name.match(regexp) || abbr.match(regexp));
                                    fTokens = fTokens.map(({ tokenId, ...token }) => {
                                        const field = tokenId.match(/^T/) ? 'smart' : 'basic';
                                        const name = token.name.match(regexp) ? token.name.split(token.name.match(regexp)[ 0 ]).join('<i>' + token.name.match(regexp)[ 0 ] + '</i>') : token.name;
                                        const abbr = token.abbr.match(regexp) ? token.abbr.split(token.abbr.match(regexp)[ 0 ]).join('<i>' + token.abbr.match(regexp)[ 0 ] + '</i>') : token.abbr;
                                        token.isList = selected.tokens[ field ].hasOwnProperty(tokenId) && (!selected.tokens[ field ][ tokenId ].hasOwnProperty('isLocked') || !selected.tokens[ field ][ tokenId ].isLocked ) ? true : false;
                                        token.html = `${name}(${abbr})`;
                                        token.balance = selected.tokens[ field ].hasOwnProperty(tokenId) ? selected.tokens[ field ][ tokenId ].balance : 0;
                                        token.price = selected.tokens[ field ].hasOwnProperty(tokenId) ? selected.tokens[ field ][ tokenId ].price : 0;
                                        return { tokenId, ...token };
                                    });
                                }
                            }
                            this.setState({ filterTokens: fTokens,  address: {value} });
                        }} placeholder={formatMessage({ id: 'ASSET.ADD_TOKEN.PLACEHOLDER' })} />
                    </div>
                    <div className='leftSpace scroll'>
                        <div className='cellWrap'>
                            {
                                filterTokens.map(({ tokenId, symbol = false, abbr = false, imgUrl, name, isList = false, html = `${name}(${abbr})`, decimals, balance = 0 }) => {
                                    return (
                                        <div className='cell'>
                                            <img src={imgUrl ? imgUrl : token10DefaultImg} onError={(e) => { e.target.src = token10DefaultImg; }} />
                                            <div className='desc'>
                                                <div className='row1' dangerouslySetInnerHTML={{__html: html}}></div>
                                                <div className='row2'>
                                                    {tokenId.match(/^T/) ? 'contract' : 'ID'} : { tokenId.match(/^T/) ? tokenId.substr(0, 7) + '...' + tokenId.substr(-7) : tokenId}
                                                </div>
                                            </div>
                                            {
                                                <Switch color='#636ACC' checked={isList} onClick={(e) => {
                                                    const field = tokenId.match(/^T/) ? 'smart' : 'basic';
                                                    const filters = filterTokens.map(({ tokenId: id, ...token }) => {
                                                        if (id === tokenId)
                                                            token.isList = !isList;
                                                        return { tokenId: id, ...token };
                                                    });
                                                    this.setState({ filterTokens: filters });
                                                    if(!isList) {
                                                        const token = { name, imgUrl, balance, isLocked: false, decimals, price: 0 };
                                                        const key = TronWeb.isAddress(address.value) ? 'symbol' : 'abbr';
                                                        token[ key ] = abbr || symbol;
                                                        selected.tokens[ field ][ tokenId ] = token;
                                                    } else {
                                                        selected.tokens[ field ][ tokenId ].isLocked = true;
                                                        // const balance = selected.tokens[ field ][ tokenId ].balance;
                                                        // if(balance > 0 ) {
                                                        //     selected.tokens[ field ][ tokenId ].isLocked = true;
                                                        // } else {
                                                        //     //delete selected.tokens[ field ][ tokenId ];
                                                        // }
                                                    }
                                                    PopupAPI.updateTokens(selected.tokens);
                                                }}/>

                                            }
                                        </div>
                                    );
                                })
                            }
                        </div>
                        <div className='title' style={{marginTop: '20px'}}>
                            <FormattedMessage id='ASSET.MY_ASSET' />
                        </div>
                        <div className='cellWrap'>
                            {
                                tokens.map(({ tokenId, symbol, abbr, imgUrl, name, isLocked = false ,balance}) => (
                                    <div className='cell'>
                                        <img src={imgUrl ? imgUrl : token10DefaultImg} onError={(e) => { e.target.src = token10DefaultImg; }} />
                                        <div className='desc'>
                                            <div className='row1'>
                                                {name}({abbr || symbol})
                                            </div>
                                            <div className='row2'>
                                                {tokenId.match(/^T/) ? 'contract' : 'ID'}:{ tokenId.match(/^T/) ? tokenId.substr(0, 7) + '...' + tokenId.substr(-7) : tokenId}
                                            </div>
                                        </div>
                                        <Switch color='#636ACC' checked={!isLocked} onClick={(e) => {
                                            const field = tokenId.match(/^T/) ? 'smart' : 'basic';
                                            if( balance > 0 ) {
                                                selected.tokens[ field ][ tokenId ].isLocked = !isLocked;
                                                if(filterTokens.length){
                                                    const fs = filterTokens.map(({ tokenId: id, ...token }) => {
                                                        if(id === tokenId) {
                                                            token.isList = isLocked;
                                                        }
                                                        return { tokenId: id, ...token };
                                                    });
                                                    this.setState({ filterTokens: fs });
                                                }
                                            } else {
                                                this.setState({ deleteToken: { show: true, tokenId } });
                                            }
                                            PopupAPI.updateTokens(selected.tokens);
                                        }} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(AssetManageController);
