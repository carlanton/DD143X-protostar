/**
	The YoutubeHandler object provides the functionality for handling
	the youtube playback in the game client as a GAME_MEDIA_PLAYBACK object.


	@constuctor
	@author Daniel Rönnow
	@param {function()} errorHandler Called when the object is ready
	@param {String} youtubeId Id of video to play in backgorund
	@param {int} youtubeOffset Where to start video
*/

define([
	'namespace',
	'backbone',
	'underscore',
	'jquery',
], function(namespace, Backbone, _, $){
	
	var app = namespace.app,
		that;
	
	var YoutubeHandler = Backbone.Model.extend({
	
		defaults: {
			isPlaying : false,
			player : null,
			errorHandler : null,
			youtubeId : null,
			youtubeOffset : 0,
			url: 'http://www.youtube.com/player_api',
		},
		
		/**
		Load the youtube API.
		Calls ready when done.
		*/
		initialize: function() {
			_.bindAll(this);
			that = this;
			
			window.onYouTubePlayerAPIReady = this.ready;
			
			if(!window['YT']) {
				$("<script/>", { src: this.get('url') }).insertBefore('script:first');
			} else {
				this.ready();
			}

		},
		
		/**
		Create a new player with correct settings.
		Is called when the initializion is done.
		*/
		ready: function() {
			var player = new YT.Player('youtubeplayer', {
					height: $('canvas:first').height(),
					width: $('canvas:first').width(),
					videoId: this.get('youtubeId'),
					playerVars: {
						wmode: "transparent",
					    controls: 0,
					    showinfo: 0 ,
					    modestbranding: 1,
					    start: this.get('youtubeOffset'),
					},
					events: {
						onReady: function(event) {
							event.target.mute();
							event.target.setPlaybackQuality("highres");
							event.target.playVideo();
							event.target.pauseVideo();
							namespace.app.trigger("componentReadyEvent", "youtube");
						},
						onError: function(event) {
							var msg;
							alert(event.data);
							switch(event.data){
								case 2:		msg = "Invalid parameters to video";
											break;
								case 100: 	msg = "Video not found";
											break;
								case 101:
								case 150:	msg = "Not allowed to play in embedded";
											break;
								default: 	msg = "Youtube player unavailable";
							}
							$('#youtubeplayer').css('z-index', -2);
							this.get('errorHandler')(msg);
						},
						onStateChange: function(event) {
							if(event.data == 0) {
								$('#youtubeplayer').css('z-index', -2);
							}
						},
					}
				}	
			);
			
			this.set('player', player);
		},

		/**
		Move player to front and start playing the video.
		*/
		start: function(){
			$('#youtubeplayer').css('z-index', 2);
			this.play();
		},
		
		/**
		Start playing the video.
		*/
		play: function(){
			if(!this.get('isPlaying')){
				this.get('player').playVideo();
				this.set('isPlaying', true);
			}
		},
		
		/**
		Stop playing the video.
		*/
		stop: function(){
			if(this.get('isPlaying')){
				this.get('player').pausePlayer();
				this.set('isPlaying', false);
			}			
		},
		
		/**
		Set the position in video.
		*/
		setPosition: function(time){
			this.get('player').seekTo(time, true);
		},
		
		/**
		Get the current position in the video.
		@return the current position
		*/
		getPosition: function(){
			return this.get('player').getCurrentTime();
		}
	
	});

	return YoutubeHandler;
});
