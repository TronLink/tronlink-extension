import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PAGES } from '@tronlink/lib/constants';
import { connect } from 'react-redux';
import { app } from '@tronlink/popup/src/index';
import './Header.scss';
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
            showNodeList:false,
            refresh:false
        }
    }
    onNodeChange(nodeId,index) {
        PopupAPI.selectNode(nodeId);
        app.getNodes();
        this.setState({nodeIndex:index,showNodeList:!this.state.showNodeList});
    }
    render() {
        const colorArr = ['#B8E986','#F5A623','#F8E71C'];
        const { nodeIndex,showNodeList,refresh } = this.state;
        const {
            nodes,
            title,
            currentPage,
            changePage,
            selectedAccount
        } = this.props;
        const ns = Object.entries(nodes.nodes);
        const name = ns.filter(v => v[0] === nodes.selected)[0][1].name;
        const pages = Object.keys(PAGES);

        return (
            <div className='header'>
                <div className='titleContainer'>
                    <div className={"fun"+(refresh?" refresh":"")} onClick={ ()=>{
                        this.setState({refresh:true});
                        if(!refresh)PopupAPI.refresh();
                        setTimeout(()=>{console.log('************');this.setState({refresh:false})},3000);
                    }}
                    ></div>
                    <div className="nodesWrap">
                        <div className="nodes" onClick={ ()=>{this.setState({showNodeList:!showNodeList})} }>
                            <span className="dot" style={{backgroundColor:colorArr[nodeIndex]}}></span>
                            <div className="name">{name}</div>
                            <div className="dropList" style={showNodeList?{width:'100%',height:30*ns.length,opacity:1}:{}}>
                                {
                                    ns.map(([nodeId,obj],i)=> <div onClick={()=>{ this.onNodeChange(nodeId,i) }} className="item" key={nodeId}><span className="dot" style={{backgroundColor:colorArr[i]}}></span><span>{obj.name}</span></div>)
                                }
                            </div>
                        </div>
                    </div>
                    <div className="fun" onClick={ ()=>{ PopupAPI.changeState(APP_STATE.SETTING) } }></div>
                </div>
                {/*<div className='pageLinks'>*/}
                    {/*{ pages.map(( pageKey, index) => (*/}
                        {/*<PageLink*/}
                            {/*page={ pageKey }*/}
                            {/*changePage={ changePage }*/}
                            {/*active={ currentPage === index }*/}
                            {/*key={ pageKey }*/}
                        {/*/>*/}
                    {/*)) }*/}
                {/*</div>*/}
            </div>
        );
    }
}

export default connect(state => ({
    selectedAccount: state.accounts.selected.name,
    nodes:state.app.nodes
}))(Header);
