define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'songinfo',
	'apicomm'
], 
/** 
 A collection of songs
 @exports collections/song
 */
function(namespace, $, _, Backbone, SongInfo) {
	
	var api;
	var that;
	var app = namespace.app;
	
	var SongInfoCollection = Backbone.Collection.extend(
		
		/** @lends SongCollection.prototype */
		{
		/**
		 * @class SongCollection class description
		 *
		 * @augments Backbone.Collection
		 * @constructs
		 *
		 * Initialize method for SongCollection
		 */
		initialize: function() {
			that = this;	
			api = new ProtoApiCommunicator(function(x) {
				console.log(x);
			});
		},

		appendCollection: function(offset, numSongs, q){
			api.getSongs(offset, numSongs, q, this.addSongs, this.error);
		},
		
		
		error: function (error){

		},
		
		addSongs: function(songs){
			_.each(songs, function(song) {
				that.add(new SongInfo(song));
			});
			app.trigger("songsLoaded");
		},
		
		
		
		//Fetch all songs
		url: null,
		model: SongInfo,
		
		//When sorting, sort on artist
		comparator: function(song) {
			return song.get("artist");
		}
	});
	return new SongInfoCollection;
});
