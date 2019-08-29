import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { PopupAPI } from '@tronlink/lib/api';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';
import CopyToClipboard from 'react-copy-to-clipboard';

import './NodeManageController.scss';

class NodeManageController extends React.Component {

    render() {
        const { nodes, chains, onCancel } = this.props;
        const { formatMessage } = this.props.intl;

        return (
            <div className='insetContainer nodeManage'>
                <div className='pageHeader'>
                    <div className='back' onClick={ () => onCancel() }>&nbsp;</div>
                    <FormattedMessage id='SETTING.TITLE.NODE_MANAGE' />
                    <div className="chains">
                        {chains.chains[chains.selected].name}
                    </div>
                </div>
                <div className='greyModal scroll'>
                    <div className='node'>
                        {
                            Object.entries(nodes.nodes).filter(([nodeId,node])=> node.chain === chains.selected).map(([nodeId,{name,fullNode,solidityNode,eventServer])=>{
                                return(
                                    <div className='item'>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default injectIntl(NodeManageController);
