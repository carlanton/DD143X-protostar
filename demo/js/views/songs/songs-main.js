define([
	'namespace',
	//Basics
	'jquery',
	'underscore',
	'backbone',
	//Collections
	'collections/songinfo',
	//Views
	'views/songs/song-details',
	'views/admin/remove-view',
	'views/admin/edit-form',
	//Templates
	'text!templates/songs/songs-main.html',
	'songinfo',
	'jqueryUI',
	'json',
	'slimscroll',
	'apicomm',
], function(namespace, $, _, Backbone, songInfoCollection, songDetailsView, songRemoveView, songEditView, songsMainTemplate, songmodel) {

	var defaultLoadNumber = 20
	var app = namespace.app;
	var curOffset = 0;
	var curQuery = null;
	var that;

	/* possible values "songs, edit, remove"*/
	var mode = null;

	var selectSongView = Backbone.View.extend({
		
		el: '#page',
		
		initialize: function () {
			this.songs = songInfoCollection;
			that = this;
			//Init variable for lazy load
			this.newSongs = [];
		},
		events: {
			'click .song':  'clickSongDetails',
			'keyup #song-filter': 'search',
			'click .load a':  'lazyLoadStart',
			'lazyLoadInit #results': 'lazyLoadInit',
			'lazyLoadSuccess #results': 'lazyLoadSuccess',
			'click #removeBack' : 'removeBack',
			'click #editBack' : 'removeBack'
		},
		refresh: function (){
			this.songs.reset();
			this.songs.appendCollection(0, curOffset, curQuery);
		},
		removeBack: function() {
			app.router.navigate('/admin', {trigger: true});
		},

		lazyLoadInit: function() {
			//Create load button
			var item = $("<li/>", {
							'class':'load'
							})
						.append($("<a/>", {
							'class': 'clean-gray',
							'text': 'Load more songs...',
							'href': '#',
							})
						);
			//If search field is empty		
			if($('#song-filter').val() === "") {
				//Append button to result list
				$("#results ul").append(item);
			}
		},
		
		lazyLoadStart: function(e) {
			var el = $(e.target);
			el.removeClass('clean-gray');
			el.addClass('loading');
			this.songs.appendCollection(curOffset, defaultLoadNumber, curQuery);
			return false;
		},
		
		lazyLoadSuccess: function() {
			var el = $("#results ul");
			$('li.load', el).remove();
		},

		render: function(mode2, songid){
			app.bind('songsLoaded', this.onSongLoad, this);
			app.bind('refreshList', this.refresh, this);
			curQuery = null;
			curOffset = 0;
			mode = mode2
			//Render main template
			this.$el.html(songsMainTemplate);
			//If we're provided a song id
			if(mode == 'remove' || mode == 'edit'){
				var btn = $('<button>', {
                	'id': mode+'Back',
                    'class': 'button orange glossy',
                    'text': 'Back',
					'style': 'float: left; margin-left: 20px; margin-top: 20px;',
                });
				$('.wrapper div:first').prepend(btn);
			}
			if(songid) {
				
				var api = new ProtoApiCommunicator(function(error){
					console.log(error);
				});
				var song = api.getSingleSong(songid, this.renderSongDetails, function(e){console.log(e);});
			}

			
			this.songs.reset();
			this.songs.appendCollection(curOffset, defaultLoadNumber, null);

				
				return this;
		},
		onSongLoad: function(){
			this.displaySongs(this.getAllSongs(), false);
			
			//Lazy load the songs
			$("#results ul").slimScroll({
				height: 'auto',
				color: '#db0766'//'#6d1756'
			});
			
			curOffset = this.songs.length;
		},

		search: function(event) {
			
			if(event.keyCode == 13) {
				curOffset = 0;
				var input = $(event.target).val();
				curQuery = input;
				this.songs.reset();
				this.songs.appendCollection(curOffset, defaultLoadNumber, input)//this.displaySongs(this.search(input), false);
			}
		},

		getAllSongs: function() {
			var songs = [];
			_.each(this.songs.models, function(song) {
				songs.push({
					id: song.get('id'),
					artist: song.get('artist'),
					title: song.get('title')
				});
			});
			return songs;
		},

		displaySongs: function(songList, append) {
			
			var el = $("#results ul");
			
			el.trigger('lazyLoadComplete');
			
			if(!append) {
				el.html("");
			}
			
			_.each(songList, function(song) {
				var item = $("<li/>").append($("<a/>", { 
						'data-id': song.id,
						'class': 'song',
						'text': song.artist + ' - ' + song.title,
						'href': '#'
					}));
				el.append(item);
			});
			var length = append ? this.songs.length : songList.length;
			var str = (length) == 1 ? 'song' : 'songs';
			$("#song-count").text(length+' '+str);
			
		},
		
		clickSongDetails: function(event){
			var songid = $(event.target).data('id');
			
			//Save click in browser history
			var url = null;
			switch (mode){
				case "edit":
				case "remove":
					url = "admin/" + mode + "/" + songid;
					break;
				case "songs":
					url = "songs/" + songid;
			}
			app.router.navigate(url, { trigger: false });
			this.renderSongDetails(this.songs.get(songid));
			return false;
		},
		
		
		
		renderSongDetails: function (songInfo) {
	
			if (!songInfo){
				return that;
			}
			//Render the song details
			var view = null;
			switch (mode){
				case "edit":
					view = songEditView;
					break;
				case "remove":
					view = songRemoveView;
					break;
				case "songs":
					view = songDetailsView;
					break;
			}
	
			if (songInfo.title){
				
				songInfo = new songmodel(songInfo);
			} 
			view.render({
				title: songInfo.get('title'),
				artist: songInfo.get('artist'),
				id: songInfo.get('id')
			});
		

			that.delegateEvents();
			return that;
		}
		
	});
	return new selectSongView;
});
