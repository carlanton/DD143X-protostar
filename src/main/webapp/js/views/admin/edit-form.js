define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'text!templates/admin/admin-editform.html',
	'jqueryUI',
	'slimscroll',
	'apicomm',
	'form',
], function(namespace, $, _, Backbone, editTemplate){
	var app = namespace.app;
	var that = null;
	var editView = Backbone.View.extend({
		
		initialize: function(){
		},

		events: {
		},
		
		
		render: function(data) {
			that = this;
			//Set the element of out view object, 
			//so the events can be delegated after rendition
			this.setElement('#details');
			//Make selected song available from all functions
			this.song = data;
			//Compile template
			var compiledTemplate = _.template(editTemplate, data);
			//Hide previous details
			this.$el.hide();
			//Add new details to view
			this.$el.html(compiledTemplate);
			//Re-connect all button events
			this.delegateEvents();
			//Make a nice fade of new details
			this.$el.fadeIn(300);
			
			$('#editForm', this.$el).ajaxForm({
				type: 'POST',
				url: ProtoApiCommunicator.BASE_URL + 'admin/song/' + data.id,
				success: that.success,
				error: that.error, 
				dataType: "json"
			});
			
			return this;
		},

		success: function(data){
			$('#message', this.$el).html("The song was successfully edited");
			app.trigger("refreshList");
		},

		error: function(error){
			$('#message', this.$el).html("The song couldn't be edited");
			console.log(error);
		}
	});
	
	return new editView;
	
});
