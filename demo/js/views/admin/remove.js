define([
	'namespace',
	//Basics
	'jquery',
	'underscore',
	'backbone',
	//Collections
	'collections/songinfo',
	//Views
	'views/admin/remove-view',
	//Templates
	'text!templates/admin/admin-removemain.html',
	'jqueryUI',
	'slimscroll',
], function(namespace, $, _, Backbone, songInfoCollection, songRemoveView, removeMainTemplate) {

	var defaultLoadNumber = 12
	var app = namespace.app;
	var curOffset = 0;
	var curQuery = null;

	var removeSongView = Backbone.View.extend({
		
		el: "#page",
		
		initialize: function () {
	    	this.songs = songInfoCollection;
			//Init variable for lazy load
			this.newSongs = [];
			app.bind('songsLoaded',  this.onSongLoad, this)
			
		},
		
		events: {
			'click .song':  'clickSongDetails',
			'keyup #song-filter': 'search',
			'click .load a':  'lazyLoadStart',
			'lazyLoadInit': 'lazyLoadInit',
			'lazyLoadSuccess': 'lazyLoadSuccess',
		},
		lazyLoadStart: function(e) {
			var el = $(e.target);
			el.removeClass('clean-gray');
			el.addClass('loading');
			console.log(curOffset, curQuery);
			this.songs.appendCollection(curOffset, defaultLoadNumber, curQuery);
			return false;
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
		
		lazyLoadGetMoreSongs: function(e) {
			var el = $(e.target);
			el.removeClass('clean-gray');
			el.addClass('loading');
			this.newSongs = this.songs.getMoreSongs(3);
			return false;
		},
		
		lazyLoadSuccess: function() {
			var el = $("#results ul");
			$('li.load', el).remove();
		},

		render: function(songid){
			//Render main template
			this.$el.html(removeMainTemplate);
			//If we're provided a song id
			if(songid && this.songs.get(songid)) {
				this.renderSongDetails(this.songs.get(songid));
			} else if(songid && !this.songs.get(songid)) {
				//app.router.defaultAction(songid);
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
			//app.router.navigate('/songs/'+songid, false);
			app.router.navigate('/admin/remove/'+songid, { trigger: false });
			this.renderSongDetails(this.songs.get(songid));
			return false;
		},
		
		renderSongDetails: function (songInfo) {
			//Render the song details
			songRemoveView.render({
				title: songInfo.get('title'),
				artist: songInfo.get('artist'),
				id: songInfo.get('id')
			});
			return this;
		}
		
	});
	return new removeSongView;
});
