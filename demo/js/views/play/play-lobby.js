define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'game',
	//Collections
	'collections/songinfo',
	//Views
	'views/play/play-render',
	//Template
	'text!templates/play/play.html',
	'songinfo',
	'errorhandler',
	'apicomm'
], function(namespace, $, _, Backbone, Game, songInfoCollection, playRenderView, playTemplate, songmodel, errorhandler){
	
	var app = namespace.app;
	var useChallengeMode = false;
	var challengeResult = null;
	
	var playLobbyView = Backbone.View.extend({
		el: '#page',
		
		events: {
			'click #start': 'renderGame',
			'click #finish': 'cancel',
			'click #replay': 'replay',
			'click #exit': 'exit'
		},
		
		exit: function() {
			app.router.navigate('songs/'+app.game.get('songid'), { trigger:true });
		},
		
		replay: function() {
			app.renderView = new playRenderView();
			app.renderView.render();
			app.game.restart();
		},
		
		cancel: function(){
			app.trigger('songCanceled');
		},
		
		renderGame: function() {

			// Handle debug settings
			$('#debugSettings').hide();
			app.game.set('useSparkles', $('#enableSparkles').attr('checked') ? true : false);
			if ($('#tickerGap').val())
				app.game.set('tickerGap', $('#tickerGap').val());

			//render game view
			app.renderView = new playRenderView();
			app.renderView.render();
			//start game
			app.game.start();
			return false;
		},
		
		onError: function(error){
			console.log(error);
		},
		
		showPlayButton: function() {
			var playButton = $('<button>', {
				'class':'button pink glossy',
				'id': 'start',
				'text': 'Start singing!'
			}).hide();
			
		
			if (useChallengeMode){
				while (challengeResult == null){}

				var challangeSpan = $('<p/>', {
					'text': 'Challenging ' + challengeResult.nickname + ' who scored ' + challengeResult.result
				});
				$('.info').append(challangeSpan);
				
			}
			$('.info').removeClass('loading').prepend(playButton);
			
			playButton.fadeIn();
			//Bind events
			this.delegateEvents();
		},
		
		onChallengeSessionFetched: function(result){
			challengeResult = result;
			app.trigger('challengeSessionReadyEvent', result);
		},
		
		invalidSongId: function() {
			return errorhandler.handleFatal('Invalid song id!');
		},
		
		render: function(songid, challangeResultId) {
			
			if(isNaN(songid)) return this.invalidSongId();
			
			app.unbind(null, null, this);
			app.bind('gameReadyEvent', this.showPlayButton, this);
			
			//Check for valid song id
			if(!songInfoCollection.get(songid)) {
				var api = new ProtoApiCommunicator(function(e){console.log(e);});
				var that = this;
				api.getSingleSong(songid, function(songinfo){
					if(!songinfo) that.invalidSongId();	
					that.song = new songmodel(songinfo);
				}, function(e){
					
				});
			} else {
				this.song = songInfoCollection.get(songid);
			}

			useChallengeMode = (typeof challangeResultId !== 'undefined');

			data = {
				title: this.song.get('title'),
				artist: this.song.get('artist'),
				id: songid
			}
			
			//IMPORTANT
			//We have to render the template before creating a new game (or Youtube iframe will fail)
			var compiledTemplate = _.template(playTemplate, data);
			$(this.el).html(compiledTemplate);
						
			//Create a new Game, put it on the namespace
			app.game = new Game({
				song: this.song,
				songid: songid,
				useChallengeMode: useChallengeMode,
				challangeResultId: challangeResultId || undefined
				});
			
			if (useChallengeMode){
				var apicomm = new ProtoApiCommunicator(this.onError);
				apicomm.getResult(challangeResultId, this.onChallengeSessionFetched, this.onError);
			}
			
			return this;
		}
	
	});
	return new playLobbyView;
});
