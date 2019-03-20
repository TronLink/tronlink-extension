import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toast,{ T } from 'react-toast-mobile';
import { PAGES } from '@tronlink/lib/constants';
import { app } from '@tronlink/popup/src/index';
import {PopupAPI} from "@tronlink/lib/api";
import {APP_STATE} from "@tronlink/lib/constants";
const PageLink = props => {
    const {
        active = false,
        page,
        changePage
    } = props;

    const pageKey = `PAGES.${ page }`;
    const pageIndex = PAGES[ page ];

    return (
        <FormattedMessage
            id={ pageKey }
            children={ text => (
                <div
                    className={ `pageLink ${ active ? 'active' : '' }` }
                    onClick={ () => !active && changePage(pageIndex) }
                >
                    { text }
                </div>
            ) }
        />
    );
};

class Header extends React.Component {
    constructor(props){
        super(props);
        this.onNodeChange = this.onNodeChange.bind(this);
        this.state={
            nodeIndex:0,
            //showNodeList:false,
            refresh:false
        }
    }
    componentDidMount(){
        const {nodes} = this.props;
        const ns = Object.entries(nodes.nodes);
        const nodeIndex = ns.map(([nodeId,obj],i)=>{obj.index = i;return [nodeId,obj]}).filter(([nodeId,obj]) => nodeId === nodes.selected)[0][1].index;
        this.setState({nodeIndex});
    }
    onNodeChange(nodeId,index) {
        PopupAPI.selectNode(nodeId);
        app.getNodes();
        this.setState({nodeIndex:index,showNodeList:!this.state.showNodeList});
    }
    render() {
        const colorArr = ['#B8E986','#F5A623','#F8E71C'];
        const { nodeIndex,refresh } = this.state;
        const {
            nodes,showNodeList
        } = this.props;
        const ns = Object.entries(nodes.nodes);
        const name = ns.filter(v => v[0] === nodes.selected)[0][1].name;

        return (
            <div className='header'>
                <Toast />
                <div className='titleContainer'>
                    <div>
                        <a href="https://twitter.com/TronLinkWallet" target="_blank" className="link link-twiter"></a>
                        <a href="https://t.me/TronLink" target="_blank" className="link link-telegram"></a>
                    </div>
                    {/*<div className="nodesWrap">*/}
                        {/*<div className="nodes" onClick={ (e)=>{ e.stopPropagation();this.props.handleShowNodeList()} }>*/}
                            {/*<span className="dot" style={{backgroundColor:colorArr[nodeIndex%3]}}></span>*/}
                            {/*<div className="name">{name}</div>*/}
                            {/*<div className="dropList" style={showNodeList?{width:'100%',height:30*ns.length,opacity:1}:{}}>*/}
                                {/*{*/}
                                    {/*ns.map(([nodeId,obj],i)=> <div onClick={()=>{ this.onNodeChange(nodeId,i) }} className="item" key={nodeId}><span className="dot" style={{backgroundColor:colorArr[i]}}></span><span>{obj.name}</span></div>)*/}
                                {/*}*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                    <div>
                        <div className="fun" onClick={()=>{window.open('https://trx.market')}}></div>
                        <div className="fun" onClick={()=>{
                            if(!refresh){
                                this.setState({refresh:true}, async()=>{
                                    T.loading();
                                    const r = await PopupAPI.refresh();
                                    if(r){
                                        this.setState({refresh:false});
                                        T.loaded()
                                    }
                                });
                            }

                        }}
                        ></div>
                        <div className="fun" onClick={ ()=>{ PopupAPI.changeState(APP_STATE.SETTING) } }></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Header;
