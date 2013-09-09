define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/error/modal.html',
	//We need this
	'reveal',
], function(namespace, $, _, Backbone, modalTemplate){
	var app = namespace.app;
	var modalView = Backbone.View.extend({
	
		el: '#page',
	
		initialize: function() {
		},
	
		render: function(data, callback) {
			var modal;

			//Create modal from template
			modal = $(_.template(modalTemplate, data));


			//Append it to body
			$('body').append(modal);
			
			$('.errorModalButton').bind('click', callback);

			//Show it
			modal.reveal({
				animation: 'fadeAndPop',
				animationspeed: 300,   
				closeonbackgroundclick: false,
				dismissmodalclass: 'errorModalButton'
			});
			
			//If page is access directly
			if($('.pre-loading', this.$el).length > 0) {
				app.router.navigate('/', { trigger: true });
			}
		}
	});

	return new modalView;
});
