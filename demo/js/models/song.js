define([
	'backbone',
	'scene'
], function(Backbone, Scene) {
	/**
		A datastructure that represents a song, contains metadata about a song as specified below
		
		@constructor
		@author Andreas Gabrielsson
		@author Viktor Collin
	*/
	var Song = Backbone.Model.extend({
		defaults: {
			// The encoding of the txt-file - String
			encoding: null, // possible values CP1250, CP1252, UTF8, LOCALE, AUTO

			// The song title - String
			title: null,

			// The artist name - String
			artist: null,

			// The file name of the mp3-file - String
			mp3: null,

			// The number of beats per minute - number
			bpm: null,

			// The gap between start of the music until the first textline in ms - number
			gap: null,

			// The file name of the cover-file - String
			cover: null,

			// The file name of the background-file - String
			background: null,

			// The genre of the song - String
			genre: null,

			// The edition of the song - String
			edition: null,

			// The language of the song - String
			language: null,

			// Url to youtbe video - String
			videourl: null,

			// Same as gap but for the video - number
			videogap: null,

			// Offset in ms to be able to skip long intros - number
			start: null,
			
			// The collection of scenes
			scenes: null,
			
			//The maximum number of beats in a scene
			maxscenelength: -1,

			// Highest tone in song
			maxtone: -1,

			// Lowest tone in song
			mintone: 1024, // <- A big number!,

			bpmFactor: 1
		},

		initialize: function() {
			this.set('scenes', new Array());
		},

		/**
			Adds a new syllable after the existing ones
			@param {Scene} scene The scene to add
		*/
		addScene: function(scene){
			this.get('scenes').push(scene);

			var syllables = scene.get("syllables");
			
			// Check if we need to update max scene length
			var startBeat = syllables.at(0).get('startBeat');
			var lastSyllable = syllables.at(syllables.length-1);
			var sceneLength = parseInt(lastSyllable.get("startBeat")) + parseInt(lastSyllable.get("beats")) - startBeat;
			this.set('maxscenelength', Math.max(sceneLength, this.get("maxscenelength")));

			// Check if we need to update min or max tone
			var that = this;
			syllables.forEach(function(s){
				var t = parseInt(s.get('tone'));

				if (t > that.get('maxtone')) {
					that.set('maxtone', t);
				} else if (t < that.get('mintone')) {
					that.set('mintone', t);
				}
			});
		}
	});

	return Song;
});
