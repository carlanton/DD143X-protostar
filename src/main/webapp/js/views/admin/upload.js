define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	//Templates
	'text!templates/admin/admin-upload.html',
	'form',
	'apicomm'
], function(namespace, $, _, Backbone, adminUploadTemplate) {

	var app = namespace.app;
	var that = null;
	
	var uploadView = Backbone.View.extend({
		
		el: "#page",
		
		render: function(){
			that = this;
			this.$el.html(adminUploadTemplate);
			$('#uploadForm').ajaxForm({
				url: ProtoApiCommunicator.BASE_URL + "admin/song",
				type: "POST",
				dataType: "json",
				success: that.success,
				error: that.error
			});
		},
		
		initialize: function () {
		},
		success: function(data){
			$('#message', this.$el).html("The song was successfully uploaded");
			app.trigger("refreshList");
		},
		error: function(error){
			$('#message', this.$el).html("The song couldn't be uploaded");
			console.log(error);
			message.html("The song couldn't be uploaded");
		},
	
		events: {
			"click #uploadBack":  "backButton",
		},
		
		backButton: function() {
			app.router.navigate('/admin', true);
			return false;
		},
	});
	return new uploadView;
});
