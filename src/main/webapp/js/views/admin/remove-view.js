define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'text!templates/admin/admin-removeform.html',
	'jqueryUI',
	'slimscroll',
	'apicomm',
], function(namespace, $, _, Backbone, removeTemplate){
	var app = namespace.app;
	var apicomm = null
	var removeView = Backbone.View.extend({
		
		initialize: function(){
			apicomm = new ProtoApiCommunicator(function(error){
				console.log(error);
			});
		},

		events: {
			"click #remove-button": "removeButton",
		},

		removeButton: function() {
			apicomm.deleteSong(this.song.id, this.success, this.error);
			return false;
		},

		success: function(data){
			var message = $('#message', this.$el);
			switch (data){
				case ProtoApiCommunicator.DELETE_SUCCESS:
					message.html("The song was successfully removed");
					break;
				case ProtoApiCommunicator.DELETE_FAILURE:
					message.html("The song couldn't be removed");
			}
			app.trigger("refreshList");
		},
		error: function(error){
			console.log("error" + error);

		},
		
		
		render: function(data) {
			//Set the element of out view object, 
			//so the events can be delegated after rendition
			this.setElement('#details');
			//Make selected song available from all functions
			this.song = data;
			//Compile template
			var compiledTemplate = _.template(removeTemplate, data);
			//Hide previous details
			this.$el.hide();
			//Add new details to view
			this.$el.html(compiledTemplate);
			//Re-connect all button events			
			this.delegateEvents();
			//Make a nice fade of new details
			this.$el.fadeIn(300);
			
			return this;
		}
		
	});
	
	return new removeView;
	
});
