define([
	'backbone'
], function(Backbone) {
	/**
		This class represents a syllable from the udx format.

		@author Andreas Gabrielsson
		@author Viktor Collin
	*/
	var Syllable = Backbone.Model.extend({
		defaults: {
			type: null,
			startBeat: null,
			beats: null,
			tone: null,
			text: null
		}
	});

	return Syllable;
});
