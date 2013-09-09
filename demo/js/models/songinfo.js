define([
	'underscore',
	'backbone',
], function(_, Backbone) {
		
	var SongInfo = Backbone.Model.extend({
		
		defaults: {
			id: 0,
			title: 'Unknown',
			artist: 'Unknown',
		},
		
		url: function() {
		    // Important! It's got to know where to send its REST calls.
		    // In this case, POST to '/donuts' and PUT to '/donuts/:id'
		    return this.id ? '/songs/' + this.id : '/songs';
		},
		
		initialize: function() {
			
		},
			
		change: function(e) {
			
		},
	});
		
	return SongInfo;
});
