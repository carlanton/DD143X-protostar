define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'views/play/play-finished',
	'easel'
], function(namespace, $, _, Backbone, playFinishedView) {

	var app = namespace.app;

	var playRenderView = Backbone.View.extend({

		stage : null,
		voiceContainer : null,
		cursorContainer : null,
		expectedvoiceContainer: null,
		scoreDisplay : null,
		previousTone : null,
		currentCursor : null,
		timeDisplay : null,
		beatDisplay : null,
		lyricsDisplay : null,
		xoffset : null,
		sceneLyrics: [],
		beat : 0,
		bmpAnim : null,
		bmps:null,

		initialize : function() {
			//Bind events from Game Core
			app.bind('updateScoreEvent', this.updateScore, this);
			app.bind('updateTimeEvent', this.updateTime, this);
			app.bind('newScene', this.newScene, this);
			app.bind('clearScene', this.clearScene, this);
			app.bind('toneChangeEvent', this.updateTone, this);
			app.bind('gameFinished', this.finished, this);
			app.bind('newBeat', this.meteronome, this);
			app.bind('sparkleEvent',this.renderSparkles, this);
			app.bind('challengeScoreUpdateEvent', this.updateChallengeScore, this);
			app.bind('drawGameEvent', this.draw, this);
			app.bind('startCountdown', this.startCountdown, this);
			app.bind('timerNextScene', this.startTimer, this);
		},

		events : {
			//Put events bound to the canvas here
		},



		finished : function() {
			console.log('Switching to playFinishedView');
			playFinishedView.render();
		},

		/**
		 * Main render function called by the Lobby View
		 * Initializes every canvas item.
		 */
		render : function() {
			_.bindAll(this, 'renderSyllable');

			var game = app.game;
			var song = game.get('song');
			
			//Set bmps
			this.bpms = app.game.get('bpms');

			$('#exit').show();
			$('#replay').show();
			$('#finish').show();

			//Assign the canvas element
			this.setElement('canvas');
			$('#content').hide();
			this.$el.show();

			this.pxPerBeat = this.$el.width() / (4 + song.get('maxscenelength'));
			this.calcTonePositions(song.get('mintone'), song.get('maxtone'));

			this.bpmFactor = game.get('bpmFactor');

			//Create Stage for EaselJS
			this.stage = new Stage(this.el);

			this.initBackdrops();
			this.initToneLines();

			//Container for the cursor
			this.cursorContainer = new Container();
			this.stage.addChild(this.cursorContainer);

			//Container for the sparkles
			this.sparkleContainer = new Container();
			this.stage.addChild(this.sparkleContainer);
			
			//Container for the song tones
			this.tones = new Container();
			this.stage.addChild(this.tones);

			//Container for the visualization of the user's voice
			this.voiceContainer = new Container();
			this.stage.addChild(this.voiceContainer);

			//Container for the 
			this.matchContainer = new Container();
			this.stage.addChild(this.matchContainer);
	
			//Create stage for the nailed tones
			this.expectedvoiceContainer = new Container();
			this.stage.addChild(this.expectedvoiceContainer);

			this.initScoreDisplay();
			this.initTimeDisplay();
			this.initChallengeScore();
			//this.initBeatDisplay();
			this.initLyricsDisplay();
			//this.initToneDisplay();
			this.initSparkles();
			//this.initCursor();

			//this.stage.update();


			return this;
		},
		
		/**
		 * Calculates the position on the canvas which the song's pitches
		 * represents. The song's highest and lowest pitch are centrated on the canvas
		 * @private
		 * @param {Integer} The current song's lowest pitch
		 * @param {Integer} The current song's highest pitch
		 */
		calcTonePositions : function(songMinTone, songMaxTone) {
			// Number of half tones to render:
			this.numberOfTones = 36;

			if (songMaxTone - songMinTone > this.numberOfTones)
				this.numberOfTones = songMaxTone - songMinTone;

			this.toneOffset = Math.round((this.numberOfTones - (songMaxTone - songMinTone))/2);
			this.minTone = songMinTone - this.toneOffset;
			this.maxTone = songMaxTone + this.toneOffset;
			var lineSpacing = 10;
			var height = this.$el.height();
			var yoffset = Math.round((height - this.numberOfTones * lineSpacing) / 2);

			this.toneYPos = new Array();

			for(var i = this.numberOfTones; i >= 0; i--) {
				this.toneYPos[this.numberOfTones - i] = yoffset + i * lineSpacing - 26;
			}
		},

		/**
		 * Initializes the cursor
		 * @private
		 */
		initCursor : function() {
			//Reset the cursor's x-position on the canvas
			this.currentCursor = 0;
			
			//Cursor display
			var cursorGraphic = new Graphics();
			cursorGraphic.beginFill("#FFFFFF").rect(0, 65, 3, this.el.height-165);
			var cursor = new Shape(cursorGraphic);
			cursor.alpha = 0.5;
			
			//Add the cursor to the stage
			this.cursorContainer.addChild(cursor);
		},

		/**
		 * Draws the pitch lines to the canvas
		 * @private
		 */
		initToneLines : function() {
			var lines = new Container();
			var width = this.$el.width();

			var g = new Graphics().setStrokeStyle(1, 'round').beginStroke('#333').moveTo(0, 0).lineTo(width, 0);

			for(var i = 0; i < this.numberOfTones; i += 2) {
				var s = new Shape(g);
				s.x = 0;
				s.y = this.toneYPos[i];
				lines.addChild(s);
			}
			
			//Add the lines to the stage
			this.stage.addChild(lines);
		},
		
		/**
		 * Draws the backdrops on the canvas
		 * @private
		 */
		initBackdrops: function() {

			var r = 0,
				w = this.$el.width(),
				g, s1, s2;

			//Create top shape
			g = new Graphics().beginFill("#290317").drawRoundRect(0, 0, w, 65, r);
			s1 = new Shape(g);
			
			//Create bottom shape
			g = new Graphics().beginFill("#290317").drawRoundRect(0, 0, w, 100, r);
			s2 = new Shape(g);
			s2.y = this.$el.height()-100;
			
			//Set transparency
			s1.alpha = s2.alpha = 0.8;
			
			//Backdrop container
			this.backdropDisplay = new Container();
			this.backdropDisplay.addChild(s1, s2);
			
			//Add backdrop to stage
			this.stage.addChild(this.backdropDisplay);
		},
		
		/**
		 * Initializes the score display
		 * @private
		 */
		initScoreDisplay : function() {
			//Reset score
			this.score = 0;
			// Create a new EaselJS Text object:
			var scoreTitle = new Text("Your score", "15px Arial", "#FFF");
			scoreTitle.textBaseline = "top";
			scoreTitle.textAlign = "right";

			scoreTitle.x = this.$el.width() - 10;
			scoreTitle.y = 5;
			this.scoreDisplay = new Text("0", "40px Arial", "#FFF");
			this.scoreDisplay.textBaseline = "top";
			this.scoreDisplay.textAlign = "right";

			this.scoreDisplay.x = this.$el.width() - 10;
			this.scoreDisplay.y = 20;
			//Add display to stage
			this.stage.addChild(this.scoreDisplay, scoreTitle);
		},

		/**
		 * Initializes the ghost score if needed
		 * @private
		 */
		initChallengeScore: function() {
			//If we are playing against a ghost score
			if(!app.game.get('useChallengeMode')) return;
			
			//Session name
			var name = new Text(app.game.get('challengeSession').nickname + "'s score", "15px Arial", "#FFF");
			name.textBaseline	= "top";
			name.textAlign		= "center";
			name.x = this.$el.width()/2;
			name.y = 5;
			
			//Score display
			var disp = new Text("0", "40px Arial", "#FFF");
			disp.textBaseline	= "top";
			disp.textAlign		= "center";
			disp.x = this.$el.width()/2;
			disp.y = 20;
			
			//Add displays to the stage
			this.challengeScoreDisplay = disp;
			this.stage.addChild(disp, name);
		},
		
		/**
		 * Initializes the time display
		 * @private
		 */
		initTimeDisplay : function() {

			//Time title display
			var timeTitle = new Text("Time", "15px Arial", "#FFF");
			timeTitle.textBaseline = "top";
			timeTitle.textAlign = "left";
			timeTitle.x = 10;
			timeTitle.y = 5;
			
			//Time display
			this.timeDisplay = new Text("00:00", "40px Arial", "#FFF");
			this.timeDisplay.textBaseline = "top";
			this.timeDisplay.textAlign = "left";
			this.timeDisplay.x = 10;
			this.timeDisplay.y = 20;
			
			//Add displays to stage
			this.stage.addChild(this.timeDisplay, timeTitle);
		},

		/**
		 * Initializes the tone display (For debugging purposes)
		 * @private
		 */
		initToneDisplay : function() {
			//Tone display
			this.toneDisplay = new Text("-1", "50px Arial", "#FFF");
			this.toneDisplay.textBaseline = "top";
			this.toneDisplay.textAlign = "right";
			this.toneDisplay.x = this.$el.width() - 150;
			this.toneDisplay.y = 5;
			//Add display to stage
			this.stage.addChild(this.toneDisplay);
		},

		/**
		 * Initializes the ground sparkle which will later be cloned
		 * @private
		 */
		initSparkles : function() {
			var data = {
				images : ["css/img/sparkles.png"],
				frames : {
					width : 21,
					height : 23,
					regX : 10,
					regY : 11
				}
			}

			//Set up an animation instance, which we will clone
			this.bmpAnim = new BitmapAnimation(new SpriteSheet(data));
		},

		/**
		 * Initializes the beat display (For debugging purposes)
		 * @private
		 */
		initBeatDisplay : function() {
			//Beat display
			this.beatDisplay = new Text("-", "50px Arial", "#FFF");
			this.beatDisplay.textBaseline = "top";
			this.beatDisplay.textAlign = "left";
			this.beatDisplay.x = 190;
			this.beatDisplay.y = 5;
			//Add display to stage
			this.stage.addChild(this.beatDisplay);
		},

		/**
		 * Initializes the lyrics displays and timers
		 * @private
		 */
		initLyricsDisplay : function() {
			//Display for the current scene's lyris
			this.lyricsDisplay = new Container();
			this.lyricsDisplay.y = 445;
			
			//Display for the lyrics of the next scene
			this.nextLyricsDisplay = new Text("", "25px Arial", "#958190");
			this.nextLyricsDisplay.textBaseline = "top";
			this.nextLyricsDisplay.textAlign = "center";
			this.nextLyricsDisplay.x = 470;
			this.nextLyricsDisplay.y = 490;

			//Add nextLyricsTimer
			this.nextLyricsTimer = new Text("", "100px Arial", "#FFFFFF");
			this.nextLyricsTimer.textBaseline = "middle";
			this.nextLyricsTimer.textAlign = "center";
			this.nextLyricsTimer.x = this.$el.width()/2;
			this.nextLyricsTimer.y = this.$el.height()/2;
			this.nextLyricsTimer.alpha = 0.5;

			//Add displays to stage
			this.stage.addChild(this.nextLyricsTimer);
			this.stage.addChild(this.lyricsDisplay);
			this.stage.addChild(this.nextLyricsDisplay);
		},
		
		/**
		 * Calls upon the canvas' update function
		 * @private
		 */
		draw : function(){
			this.updateSparkles();
			this.stage.update();
		},
		
		/**
		 * Updates the score
		 * @private
		 * @param {Integer} The current score
		 */
		updateScore : function(score) {
			this.score = score;
			this.scoreDisplay.text = (score | 0).toString();
		},

		/**
		 * Updates the time display
		 * @private
		 * @param {Integer} The current Time
		 * @param {Integer} The current beat
		 */
		updateTime : function(time, beat) {
			this.timeDisplay.text = time;
		},

		/**
		 * Draws the user's pitch on the canvas. If the user sings the correct pitch
		 * a second bar is drawn on top with another colour to indicate this.
		 * @param {Integer} The current tone
		 * @param {Boolean} True if the user's pitch is correct
		 */
		updateTone : function(tone, match) {

			//If the microphone handler gives us a tone which could not be identified
			if(tone == -1) {
				this.previousTone = tone;
				this.previousMatchTone = tone;
				return;
			};
			
			//If the user didn't sing the correct pitch
			if(!match) this.previousMatchTone = -1;

			var t = tone - this.minTone;

			
			//If new tone
			if(this.previousTone != tone && this.cursorContainer.getNumChildren() !== 0) {

				//Move the given pitch inside the span between the song's lowest and highest pitch
				if (t < 0) {
					while(t <= 0) t += 12;
				} else if (t >= this.toneYPos.length) {
					while(t >= this.toneYPos.length) t -= 12;
				}

				//Create a new bar with the corresponding y-position given the pitch
				var shape = new Shape();
				shape.x = this.currentCursor;
				shape.y = this.toneYPos[t] - 10;
				this.voiceContainer.addChild(shape);
				
				//Update the previous tone
				this.previousTone = tone;
				
			} 
			
			//If the user's current pitch is the same as the previous and there is a cursor on the scene
			else if(this.cursorContainer.getNumChildren() !== 0) {
				//Get the latest drawn pitch bar
				var shape = this.voiceContainer.getChildAt(this.voiceContainer.getNumChildren() - 1);
				//Clear the bar from the stage and update it with the new width
				var g = shape.graphics.clear();
				g.beginLinearGradientFill(["#bcbcbc", "#2a2a2a"], [0, 1], 0, 0, 0, 20);
				
				//Calculate the new width
				var w = this.currentCursor - shape.x;
				if (w != 0)
					g.drawRoundRect(0, 0, w, 20, 5);
			}
			
			//If the user's pitch is correct
			if (match) {
				//If the user's pitch isn't the same as the last and there is a cursor on the scene
				if(this.previousMatchTone != tone && this.cursorContainer.getNumChildren() !== 0) {
					//Create a new bar with the corresponding y-position given the pitch
					var shape = new Shape();
					shape.x = this.currentCursor;
					shape.y = this.toneYPos[t] - 10;
					this.matchContainer.addChild(shape);
					
					//Update the previous Match Tone
					this.previousMatchTone = tone;
					
				} 
				//If the user's pitch is the same as the previous and there is a cursor on the scene
				else if(this.cursorContainer.getNumChildren() !== 0) {
					//Get the latest drawn pitch bar
					var shape = this.matchContainer.getChildAt(this.matchContainer.getNumChildren() - 1);
					//Clear the bar from the stage and update it with the new width
					var g = shape.graphics.clear();
					g.beginLinearGradientFill(["#92e79e", "#1e3622"], [0, 1], 0, 0, 0, 20);
					
					//Calculate the new width
					var w = this.currentCursor - shape.x;
					if (w != 0)
						g.drawRoundRect(0, 0, w, 20, 5);
				}
			}
		},

		/**
		 * Re-initializes the cursor and sets it's position to the desired value
		 * @private
		 * @param {Integer} The x-position the cursor should have
		 */
		setCursor : function(position) {
			//Initialize the cursor display
			this.initCursor();
			//Set the cursor's position to the desired one
			this.currentCursor = position;
		},

		/**
		 * Updates the cursor's position acording to the scene's current beat
		 * @private
		 * @param {Int} The current beat from the scene's perspective
		 */
		updateCursor : function(sceneBeat) {
			//Calculate the cursor's position given the current scene beat
			this.currentCursor = this.xoffset - sceneBeat * this.pxPerBeat;

			//Redraw the cursor if there is one on stage
			if(this.cursorContainer.getNumChildren() !== 0) {
				this.cursorContainer.getChildAt(0).x = this.currentCursor;
			}
		},
		
		/**
		 * Starts the timer countdown to the next scene.
		 * @param {Int} The song's current beat
		 */
		startTimer: function(currentBeat) {
			//If there is no next scene
			if(this.nextSceneStartBeat == undefined)
				return;
			this.nextSceneGap = this.nextSceneGap = this.nextSceneStartBeat - currentBeat;
		},

		/**
		 * Updates the timer countdown to the next scene
		 * @private
		 * @param {Int} The song's current beat
		 */
		updateTimer : function(currentBeat) {
			if (this.nextSceneStartBeat == undefined && this.currentSceneStartBeat == undefined)
				return;

			var nextText = "";
			
			//If the gap is too small
			if(this.nextSceneGap > this.bpmFactor * 200) {
				//Calculate the current gap in seconds
				nextText = Math.round(((this.nextSceneStartBeat - currentBeat)/this.bpms)/1000);
			}
			
			//If the gap is negative
			if(nextText < 0) nextText = "";
			
			//Update the text
			this.nextLyricsTimer.text = nextText;
		},

		/**
		 * Updates the lyrics
		 * @private
		 * @param {String} The current lyrics
		 */
		updateLyrics : function(nextLyrics) {

			var lyrics = this.sceneLyrics,
				xpos = 0,
				word;

			//Remove all previous lyrics
			this.lyricsDisplay.removeAllChildren();

			//Create each syllable
			for(var i = 0; i < lyrics.length; i++) {
				word = new Text("", "40px Arial", "#FFF");
				word.textBaseline = "top";
				word.textAlign = "left";
				word.x = xpos;
				word.y = 0;
				word.text = lyrics[i].get('text');
				//Add the lyrics to the lyricsDisplay
				this.lyricsDisplay.addChild(word);
				//Update xoffset for next word
				xpos += word.getMeasuredWidth();
			}

			//Place lyrics in the middle
			this.lyricsDisplay.x = Math.floor((this.$el.width() - xpos)/2);
			//Display the next lyrics
			this.nextLyricsDisplay.text = nextLyrics;
		},

		/**
		 * Starts the countdown to the first scene
		 */
		startCountdown : function() {
			//The first scene starts at beat 0
			this.nextSceneStartBeat = 0;
			//Set the gap to a value
			this.nextSceneGap = 9007199254740992;
		},
		
		/**
		 * Function called from the game core on each beat
		 * Triggers everything beat related in the game render
		 * @param {Int} The game's current beat
		 */
		meteronome : function(currentBeat) {
			var sceneBeat = this.currentSceneStartBeat - currentBeat;

			//Update the cursor and timer to next scene
			this.updateCursor(sceneBeat);
			this.updateTimer(currentBeat);

			if (this.lyricsDisplay.getNumChildren() == this.sceneLyrics.length) {
				var highlight = "#0BF";
				var normal = "#FFF";

				//Loop through each word for the scene and highlight it
				for(var i = 0; i < this.sceneLyrics.length; i++) {
					//Fetch the syllable
					var syllable = this.sceneLyrics[i];

					//Get the beat interval for the syllable
					var wordStart = syllable.get('startBeat');
					var wordEnd = syllable.get('startBeat') + syllable.get('beats');
					
					//Determine the color
					var color = (currentBeat >= wordStart && currentBeat <= wordEnd) ? highlight : normal;

					//Highlight the syllable
					this.lyricsDisplay.getChildAt(i).color = color;
				}
			}
		},

		/**
		 * Clears the scene
		 */
		clearScene: function() {
			//Set both previous tone and previous match tone to a value we know will trigger a new
			//pitch bar
			this.previousTone = -3;
			this.previousMatchTone = -3;
			//Clear everything
			this.cursorContainer.removeAllChildren();
			this.voiceContainer.removeAllChildren();
			this.lyricsDisplay.removeAllChildren();
			this.tones.removeAllChildren();
			this.matchContainer.removeAllChildren();
			this.expectedvoiceContainer.removeAllChildren();
		},

		/**
		 * Handles the occurrence of a new scene
		 * @param {Scene} The new scene to be handled
		 * @param {Int} The game's current beat
		 */
		newScene : function(scene, currentBeat) {
			//Reset the gap to the new scene
			this.nextSceneGap = 0;
			//Fetch the scene following the current one
			var nextScene = scene.get('nextScene');
			
			//Fetch the current scene's startbeat
			this.currentSceneStartBeat = scene.get('syllables').at(0).get('startBeat');		
			
			//If the start beat is undefined
			if (!this.currentSceneStartBeat)
				this.currentSceneStartBeat = 0;

			//Calculate the current beat relative to the current scene
			var sceneBeat = this.currentSceneStartBeat - currentBeat;

			//Fetch the scene's syllables
			var syllables = scene.get('syllables'),
				firstSyllable = syllables.at(0),
				lastSyllable = syllables.at(syllables.length - 1),
				lyrics = [],
				nextLyrics = "",
				that = this;

			// Number of beats in current scene
			var numberOfBeats = lastSyllable.get('startBeat') +
				lastSyllable.get('beats') - firstSyllable.get('startBeat');
			
			//Calculate the width of the scene in pixels
			var sceneWidth = numberOfBeats * this.pxPerBeat;
			
			//Calculate the xoffset based on the scene's width and set the cursor
			this.xoffset = (this.$el.width() - sceneWidth) / 2;
			this.setCursor(this.xoffset - sceneBeat * this.pxPerBeat);

			//Render each syllable in the scene
			syllables.forEach(function(s) {
				that.renderSyllable(s, that.xoffset);
			});

			//Add the text in each syllable to the variable lyrics
			scene.get('syllables').each(function(syllable) {
				lyrics.push(syllable);
			});
			
			//Handle nextScene
			if (nextScene != undefined) {
				//Fetch the startbeat of the next scene
				this.nextSceneStartBeat = nextScene.get('syllables').at(0).get('startBeat');
				
				//Concatinate the text from the next scene
				nextScene.get('syllables').each(function(syllable) {
					nextLyrics += syllable.get('text');
				});
			} else {
				//If there is no next scene
				nextLyrics = "";
			}

			//Set the lyrics in a globla variable and update the lyrics
			this.sceneLyrics = lyrics;
			this.updateLyrics(nextLyrics);
		},

		/**
		 * Renders the syllables
		 * @private
		 * @param {Syllable} The current syllable to be rendered
		 * @param {Int} the offset in x-position based on the scene's width
		 */
		renderSyllable : function(s, xoffset) {
			//Calculate the syllables x-position, width and y-position based on the syllables pitch
			var x = xoffset + (s.get('startBeat') - this.currentSceneStartBeat) * this.pxPerBeat;
			var w = (s.get('beats')-1) * this.pxPerBeat;
			var y = this.toneYPos[s.get('tone') - this.minTone];

			var gradientFill, gradientStroke;

			//Handle different type of syllables
			switch (s.get('type')) {
				case 'bonus':
					gradientFill   = ['#69c6f5', '#095d87'];
					gradientStroke = ['#41b0e8', '#0a5073'];
					break;
				case 'freestyle':
					gradientFill   = ['#095d87', '#69c6f5'];
					gradientStroke = ['#41b0e8', '#0a5073'];
					break;
				case 'normal':
				default:
					gradientFill   = ['#F23DA7', '#88004C'];
					gradientStroke = ['#F23DA7', '#88004C'];
			}

			//Create the bar which represents the syllable on the canvas
			var g = new Graphics();
			g.setStrokeStyle(2);
			g.beginLinearGradientFill(gradientFill, [0, 1], 0, 30, 0, 0);
			g.beginLinearGradientStroke(gradientStroke, [0, 1], 0, 0, 0, 30);
			g.drawRoundRect(0, 0, w, 28, 5);

			var s = new Shape(g);
			s.x = x;
			s.y = y - 28 / 2;
			
			//Add the shape to the tones container
			this.tones.addChild(s);
		},

		/**
		 * Render the sparkles when the user sings the right pitch on a bonus syllable
		 * @param {Int} The user's pitch
		 */
		renderSparkles: function(tone) {

			//Add two stationary sparkles at a time
			for (var i = 0; i< 2; i++) {
				var sparkle = this.bmpAnim.clone();
				sparkle.x = this.currentCursor;
				sparkle.y = (this.toneYPos[tone - this.minTone] -10) + (Math.random() * 20 | 0);
				sparkle.alpha = Math.random() * 0.5 + 0.5;
				sparkle.scaleX = sparkle.scaleY = Math.random() + 0.3;
				sparkle.gotoAndPlay(Math.random() * sparkle.spriteSheet.getNumFrames() | 0);
				this.expectedvoiceContainer.addChild(sparkle);
			}
			
			//Add falling sparkles
			this.addSparkles(Math.random() * 5 + 1 | 0,
					this.currentCursor, 
					this.toneYPos[tone - this.minTone],
					1);
		},

		/**
		 * Updates the position of the sparkles on the canvas
		 * @private
		 */
		updateSparkles : function() {
			// loop through all of the active sparkles on stage:
			var l = this.sparkleContainer.getNumChildren();
			for(var i = l - 1; i >= 0; i--) {
				var sparkle = this.sparkleContainer.getChildAt(i);

				// apply gravity and friction
				sparkle.vY += 2;
				sparkle.vX *= 0.98;

				// update position, scale, and alpha:
				sparkle.x += sparkle.vX;
				sparkle.y += sparkle.vY;
				sparkle.scaleX = sparkle.scaleY = sparkle.scaleX + sparkle.vS;
				sparkle.alpha += sparkle.vA;

				//remove sparkles that are off screen or not invisble
				if(sparkle.alpha <= 0 || sparkle.y > this.el.height) {
					this.sparkleContainer.removeChildAt(i);
				}
			}
		},

		/**
		 * Updates the ghost challenge record display
		 * @param {Int} The current score
		 */
		updateChallengeScore: function(score) {
			console.log('Score:', score);
			this.challengeScoreDisplay.text = score.toString();
		},

		/**
		 * Add the falling sparkles to the canvas
		 * @param {Int} The ammount of sparkles to be drawn
		 * @param {Int} The x-position of the sparkles
		 * @param {Int} The y-position of the sparkles
		 * @param {Int}	The desired falling speed of the sparkles
		 */
		addSparkles : function(count, x, y, speed) {
			//Create the specified number of sparkles
			for(var i = 0; i < count; i++) {
				//Clone the original sparkle
				var sparkle = this.bmpAnim.clone();

				//Set display properties:
				sparkle.x = x;
				sparkle.y = y;
				sparkle.alpha = Math.random() * 0.5 + 0.5;
				sparkle.scaleX = sparkle.scaleY = Math.random() + 0.3;

				//Set up velocities:
				var a = Math.PI * 2 * Math.random();
				var v = (Math.random() - 0.5) * 30 * speed;
				sparkle.vX = Math.cos(a) * v;
				sparkle.vY = Math.sin(a) * v;
				sparkle.vS = (Math.random() - 0.5) * 0.2;
				//Scale
				sparkle.vA = -Math.random() * 0.05 - 0.01;

				//Start the animation on a random frame:
				sparkle.gotoAndPlay(Math.random() * sparkle.spriteSheet.getNumFrames() | 0);

				//Add to the display list:
				this.sparkleContainer.addChild(sparkle);
			}
		}
	});

	return playRenderView;
});
