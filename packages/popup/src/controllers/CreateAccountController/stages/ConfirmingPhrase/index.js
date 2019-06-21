import React from 'react';
import Button from '@tronlink/popup/src/components/Button';
import Toast, { T } from 'react-toast-mobile';
import { FormattedMessage, injectIntl } from 'react-intl';

import './ConfirmingPhrase.scss';

class ConfirmingPhrase extends React.Component {
    state = {
        correctOrder: [],
        selected: [],
        words: [],
        isValid: false,
        loading: false
    };

    onClick(wordIndex, word) {
        const {
            // correctOrder,
            selected
        } = this.state;

        // if(selected.includes(wordIndex))
        //     return;

        const nextIndex = selected.length;

        // if(correctOrder[ nextIndex ] !== wordIndex)
        //     return;
        if(selected.map((v)=>v.wordIndex).includes(wordIndex)){
            selected.splice(selected.map((v)=>v.word).indexOf(word),1);
        }else{
            selected.push({wordIndex,word});
        }
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
                        className={ `word ${ selected.map(v=>v.wordIndex).includes(index) ? 'correct' : '' }` }
                        onClick={ () => this.onClick(index,word) }
                        key={ index }
                    >
                        { word }
                    </div>
                ))}
            </div>
        );
    }

    async onSubmit(selected, correctOrder) {
        const { formatMessage } = this.props.intl;
        const { onSubmit } = this.props;
        const selected2 = selected.map(v=>v.wordIndex);
        for(let v of correctOrder) {
            if(v !== selected2[ v ]) {
                T.notify(formatMessage({ id: 'CREATION.CREATE.CONFIRM.MNEMONIC.DIALOG' }));
                return;
            }
        }
        this.setState({ loading: true });
        await onSubmit();
        this.setState({ loading: false });

    }

    render() {
        const {
            onCancel
        } = this.props;

        const { isValid, selected, correctOrder,loading } = this.state;

        return (
            <div className='insetContainer confirmingPhrase'>
                <div className='pageHeader'>
                    <div className="back" onClick={ onCancel }></div>
                    <FormattedMessage id='CREATION.CREATE.CONFIRM.MNEMONIC.TITLE' />
                </div>
                <div className='greyModal'>
                    <Toast />
                    <div className='modalDesc'>
                        <FormattedMessage id='CONFIRMING_PHRASE' />
                    </div>
                    <div className="wordList">
                        {
                            selected.map(v=><div className="word">{v.word}</div>)
                        }
                    </div>
                    { this.renderOptions() }
                    <div className='buttonRow'>
                        <Button
                            isLoading={ loading }
                            id='BUTTON.CONFIRM'
                            isValid={ isValid }
                            onClick={ () => isValid && this.onSubmit(selected,correctOrder) }
                            tabIndex={ 1 }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(ConfirmingPhrase);
