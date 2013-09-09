define([
	'namespace',
	'backbone',
	'views/error/modal'
], function(namespace, Backbone, errorView) {
	var app = namespace.app;

	var ErrorHandler = Backbone.Model.extend({
		defaults: {
			notifications: []
		},

		initialize: function() {
			console.log('[ERRORHANDLER] Ready!');
		},

		handleFatal: function(cause) {
			console.log('[ERRORHANDLER] Fatal: ' + cause);

			app.trigger('SHUT_DOWN_EVERYTHING');

			errorView.render({
				title: 'An error occured',
				text: cause,
				button: 'Try again'
			}, function() {
				window.location = '.';	
			});
		},

		addNotification: function(message) {
			if (this.get("notifications").indexOf(message) != -1)
				return;
			this.get("notifications").push(message);
			this.renderNotifications();
		},

		delNotification: function(message) {
			var notifications = [];
			for (var note in this.get("notifications")) {
				if (this.get("notifications")[note] !== message)
					notifications.push(this.get("notifications")[note]);
			}
			this.set("notifications", notifications);
			this.renderNotifications();
		},

		renderNotifications: function() {
			var str = "";
			for (var note in this.get("notifications")) {
				str = this.get("notifications")[note] + "<br />" + str;
			}
			
			var $container = $("#notification");
			$container.removeClass('warning');
			if(str.match('sync')) {
				$container.addClass('warning');
				$container.html(str);
			} else {
				$container.html(str);
			}
		},

		handle: function(data, callback) {
			if (data['button'] == undefined)
				data['button'] = 'OK';

			if (callback == undefined)
				callback = function() {};
			
			errorView.render(data, callback);
		}
	});

	return new ErrorHandler;
});
