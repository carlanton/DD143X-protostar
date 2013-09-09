define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/legal/legal.html',
], function(namespace, $, _, Backbone, legalTemplate) {

	var app = namespace.app;
	
	var legalView = Backbone.View.extend({
		
		el: '#page',
		
		render: function(terms){
			$(this.el).html(legalTemplate);
			$.get('../../templates/legal/'+terms+'.html', function(data){
				$('#terms').append(data);
			});
			
			
		},
		
		initialize: function () {

		},
	
		events: {
			"click #cancel": "cancelButton",
		},
		
		cancelButton: function(){
			window.history.go(-1);
			return false;
		},
	});
	return new legalView;
});
