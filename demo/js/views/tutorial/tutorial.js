define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/tutorial/tutorial.html',
], function(namespace, $, _, Backbone, tutorialTemplate) {

	var app = namespace.app;
	var step = 1;
	var first = 1;
	var last = 5;
	
	var tutorialView = Backbone.View.extend({
		
		el: '#page',
		
		render: function(stepNr){
			this.step = stepNr;
			data = {
				step: stepNr
			}
			var compiledTemplate = _.template(tutorialTemplate, data);
			$(this.el).html(compiledTemplate);
			if(stepNr != first){
				var style = 'float: right; margin-top: 20px; margin-right: ';
				var backButton = $('<button>', {
					'class':'button pink glossy',
					'id': 'tutorialBack',
					'text': 'Back',
					'style': style + ((stepNr != last) ? "20px" : "128px"),					
				});
				$('#buttons').prepend(backButton);
			}var nextButton
			if(stepNr != last){ 
				nextButton = $('<button>', {
					'class':'button pink glossy',
					'id': 'tutorialNext',
					'text': 'Next',
					'style': 'float: right; margin-top: 20px; margin-right: 20px;'
					
				});
				$('#buttons').prepend(nextButton);
			}
			
		},
		
		initialize: function () {

		},
	
		events: {
			"click #tutorialBack":  "backButton",
			"click #tutorialNext": "nextButton",
			"click #tutorialCancel": "cancelButton",
		},
		
		backButton: function() {
			this.step--;
			app.router.navigate('/tutorial/'+this.step, true);
			return false;
		},
		nextButton: function(){
			this.step++;
			app.router.navigate('/tutorial/'+this.step, true);
			return false;
		},
		cancelButton: function(){
			app.router.navigate('', true);
			return false;
		},
	});
	return new tutorialView;
});
