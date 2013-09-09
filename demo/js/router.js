define([
	"namespace",
	"jquery",
	"underscore",
	"backbone",
	"errorhandler",
	"views/intro/intro-main",
	"views/songs/songs-main",
	"views/play/play-lobby",
	"views/admin/admin",
	"views/admin/upload",
	"views/play/play-finished",
	"views/tutorial/tutorial",
	"views/legal/legal",
	"easel"
	], 
function(namespace, $, _, Backbone, errorHandler, introMainView, songsMainView,
	playLobbyView, adminView, uploadView, playFinishedView, tutorialView, legalView){

	var app = namespace.app;

	var AppRouter = Backbone.Router.extend({
		
		routes: {
			// Define some URL routes
			'' : 'index',
			'songs': 'songs',
			'admin/edit': 'edit',
			'admin/edit/': 'edit',
			'admin/edit/:songid' : 'edit',
			'admin/remove': 'remove',
			'admin/remove/:songid' : 'remove',
			'admin/upload': 'upload',
			'songs/:songid': 'songDetails',
			'play/:songid': 'play',
			'play/:songid/challenge/:resultid': 'playChallange',
			//'finished': 'playFinished',
			'admin' : 'admin',
			'admin/' : 'admin',
			'tutorial/:step' : 'tutorial',
			'legal/:terms': 'legal',
			// Default
			'*actions': 'defaultAction'
		},

		initialize: function() {
			this.bind("all", this.changeRoute);
		},

		index: function() {
			introMainView.render();
		},

		songs: function() {
			songsMainView.render("songs");
		},
		
		songDetails: function(songid) {
			songsMainView.render("songs", songid);
		},

		play: function(songid) {
			playLobbyView.render(songid);
		},
		
		playChallange: function(songid, resultid){
			playLobbyView.render(songid, resultid);	
		},
		
		/*playFinished: function() {
			playFinishedView.render();
		},*/

		admin: function() {
			adminView.render();
		},

		edit: function() {
			songsMainView.render("edit");
		},

		upload: function() {
			uploadView.render();
		},

		remove: function() {
			songsMainView.render("remove");
		},
		
		tutorial: function(step) {
			tutorialView.render(step);
		},
		
		legal: function(terms) {
			legalView.render(terms);
		},
		
		defaultAction: function(actions) {
			errorHandler.handle({
				title: 'Oops!',
				text: 'The path you specified, '+actions+', is not valid. Please try again.'
			});
		},
		
		changeRoute: function(route) {
			
			$('.copyright', $('body')).show();
			if(!route.match('route:play')) {
				app.resetGame();
			}
		}
		
	});
	
	var initialize = function() {
		app.resetGame = function() {
			if(!app.game) { 
				return; 
			}
			console.log('[RESET]');
			app.game.get('jplayer').stop();
			Ticker.removeAllListeners();
			
			app.unbind(null, null, app.renderView);
			app.unbind(null, null, app.game);
			app.game = null;
			app.renderView = null;
		}
		
		app.router = new AppRouter();
		Backbone.history.start();
		
		$('.logo-small').live('click', function(e) {
			app.router.navigate('/', { trigger:true });
			return false;
		});
	}
	
	return {initialize: initialize};
});
