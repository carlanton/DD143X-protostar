define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'text!templates/play/play-finished.html',
//	'facebook',
	'apicomm'
], function(namespace, $, _, Backbone, playFinishedTemplate) {

	var resultid;
	var app = namespace.app;
	var data = null;
	var url = 'http://protostar.tjugohundratalet.se:8080/';

	var playFinishedView = Backbone.View.extend({

		el: '#page',

		initialize: function(){
			_.bindAll(this, 'saveResultCallback');
			_.bindAll(this, 'saveResultError');
		},

		events: {
			'click #play-again': 'playAgain',
			'click #submit-highscore': 'submitScore',
//			'click #facebook': 'postToFacebook',
			'click #choose-song' : 'chooseSong'
		},


		render: function() {

			this.setElement(this.el);
			
			resultid = -1;
			data = {
				score		: app.game.get('score'),
				title		: app.game.get('song').get('title'),
				artist		: app.game.get('song').get('artist'),
				id			: app.game.get('songid'),
				gameEvents	: app.game.get('GameOccurances'),
				ghostId: app.game.get('challangeResultId')
			};

			//store id
			this.songid = app.game.get('songid');
			app.resetGame();

			var compiledTemplate = _.template(playFinishedTemplate, data);
			this.$el.html(compiledTemplate);
			$(".submit_loading").hide();
			
			$('.copyright', $('body')).hide();

			this.delegateEvents();
		},

		chooseSong: function() {
			app.router.navigate('songs/'+data.id, {trigger:true, replace:false});
			return false;
		},

		playAgain: function() {
			var url = 'play/'+data.id;
			if(data.ghostId) url += '/challenge/'+data.ghostId;
			
			app.router.navigate(url, {trigger:true, replace:true});
			return false;
		},

		submitScore: function() {
			$("#submit-highscore").attr("disabled", true);
			var score = data.score;
			var nickname = $('#nickname').val();
			if (nickname.length < 3 || nickname.length > 15){
				$('#message', this.$el).html('You have to enter a nickname between 3 and 15 characters');
				$("#submit-highscore").attr("disabled", false);
				return;
			}
			var comm = new ProtoApiCommunicator(this.errorLog);
			var gameEvents = data.gameEvents;
			$(".submit_loading").slideDown('slow');
			console.log(gameEvents);
			comm.saveResult(
				data.id, nickname, score, gameEvents,
				this.saveResultCallback, this.saveResultError);
		},

		saveResultCallback: function(returnedId){
			resultid = returnedId;
			$(".submit_loading").slideUp();
			var div = $('#message', this.$el);
			if (returnedId != ProtoApiCommunicator.SAVE_FAILURE){
				$('#facebook').html('Post challenge to Facebook');
				var challengeurl = url + '#play/' + data.id + '/challenge/' + resultid;
				div.html("Your score was submitted, challenge this score on url: ").append($('<a/>', {
						href: challengeurl,
						text: challengeurl
					}));
			} else {
				div.html("Your score was NOT submitted, check your internet connection and try to submit again.");
			}

		},

		saveResultError: function(error){
			$("#submit-highscore").attr("disabled", false);

			this.errorLog(error);
		},

		errorLog: function(message){
			console.error('play-finished: ' + message);
		},

		postToFacebook: function(){
			//FB.init({appId: "xxxxxxxxxxxx", status: true, cookie: true});
			var that = this;
			var fblink;
			var text;
			var name;

			if (resultid > 0){
				fblink = url + '#play/' + data.id + '/challenge/' + resultid;
				name = "I scored " + data.score + ", challenge me!";
				text = "Challenge me on the world-renowned karaoke game ProtoStar";
			} else {
				fblink = url + '#songs/'+ data.id;
				name = "I scored " + data.score + ", can you beat it?", 
				text = 'Try to beat my score in the world-renowned karaoke game ProtoStar.';
			}

            /*
			var obj = {
				method: 'feed',
				link: fblink,
				display: 'popup',
				picture: url + 'css/img/fblogo.png',
				name: name,
				caption: data.artist + ' - ' + data.title,
				description: text,
			};
			FB.ui(obj, that.fbCallback);
            */
		},

		fbCallback: function(response){
			var div = $('#message', this.$el);
			if(response && response.post_id) div.html("Your score was posted on facebook");
			else div.html("Your score was NOT posted on facebook");
		}

	});
	return new playFinishedView;
});
