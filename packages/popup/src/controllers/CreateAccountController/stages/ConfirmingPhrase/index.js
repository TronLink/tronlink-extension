import React from 'react';
import Button from 'components/Button';

import { FormattedMessage } from 'react-intl';
import { BUTTON_TYPE } from '@tronlink/lib/constants';

import './ConfirmingPhrase.scss';

class ConfirmingPhrase extends React.Component {
    state = {
        correctOrder: [],
        selected: [],
        words: [],
        isValid: false
    };

    onClick(wordIndex) {
        const {
            correctOrder,
            selected
        } = this.state;

        if(selected.includes(wordIndex))
            return;

        const nextIndex = selected.length;

        if(correctOrder[ nextIndex ] !== wordIndex)
            return;

        selected.push(wordIndex);

        this.setState({
            isValid: nextIndex === 11,
            selected
        });

        // Show cross/check animation
        // -> use lottie.play or whatever
    }

    componentDidMount() {
        const { mnemonic } = this.props;
        const words = mnemonic.split(' ');

        this.setState({
            correctOrder: words.map((_, index) => index),
            words: words.map((word, index) => ({
                word,
                index
            })).sort(() => Math.random() - 0.5)
        });
    }

    renderOptions() {
        const {
            words,
            selected
        } = this.state;

        return (
            <div className='options'>
                { words.map(({ word, index }) => (
                    <div
                        className={ `word ${ selected.includes(index) ? 'correct' : '' }` }
                        onClick={ () => this.onClick(index) }
                        key={ index }
                    >
                        { word }
                    </div>
                ))}
            </div>
        );
    }

    render() {
        const {
            onSubmit,
            onCancel
        } = this.props;

        const { isValid } = this.state;

        return (
            <div className='insetContainer confirmingPhrase'>
                <div className='pageHeader'>
                    TronLink
                </div>
                <div className='greyModal'>
                    <div className='modalDesc'>
                        <FormattedMessage id='CONFIRMING_PHRASE' />
                    </div>
                    { this.renderOptions() }
                    <div className='buttonRow'>
                        <Button
                            id='BUTTON.GO_BACK'
                            type={ BUTTON_TYPE.DANGER }
                            onClick={ onCancel }
                            tabIndex={ 2 }
                        />
                        <Button
                            id='BUTTON.CONFIRM'
                            isValid={ isValid }
                            onClick={ () => isValid && onSubmit() }
                            tabIndex={ 1 }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfirmingPhrase;