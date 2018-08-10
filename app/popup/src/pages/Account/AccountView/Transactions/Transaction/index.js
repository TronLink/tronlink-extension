import React, { Component } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import {
	TopRightArrow,
	TokensIcon,
	SnowIcon,
	PencilIcon,
	VoteIcon
} from 'components/Icons';

import Utils from 'extension/utils.js';

import './Transaction.css';

class Transaction extends Component {
	formattedDate() {
        const date = new Date(this.props.date);
        
		return date.toLocaleDateString('en-us', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	renderIcon() {
        switch(this.props.txType) {
            case 'TransferContract':
            case 'TransferAssetContract':
                if(this.props.outgoing === false)
                    return <TopRightArrow className="iconReceived" />;
                return <TopRightArrow className="iconSent" />;

            case 'ParticipateAssetIssueContract':            
                return <TokensIcon className="iconToken" />;

            case 'VoteWitnessContract':
                return <VoteIcon className="iconToken" />;

            case 'AssetIssueContract':
                return <PencilIcon className="iconToken" />;

            case 'FreezeBalanceContract':
            case 'UnfreezeBalanceContract':
                return <SnowIcon className="iconFreeze" />;

            default:
                return null;
        }
	}

	renderLabel() {
        switch(this.props.txType) {
            case 'TransferContract':
            case 'TransferAssetContract':
                if(!!this.props.outgoing)
                    return <div className="txLabel red"><FormattedMessage id='words.sent' /></div>;

                return <div className="txLabel green"><FormattedMessage id='words.received' /></div>;

            case 'ParticipateAssetIssueContract':
                return <div className="txLabel"><FormattedMessage id='words.token' /></div>;

            case 'VoteWitnessContract':
                return <div className="txLabel"><FormattedMessage id='words.vote' /></div>;

            case 'AssetIssueContract':
                return <div className="txLabel"><FormattedMessage id='account.transactions.tokenCreation' /></div>;

            case 'FreezeBalanceContract':
                return <div className="txLabel red"><FormattedMessage id='words.frozen' /></div>;

            case 'UnfreezeBalanceContract':
                return <div className="txLabel green"><FormattedMessage id='words.unfrozen' /></div>;

            default:
                return null;
        }
	}

	renderAddress() {
        return (
            <div className="txAddress">
                { !!this.props.outgoing ? this.props.toAddress : this.props.ownerAddress }
            </div>
        );
	}

	renderAmount() {
        const outgoing = !!this.props.outgoing;
        const amount = Utils.sunToTron(this.props.amount).toString();

        return (
            <div className={ 'txAmount ' + (outgoing ? 'red' : 'green') }>
                { outgoing ? '- ' : '+ ' }
                <FormattedNumber value={ amount } minimumFractionDigits={ 0 } maximumFractionDigits={ 8 } /> 
                <span class='margin-left'>TRX</span>
            </div>
        );
	}

	render() {
		return (
			<div className="transaction">
                { this.renderIcon() }
                
				<div className="txInfoLeft">
					{ this.renderLabel() }
					{ this.renderAddress() }
				</div>

				<div className="txInfoRight">
                    { this.renderAmount() }
                    
                    <div className="txDate">
                        { this.formattedDate() }
                    </div>
				</div>
			</div>
		);
	}
}

export default Transaction;
