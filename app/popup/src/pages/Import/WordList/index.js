import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';
import { ArrowLeftIcon } from 'components/Icons';
import './WordList.css';

class WordList extends Component {
    state = {
        wordList: ''
    }

    handleChange({ target: { value: wordList }}) {
        this.setState({ wordList });
    }

    render() {
        return (
            <div className="import">
                <NavLink to="/main/import" className="importBackButton"><ArrowLeftIcon /></NavLink>
                <div className="importHeader">Import Word List</div>
                <div className="importText">Enter your 24 word backup phrase below.</div>
                <textarea
                    placeholder="Enter 24 word phrase..."
                    className="textAreaImport"
                    value={ this.state.privateKey }
                    onChange={ event => this.handleChange(event) }
                />
                <Button type={ 'black' } style={{ marginTop: '20px' }}>
                    <FormattedMessage id='import.button' />
                </Button>
            </div>
        );
    }
}

export default WordList;