define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'gameresult',
	'apicomm'
], function(namespace,$, _, Backbone, GameResult){
	var api;
	var app = namespace.app;
	var that;

	var GameResultCollection = Backbone.Collection.extend({


		initialize: function(){
			
			that = this;
			api = new ProtoApiCommunicator(function(error){
				console.log(error)
			});
		},
		//Fetch all songs
		url: '/songs',
		model: GameResult,
		appendCollection: function(songId, offset, numScores){
			api.getHighScore(songId, offset, numScores, that.addScores, that.error);
		},
		addScores: function(results){
			_.each(results, function(result){
				that.add(new GameResult(result));
			});
			app.trigger("resultsLoaded");
		},
		error: function(error){
			console.log(error);
		},
		
		
	});
	return new GameResultCollection;
});
