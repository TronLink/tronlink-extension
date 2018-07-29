import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import './Give.css';
import axios from 'axios';

class Give extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    async fund(){
        axios.get('https://us-central1-flottpay.cloudfunctions.net/testCoins?address=' + this.props.account.address).then(x => x.data);
        alert("Sent 20k testnet coins. They can take a minute to show up.");
        this.props.history.push('/main/transactions');
    }

    render() {
        return (
            <div className="give">
                <div className="giveContainer">
                    <div className="giveHeader">TestNet Funding :</div>
                    <div className="giveSubHeader">Sends 20,000 Testnet TRX to your currently selected wallet address.</div>
                    <div className="giveSubHeader">Address: { this.props.account.address }</div>
                </div>
                <div className="giveBtn button black" onClick={this.fund.bind(this)}>Fund Account</div>
            </div>
        );
    }
}


export default withRouter(
    connect(
        state => ({ account : state.wallet.account }),
    )(Give)
);
