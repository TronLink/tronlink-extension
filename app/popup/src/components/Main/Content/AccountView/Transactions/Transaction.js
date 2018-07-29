import React, { Component } from 'react';
import './Transaction.css';

import { TopRightArrow, TokensIcon, SnowIcon, PencilIcon, VoteIcon } from "../../../../../Icons";

import Utils from '../../../../../extension/utils.js';

class Transaction extends Component {

    formattedDate() {
        const date = new Date(this.props.date);
        return date.toLocaleDateString("en-us", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    chooseIcon() {
        if (this.props.txType === "TransferContract" || this.props.txType === "TransferAssetContract") {
            if (this.props.outgoing === false) {
                return (
                    <TopRightArrow className="iconReceived" />
                );
            }
            return (
                <TopRightArrow className="iconSent" />
            );
        }
        if (this.props.txType === "ParticipateAssetIssueContract") {
            return (
                <TokensIcon className="iconToken" />
            );
        }
        if (this.props.txType === "FreezeBalanceContract" || this.props.txType === "UnfreezeBalanceContract") {
            return (
                <SnowIcon className="iconFreeze" />
            );
        }
        if (this.props.txType === "AssetIssueContract") {
            return (
                <PencilIcon className="iconToken" />
            );
        }
        if (this.props.txType === "VoteWitnessContract") {
            return (
                <VoteIcon className="iconToken" />
            );
        }
    }

    chooseLabel() {
        if (this.props.txType === "TransferContract" || this.props.txType === "TransferAssetContract") {
            if (this.props.outgoing === false) {
                return (
                    <div className="txLabel green">Received</div>
                );
            }
            return (
                <div className="txLabel red">Sent</div>
            );
        }
        if (this.props.txType === "ParticipateAssetIssueContract") {
            return (
                <div className="txLabel">Token</div>
            );
        }
        if (this.props.txType === "FreezeBalanceContract" || this.props.txType === "UnfreezeBalanceContract") {
            return (
                <div className="txLabel">Frozen</div>
            );
        }
        if (this.props.txType === "AssetIssueContract") {
            return (
                <div className="txLabel">Token Creation</div>
            );
        }
        if (this.props.txType === "VoteWitnessContract") {
            return (
                <div className="txLabel">Vote</div>
            );
        }
    }

    chooseAddress() {
        if (this.props.outgoing === false) {
            return <div className="txAddress">{ this.props.ownerAddress }</div>;
        }
        return <div className="txAddress">{ this.props.toAddress }</div>;
    }

    chooseAmount() {
        if (this.props.outgoing === false) {
            return <div className="txAmount green">+ { Utils.sunToTron(this.props.amount).toString() }<span>TRX</span></div>;
        }
        return <div className="txAmount red">- { Utils.sunToTron(this.props.amount).toString() }<span>TRX</span></div>;
    }

    successCheck() {
        // Failed, Success, Rejected
        if (true) return;
    }

    copyButton() {
        if (false) {
            return <div className="copyButton btn">Copy</div>;
        }
    }

    openLink = () => window.open('https://tronscan.org/#/transaction/' + this.props.txID);

    render() {
        return (
            <div className="transaction">
                { this.chooseIcon() }
                <div className="txInfoLeft">
                    { this.chooseLabel() }
                    { this.chooseAddress() }
                </div>
                <div className="txInfoRight">
                    { this.chooseAmount() }
                    <div className="txDate">{ this.formattedDate() }</div>
                </div>
                { this.copyButton() }
            </div>
        );
    }
}

export default Transaction;
