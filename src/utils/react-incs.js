
import React from 'react';
//import ReactDOM from 'react-dom';
var MessageStore = null;//require('./MessageStore');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			messages: MessageStore.getMessages()
		};
	},

	componentWillMount: function() {
		MessageStore.subscribe(this.updateMessages);
	},

	componentWillUnmount: function() {
		MessageStore.unsubscribe(this.updateMessages);
	},

	updateMessages: function() {
		this.setState({
			messages: MessageStore.getMessages()
		});
	},

	onSend: function(newMessage) {
		MessageStore.newMessage(newMessage);
	},

	render : function() {
		return (<div>Something something Dark Side</div>);
	}
});


/*
// MessageStore //
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();

var messages = [];

module.exports = {
	getMessages: function() {
		return messages.concat();
	},

	subscribe: function(callback) {
		emitter.addListener('update', callback);
	},

	unsubscribe: function(callback) {
		emitter.removeListener('update', callback);
	},

	newMessage: function(message) {
		messages.push(message);
		emitter.emit('update');
	}
};
*/

