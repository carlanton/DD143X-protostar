define([
	'namespace',
	//Basics
	'jquery',
	'underscore',
	'backbone',
	//Collections
	'collections/songinfo',
	//Views
	'views/admin/edit-form',
	//Templates
	'text!templates/admin/admin-editmain.html',
	'jqueryUI',
	'slimscroll',
], function(namespace, $, _, Backbone, songInfoCollection, songEditView, editMainTemplate) {

	var app = namespace.app;

	var editSongView = Backbone.View.extend({
		
		el: "#page",
		
		initialize: function () {
	    	this.songs = songInfoCollection;
			//Init variable for lazy load
			this.newSongs = [];
		},
		
		events: {
			'click .song':  'clickSongDetails',
			'keyup #song-filter': 'filterSongs',
			'click .load a':  'lazyLoadGetMoreSongs',
			'lazyLoadInit': 'lazyLoadInit',
			'lazyLoadSuccess': 'lazyLoadSuccess',
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
			this.displaySongs(this.newSongs, true);
		},

		render: function(songid){
			//Render main template
			this.$el.html(editMainTemplate);
			
			//Add the songs
			this.displaySongs(this.getAllSongs(), false);
			
			//Lazy load the songs
			$("#results ul").slimScroll({
				height: 'auto',
				color: '#db0766'//'#6d1756'
			});
			
			//If we're provided a song id
			if(songid && this.songs.get(songid)) {
				this.renderSongDetails(this.songs.get(songid));
			} else if(songid && !this.songs.get(songid)) {
				app.router.defaultAction(songid);
			}
			
			return this;
		},

		filterSongs: function(event) {
			var input = $(event.target).val();
			this.displaySongs(this.search(input), false);
		},

		search: function(str) {
			var songs = this.getAllSongs();
			var matches = [];
			$(songs).each(function(i) {
				var t = songs[i].title.toLowerCase();
				var a = songs[i].artist.toLowerCase();
				var s = str.toLowerCase();
				if(t.match(s) || a.match(s) || (a +  ' ' + t).match(s) || (a + ' - ' + t).match(s)) {
					matches.push(songs[i]);
				}
			});
			return matches;
		},

		getMoreSongs: function(offset) {
			
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
			this.renderSongDetails(this.songs.get(songid));
			return false;
		},
		
		renderSongDetails: function (songInfo) {
			//Render the song details
			songEditView.render({
				title: songInfo.get('title'),
				artist: songInfo.get('artist'),
				id: songInfo.get('id')
			});
			return this;
		}
		
	});
	return new editSongView;
});
