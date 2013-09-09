define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/intro/intro-main.html',
], function(namespace, $, _, Backbone, introMainTemplate) {

	var app = namespace.app;
	
	var mainHomeView = Backbone.View.extend({
		
		el: '#page',
		
		render: function() {
			this.$el.html(introMainTemplate);
		},
		
		initialize: function () {
		},
	
		events: {
			"click #play":  "playButton",
			"click #tutorial": "tutorialButton",
		},
		
		playButton: function() {
			app.router.navigate('songs', { trigger:true });
			return false;
		},
		
		adminButton: function() {
			$.ajax({
				url: '/api/admin',
				success: function() {
					app.router.navigate('/admin', true);
				}
			});
			return false;
		},

		tutorialButton: function() {
			app.router.navigate('/tutorial/1', true);
			return false;
		}
	});
	return new mainHomeView;
});
