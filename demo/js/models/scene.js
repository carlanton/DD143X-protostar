define([
	'backbone'
], function(Backbone) {
	/**
		Representens a Scene which is a set of Syllables that should be
		displayed together in the game
		@author Andreas Gabrielsson
		@author Viktor Collin
	*/
	var Scene = Backbone.Model.extend({
		defaults: {
			// The beat to show this Scene
			showScene: null,
			
			// The beat to hide this scene, might be null then hide when show next*/
			hideScene: null,
			
			// The array of syllables
			syllables: null,

			// Next scene
			nextScene: null
		},

		initialize: function() {
			this.set('syllables', new Backbone.Collection);
		},

		/**
			Adds a syllable at the end of this scene
			@param {Syllable} syllable The Syllable to add
		*/
		addSyllable: function(syllable) {
			this.get('syllables').add(syllable);
		}
	});

	return Scene;
});
