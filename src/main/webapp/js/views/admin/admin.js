define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/admin/admin-main.html',
], function(namespace, $, _, Backbone, adminMainTemplate) {

	var app = namespace.app;
	
	var mainAdminView = Backbone.View.extend({
		
		el: '#page',
		
		render: function(){
			this.$el.html(adminMainTemplate);
		},
		
		initialize: function () {

		},
	
		events: {
			"click #back":  "backButton",
			"click #upload": "uploadButton",
			"click #remove": "removeButton",
			"click #edit": "editButton",
		},
		
		backButton: function() {
			app.router.navigate('', true);
			return false;
		},
		uploadButton: function(){
			app.router.navigate('/admin/upload', true);
			return false;
		},
		removeButton: function(){
			app.router.navigate('/admin/remove', true);
			return false;
		},
		editButton: function(){
			app.router.navigate('/admin/edit', true);
			return false;
		},
	});
	return new mainAdminView;
});
