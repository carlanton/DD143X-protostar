define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Views
	'views/intro/intro-main',
	//Templates
	'text!templates/common/modal.html',
	//We need this
	'reveal',
], function(namespace, $, _, Backbone, introMainView, modalTemplate){
	var app = namespace.app;
	var modalView = Backbone.View.extend({
	
		el: '#page',
	
		initialize: function() {
		},
	
		render: function(data){
			var modal;
			//Create modal from template
			modal = $(_.template(modalTemplate, data));
			//Append it to body
			$('body').append(modal);
			//Show it
			modal.reveal();
			
			//If page is access directly
			if($('.pre-loading', this.$el).length > 0) {
				app.router.navigate('/', { trigger: true });
			}
		}
	
	});
	return new modalView;
});
