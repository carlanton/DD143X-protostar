define([
	'underscore',
	'backbone'
], function(_, Backbone) {
		
	var GameResult = Backbone.Model.extend({

		defaults: {
			id: -1,
			songid: -1,
			nickname: 'Unknown',
			result: -1,
			rank: -1,
		},

		url: 'api/url/here',

		initialize: function() {
		},
			
		change: function() {
			console.log('Changed '+this.get('title'));
		}

	});
		
	return GameResult;
});
