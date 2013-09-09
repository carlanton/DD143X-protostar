define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'collections/highscore',
	'text!templates/songs/song-details.html',
	'jqueryUI',
	'slimscroll',
], function(namespace, $, _, Backbone, highScoreCollection,songDetailsTemplate){
	var app = namespace.app;
	var that;
	var detailsView = Backbone.View.extend({

		initialize: function(){
			that = this;
			this.highScores = highScoreCollection;
		},

		events: {
			'click #play-song': 'playSong',
			'click .score': 'highScoreClick'
		},
		
		playSong: function(e) {
			app.router.navigate('/play/'+this.song.id, { trigger:true });
			return false;
		},
		
		render: function(data) {
	
			app.bind("resultsLoaded", this.onResultLoad);
			//Set the element of out view object, 
			//so the events can be delegated after rendition
			this.setElement('#details');
			//Make selected song available from all functions
			this.song = data;
			//Compile template
			var compiledTemplate = _.template(songDetailsTemplate, data);
			//Hide previous details
			this.$el.hide();
			//Add new details to view
			this.$el.html(compiledTemplate);
			//Make a nice fade of new details
			this.$el.fadeIn(300);
			
			this.highScores.reset();
			this.highScores.appendCollection(this.song.id, 0, 50);
			//app.trigger("resultsLoaded");
			//Scroll the highscore
			
			return this;
		},
		onResultLoad: function(){
			app.unbind("resultsLoaded", this.onResultLoad);
			that.displayScores(that.highScores.models);
			$("#highscores ul").slimScroll({
				height: '252px',
				color: '#333'//'#6d1756'
			});
		},
		displayScores: function(scores){
			var el = $('#highscores ul');
			_.each(scores, function(score){
				var item = $('<li/>', {
					});
				var link = $('<a/>', {
						'data-id': score.get('id'),
						'href': '#',
						'class': 'score',
						//text:score.get('result'),
						'text': score.get('result')
					}).append($('<span/>', {
						'text':  score.get('rank') + ": " + score.get('nickname')
					}));
				item.append(link);
				el.append(item);
			});
			
		},

		highScoreClick: function(event) {
			var target = $(event.target);
			if (!target.is('a')){
				target=target.parent('a');
			} 
			var scoreid = target.data('id');
			console.log(scoreid);
			app.router.navigate('/play/'+this.song.id+'/challenge/' + scoreid, {trigger: true});
			return false;
		}
	});
	
	return new detailsView;
	
});
