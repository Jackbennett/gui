import React from 'react';
var createReactClass = require('create-react-class');

// material ui
import { List, ListItem } from 'material-ui/List';

var listItems = [
  {route:"/", text:"Dashboard"},
  {route:"/devices", text:"Devices"},
  {route:"/artifacts", text:"Artifacts"},
  {route:"/deployments", text:"Deployments"},
];

var LeftNav = createReactClass({
	getInitialState() {
		return {
			currentTab: this.props.currentTab
		};
	},

	_changeTab: function(route) {
		this.props.changeTab(route);
	},

	render: function() {
		var self = this;
	
    var list = listItems.map(function(item, index) {
    	var borderTop = index===0 ? "none !important" : "1px solid #eaf4f3"; 
      var style = self.props.currentTab===item.route ? {backgroundColor: "#ffffff", marginRight: "-2px", borderTop: borderTop, borderBottom: "1px solid #eaf4f3", transition: "all 100ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"} : {transition: "all 100ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",  color:"#949495"};
    
       return (
          <ListItem
            key={index}
            style={style}
            primaryText={item.text}
            onClick={self._changeTab.bind(null, item.route)}
            innerDivStyle={{padding:"22px 16px 22px 42px", fontSize:"14px", textTransform: "uppercase"}} />
       )
    });

    var helpStyle = self.props.currentTab==="/help" ? {transition: "all 100ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"} : {transition: "all 100ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",  color:"#949495"};

		return (
			<div>
				<List style={{padding:"0"}}>
        	{list}
      	</List>


      	<List style={{padding:"0", position: "absolute", bottom: "30px", left:"0px", right: "0px"}}>
      		<ListItem
      			style={helpStyle}
            primaryText="Help"
            onClick={self._changeTab.bind(null, "/help")}
            innerDivStyle={{padding:"16px 16px 16px 42px", fontSize:"14px"}} />
            <ListItem
            className={this.props.version ? "" : "hidden"}
            style={{color: "#c7c7c7"}}
            primaryText={"Version: " + this.props.version}
            disabled={true}
            innerDivStyle={{padding:"16px 16px 16px 42px", fontSize:"14px"}} />
        </List>
			</div>
		)
	}
});

module.exports = LeftNav;