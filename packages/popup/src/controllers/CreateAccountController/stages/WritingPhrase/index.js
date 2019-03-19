import React from 'react';
import Button from '@tronlink/popup/src/components/Button';

import { FormattedMessage } from 'react-intl';
// import { BUTTON_TYPE } from '@tronlink/lib/constants';

import './WritingPhrase.scss';

const WritingPhrase = props => {
    const {
        mnemonic,
        onSubmit,
        onCancel
    } = props;

    return (
        <div className='insetContainer writingPhrase'>
            <div className='pageHeader'>
                <div className="back" onClick={ onCancel }></div>
                <FormattedMessage id='CREATION.CREATE.TITLE' />
            </div>
            <div className='greyModal'>
                <div className='modalDesc'>
                    <FormattedMessage id='WRITING_PHRASE' />
                </div>
                <div className='wordList'>
                    { mnemonic.split(' ').map((word, index) => (
                        <div className='word' key={ index }>
                            { word.trim() }
                        </div>
                    )) }
                </div>
                <div className='buttonRow'>
                    {/*<Button*/}
                        {/*id='BUTTON.GO_BACK'*/}
                        {/*type={ BUTTON_TYPE.DANGER }*/}
                        {/*onClick={ onCancel }*/}
                        {/*tabIndex={ 2 }*/}
                    {/*/>*/}
                    <Button
                        id='BUTTON.CONTINUE'
                        onClick={ () => onSubmit() }
                        tabIndex={ 1 }
                    />
                </div>
            </div>
        </div>
    );
};

export default WritingPhrase;
