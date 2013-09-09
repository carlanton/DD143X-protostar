/**
 * The jPlayerHandler object provides the necessary functionality
 * for the game client to use jPlayer as a GAME_MEDIA_PLAYBACK object.
 *
 * @constructor
 * @author Marcus Larsson (marcular@kth.se)
 * @param {string} mp3Url The URL to the MP3/OGG to be played back.
 * @param {function()} errorHandler Called on when an error has occured.
 */
define([
	'namespace',
	'underscore',
	'backbone',
	'jquery',
	'jplayer',
], function(namespace, _, Backbone, $) {

	var app = namespace.app;

	var JPlayerHandler = Backbone.Model.extend({

		/* Set the default values for this class. */
		defaults: {
			/* Offset in seconds to where playback is/should be. */
			position: 0,
			/* Playback status. */
			isPlaying: false
		},

		/* Instantiate the jPlayer object. */
		initialize: function() {
			/* Bind handlers to this object. */
			_.bindAll(this);
			this.log("Initializing JPlayer");

			/* Create the HTML div to "contain" jplayer and inject this in the body. */
			this.set("jp", document.createElement("div"));
			$('body').append(this.get("jp"));

			/* Store the MP3 URL given in the constructor. */
			var url = this.get('mp3Url');

			var start = this.get('start');
			this.set('position', start/1000);

			var errorHandler = this.get('errorHandler');

			app.bind('SHUT_DOWN_EVERYTHING', this.stop, this);

			/* Run the JPlayer constructor. */
			$(this.get("jp")).jPlayer({
				/*
				 * Define a function that will be called on as soon as
				 * the jPlayer object is ready.
				 */
				ready: function() {
					/* Set the URL for the MP3. */
					console.log("[JPLAYER] setting url = '" + url + "', with start offset = '" + start + "'");
					$(this).jPlayer("setMedia", { mp3: url });
					$(this).jPlayer("pause", start/1000);
				},

				/*
				 * Triggered when the browser estimates it can play the whole
				 * song without buffering.
				 */
				canplaythrough: function() {
					/* Trigger the ready event. */
					namespace.app.trigger("componentReadyEvent", "jplayer");
				},

				/*
				 * Triggered when playback is paused due to empty buffer.
				 */
				waiting: function() {
					errorHandler("Playback interrupted because buffer was empty.");
				},

				ended: this.triggerSongOver,

				/* Set callback for timeupdate so we can keep track of song progress. */
				timeupdate: this.updateTime,

				/* Use HTML5 only. */
				solution: "html",

				/* Our files are in either MP3 or OGA (OGG AUDIO) format. */
				supplied: "mp3, oga",

				/* Buffer the whole MP3 file. */
				preload: "auto"
			});
		},

		/**
		 * Set the mp3 URL
		 */
		setUrl: function(url) {
			/* Set the media source to the provided MP3 URL. */
			$(this).jPlayer("setMedia", { mp3: url });
		},

		/**
		 * Starts playback of the given MP3.
		 */
		play: function() {
			this.log("Playback started");
			$(this.get("jp")).jPlayer("play");
			this.set("isPlaying", true);
		},

		/**
		 * Stops/pauses playback.
		 */
		stop: function() {
			this.log("Playback stopped");
			this.set("isPlaying", false);
			$(this.get("jp")).jPlayer("pause");
		},

		/**
		 * Set the current playback position in the song to t seconds.
		 * @param {Integer} t The offset in seconds from the beginning of the song.
		 */
		setPosition: function(t) {
			this.log("Setting position to t = '" + t + "'");
			this.set("position", t);
			/* If song is currently playing, make sure to continue playback at the position. */
			if (this.get("isPlaying"))
				$(this.get("jp")).jPlayer("play", position);
		},

		/**
		 * Get the current position of playback in the song.
		 */
		getPosition: function() {
			return this.get("position");
		},

		/**
		 * Updates the current position of playback. Will be called upon every ~250ms by jPlayer.
		 */
		updateTime: function(timeEvent) {
			this.set("position", timeEvent.jPlayer.status.currentTime);
		},

		/**
		 * Wrapper for error handling.
		 */
		errorMsg: function(errorEvent) {
			/* Call the errorhandler and pass it jPlayer's error message. */
			this.get('errorHandler')(errorEvent.jPlayer.error.message);
		},

		log: function(msg) {
			console.log("[JPLAYER] " + msg);
		},
		
		triggerSongOver: function() {
			if (!this.get('isPlaying'))
				return;
			namespace.app.trigger("songEndedEvent");
			console.log("[JPLAYER] triggered song over");
		},
	});

	return JPlayerHandler;
});
