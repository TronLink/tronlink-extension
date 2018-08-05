import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';

import Button from 'components/Button';
import axios from 'axios';
import Swal from 'sweetalert2';

import './Give.css';

class Give extends Component {
    async fund(){
        axios.get(
            'https://us-central1-flottpay.cloudfunctions.net/testCoins?address=' + this.props.account.address
        ).then(() => {
            return Swal({
                title: 'Funds sent',
                type: 'success',
                text: 'You have been sent 20k testnet TRX'
            });
        }).catch(() => {
            return Swal({
                title: 'Failed to send funds',
                type: 'error'
            });
        }).then(() => {
            this.props.history.push('/main/transactions');
        });
    }

    render() {
        return (
            <div className="give">
                <div className="giveContainer">
                    <div className="giveHeader">TestNet Funding :</div>
                    <div className="giveSubHeader">Sends 20,000 Testnet TRX to your currently selected wallet address.</div>
                    <div className="giveSubHeader">Address: { this.props.account.address }</div>
                </div>
                
                <Button onClick={ () => this.fund() } type={ 'black' } style={{ margin: '30px 0' }}>
                    Fund Account
                </Button>
            </div>
        );
    }
}


export default withRouter(
    connect(state => ({ 
        account: 
        state.wallet.account 
    }))(Give)
);
