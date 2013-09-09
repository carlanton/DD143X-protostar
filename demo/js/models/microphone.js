//
// This class provides an interface for the flash/flex based microphone component.
// 
// On construction, the Microphone class tries to get microphone access
// through 3 stages:
//
// 1. Creates a HTML element containing microphone.swf and appends it to the body.
// 2. Wait for the flash object to get ready.
// 3. Wait for the user to grant microphone access.
//
// On *success*, the flash object is hidden and the componentReadyEvent is triggered.
// 
// On *failure*, the errorHandler is called.
//
// If all 3 stages succeed, the method getTone will return the current
// tone from the microphone.swf.
//
// Authors
// -------
// Anton Lindström & Yuri Stange
//
// See also
// --------
// css/microphone.css, templates/play/play.html and the documentation for the flex/flash
// component.
//


//
define([
	'namespace', 
	'underscore',
	'backbone', 
	'jquery',
], function(namespace, _, Backbone, $) {
	
	var app = namespace.app;
	
	var Microphone = Backbone.Model.extend({

		defaults: {
			timeout: 100,
			flashObject: null,
			container: null,
			errorHandler: this.log,
			flashObjectInit: false,
			octave: 0
		},

		// ### Method constructor
		initialize: function() {
			_.bindAll(this, 'requestAccess');

			// If the event **SHUT\_DOWN\_EVERYTHING** is triggered by game.js the
			// object will be reseted.
			app.bind('SHUT_DOWN_EVERYTHING', this.reset, this);
			
			var container = $('#microphonecontainer');

			// Move the microphone container to the body.
			// Otherwise the container will be detached when switching view.
			container.prependTo('body');

			this.set('container', container);
			this.createFlash();
		},

		// ### createFlash
		// Creates an EMBED-element for microphone.js and append it to the container.
		createFlash: function(){
			console.log("[MICROPHONE] Creating flash object");
			var o = document.createElement('embed');
			this.set('flashObject', o);

			$(o).attr({
				'allowscriptaccess': 'always',
				'type': 'application/x-shockwave-flash',
				'src': 'swf/microphone.swf',
				'id': 'flashObject',
			}).css({
				position: 'absolute' // This must be here for the application to work...
			});
			
			this.get('container').append(o);
			this.set('flashObjectInit', false);
		},
	
		// ### getTone
		// Returns the current tone from the microphone.
		getTone: function(expectedTone) {
			if (this.get('flashObject') == null) {
				return -1;
			} else {
				var currentTone = this.get('flashObject').getTone();

				if (currentTone == -1) {
					return -1;
				}

				// #### Octave matching

				// If expected tone is missing, use the last value
				if (expectedTone == -1) {
					return currentTone += 12 * this.get('octave');
				} else {
					var octave = 0;

					while (expectedTone - currentTone >= 12) {
						octave++;
						currentTone += 12;
					}

					while (currentTone - expectedTone >= 12) {
						octave--;
						currentTone -= 12;
					}

					this.set('octave', octave);
					return currentTone;
				}
			}
		},

		// ### getStatus
		getStatus: function() {
			var o = this.get('flashObject');
			if (o == null || o.getStatus == null) {
				return null;
			} else {
				return o.getStatus();
			}
		},

		// ### log
		// Simple wrapper function for console.log
		log: function(msg) {
			console.log('[MICROPHONE] ' + msg);	
		},

		// ### requestAccess
		// Wait for the user to give us microphone access.
		requestAccess: function() {
			var o = this.get('flashObject');
			var container = this.get('container');

			// Wait for the flash object to get ready:
			if (o.init == null || o.getStatus == null) {
				setTimeout(this.requestAccess, this.get('timeout'));
			} else {
				if (!this.get('flashObjectInit')) {
					o.init();
					this.set('flashObjectInit', true);
				}

				var s = this.getStatus();
				
				if (s == 0) {
					if (!container.hasClass('show')) {
						container.addClass('show');
						container.animate({'margin-top': '+=600'});
					}

					setTimeout(this.requestAccess, this.get('timeout'));
				} else if (s == 1) {
					if (container.hasClass('show')) {
						this.log('Got access! Hiding flashObject and calling callback');
						
						container.animate({'margin-top': '-=600'}, function() {
							container.removeAttr('style').removeClass('show');
						});
					} else {
						this.log('Got access!');
					}

					app.trigger('componentReadyEvent', 'mic');
				} else {
					this.log('Access deniend :-(');
					this.reset();
					
					var that = this;
					this.get('errorHandler')({
						title: 'Microphone access required',
						text: 'The game requires microphone! Please try again.',
					}, function() {
						that.createFlash();
						that.requestAccess();
					});
				}
			}
		},

		// ### reset
		reset: function() {
			this.log('Performing microphone reset!');

			// Resets the container to original state
			this.get('container').removeAttr('style').removeAttr('class');

			// Removes the flash object
			$(this.get('flashObject')).detach();
		},
	});

	return Microphone;
});
