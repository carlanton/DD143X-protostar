define([
	'namespace',
	'jquery',
	'underscore',
	'backbone',
	'errorhandler',
	'microphone',
	'udxformatparser',
	'song',
	'jplayerhandler',
	'youtubehandler',
	'apicomm',
	'easel',
	], function(namespace, $, _, Backbone, errorHandler, Microphone, UdxFormatParser, Song,
		JPlayerHandler, YoutubeHandler) {

		CHEATING = false;
		var app = namespace.app;
		var Game = Backbone.Model.extend({

			defaults: {
				song: null,
				scenes: null,
				currentScene: null,
				bpm: null,
				bpms: null,
				bpmFactor: null,
				gap: 0,
				youtubeplayer: null,
				songid: null,
				useChallengeMode: false,
				challengeSession: null,
				occuranceCounter: 0,
				challengeScore: 0,
				GameOccurances: [],
				score: 0,
				beat: -1,
				componentsReady: null,
				currentTone: -1,
				minutes: 0,
				seconds: 0,
				useSparkles: true,

				tickerGap: 0
			},

			log: function(msg) {
				console.log("[GAME] " + msg);
			},

			initialize: function() {
				var that = this;
				console.log("[GAME] initializing");

				// Crazy bind tricks
				_.bindAll(this, 'parseUdx');
				_.bindAll(this, 'tick');
				_.bindAll(this, 'initYoutube');

				// Setup events
				app.bind("parseUdxEvent", this.initYoutube, this);
				app.bind("parseUdxEvent", this.initJplayer, this);
				app.bind('songEndedEvent', this.gameFinished, this);
				app.bind('songCanceled', this.gameFinished, this);
				app.bind('componentReadyEvent', this.componentHandler, this);
				app.bind('SHUT_DOWN_EVERYTHING', this.stop, this);

				// Set default component status
				this.set('componentsReady', {
					mic: false,
					jplayer: false,
					youtube: false
				});
				
				/* Force override start values */
				this.reset();

				/*
				 *
				 * Component: ProtoAPICommunicator
				 *
				 */
				var api = new ProtoApiCommunicator(errorHandler.handleFatal);

				api.getSong(this.get('songid'), this.parseUdx, this.log);

				if (this.get('useChallengeMode')) {
					app.bind('challengeSessionReadyEvent', function(result) {
						that.set('challengeSession', result);
						that.set('occurrancesBackup', _.clone(result.events));
						app.trigger('componentReady', 'challengeSession');
					}, this);
				} else {
					delete this.attributes.componentsReady.challengeSession;
				}

				/**
				 *
				 * Component: Microphone
				 *
				 */

				// If we already have a valid microphone instance we don't
				// need to create another :-)
				if (app.microphone != null && app.microphone.getStatus() !== 1) {
					app.microphone.reset();
					app.microphone = null;
				}

				if (app.microphone == null) {
					app.microphone = new Microphone({
						errorHandler: errorHandler.handle
					});
				}

				this.set({
					mic: app.microphone
				});

				app.microphone.requestAccess();
			},

			initJplayer: function() {
				/**
				 *
				 * Component: JPlayer
				 *
				 */

				var api = new ProtoApiCommunicator(errorHandler.handleFatal);

				var start = 0;
				if (this.get('song').get('start') != null)
					start = this.get('song').get('start');

				var jplayer = new JPlayerHandler({
					mp3Url: api.getAudioUrl(this.get('songid')),
					errorHandler: errorHandler.handleFatal,
					start: start
				});
				this.set({
					jplayer: jplayer
				});
			},

			componentHandler: function(componentId) {
				this.get('componentsReady')[componentId] = true;
				console.log('[GAME] Component "' + componentId + '" is ready!');

				if (_.all(this.get('componentsReady'), _.identity)) {
					console.log('[GAME] All components are ready. Triggering gameReadyEvent');
					app.trigger("gameReadyEvent");
				} else {
					console.log('[GAME] Waiting for other components to get ready: '
						+ JSON.stringify(this.get('componentsReady')));
				}
			},

			initYoutube: function(){
				//Get YouTube ID from song
				var youtubeID = this.get('song').get('videourl');

				//Check if it is set
				if(youtubeID == null)
					return app.trigger('componentReadyEvent', 'youtube');

				//Create new YouTube player
				var player = new YoutubeHandler({
					errorHandler : errorHandler.handleFatal,
					youtubeId : youtubeID,
					youtubeOffset : this.get('song').get('videogap')
				});

				//Assign it to game object
				this.set('youtubeplayer', player);
			},

			parseUdx: function(rawsong) {
				var udxformatparser = new UdxFormatParser({
					errorHandler: errorHandler.handleFatal
				});

				var currentSong = udxformatparser.parse(rawsong);

				this.set('song', currentSong);
				this.set('scenes', currentSong.get('scenes'));
				this.set('bpm', currentSong.get('bpm'));
				this.set('bpms', currentSong.get('bpm') / 60000);
				this.set('gap', currentSong.get('gap'));
				this.set('bpmFactor', currentSong.get('bpmFactor'));
				
				console.log('[GAME] BPM: ' + currentSong.get('bpm'));

				this.createSceneMaps(currentSong.get('scenes'));

				app.trigger('parseUdxEvent');
			},

			createSceneMaps: function(scenes) {
				var showSceneMap = {};
				var hideSceneMap = {};

				var prevScene = null;

				_.each(scenes, function(scene) {
					if (scene.get('showScene') != null) {
						if (prevScene != null)
							prevScene.set('nextScene', scene);

						showSceneMap[scene.get('showScene')] = scene;
						prevScene = scene;
					}

					if (scene.get('hideScene') != null)
						hideSceneMap[scene.get('hideScene')] = true;
				});

				this.set('showSceneMap', showSceneMap);
				this.set('hideSceneMap', hideSceneMap);
			},

			start: function() {
				console.log('[GAME] start');
				this.startTicker();
				//Play music
				this.get('jplayer').play();

				//Start video if possible
				if(this.get('youtubeplayer') !== null)
					this.get("youtubeplayer").start();
					
				if (this.get('gap') > 5000)
					app.trigger('startCountdown');
			},

			startTicker: function() {
				//Init/reset the EaselJS ticker
				var that = this;
				setTimeout(function() {
					var fps = that.get('bpm') / 60;

					console.log('[GAME] Ticker start (fps: ' + fps 
							+ ', tickerGap: '+that.get('tickerGap')+')');
					Ticker.init();
					Ticker.setFPS(fps);
					Ticker.addListener(that);
				}, this.get('tickerGap'));
			},

			stop: function() {
				Ticker.removeAllListeners();
				console.log('[GAME] Stopped');
			},
			
			restart: function() {
				this.reset();
				this.stop();
				this.startTicker();
				
				//Restart music
				$(this.get('jplayer').get("jp")).jPlayer("play", 0);
				
				//Restart video
				if(this.get('youtubeplayer'))
					this.get('youtubeplayer').setPosition(0);
				
				if (this.get('gap'))
					app.trigger('startCountdown');
			},
			
			reset: function() {
				console.log("[GAME] reset");
				this.set({
					beat: -1,
					score: 0,
					challengeScore: 0,
					occuranceCounter: 0,
					GameOccurances: [],
					minutes: 0,
					seconds: 0
				});
			},

			sceneHandler: function(prevBeat, currentBeat) {
				if (currentBeat < 0)
					return;
					
				if (this.get('showSceneMap')[currentBeat] != null) {
					this.set('currentScene', this.get('showSceneMap')[currentBeat]);

					console.log("[GAME] New scene @ " + currentBeat);
					app.trigger('clearScene', currentBeat);
					app.trigger('newScene', this.get('currentScene'), currentBeat);
				} else if (this.get('hideSceneMap')[currentBeat] != null) {
					console.log("[GAME] Clear scene @ " + currentBeat);
					this.set('currentScene', null);
					app.trigger('clearScene');
					app.trigger('timerNextScene', currentBeat);
				} else if (currentBeat - prevBeat > 1) {
					for (var i = currentBeat - 1; i > prevBeat; i--) {
						if (this.get('showSceneMap')[i] != null) {
							this.set('currentScene', this.get('showSceneMap')[i]);

							console.log("[GAME] Missed beat! New scene @ " + i);
							app.trigger('clearScene', i);
							app.trigger('newScene', this.get('currentScene'), i);
							break;
						} else if (this.get('hideSceneMap')[i] != null) {
							console.log("[GAME] Clear scene @ " + i);
							this.set('currentScene', null);
							app.trigger('clearScene', i);
							app.trigger('timerNextScene',i);
							break;
						}
					}
				}
		
			},

			updateTime: function() {
				var seconds = Ticker.getTime()/1000;
				var m = Math.floor(seconds/60);
				var s = Math.floor(seconds-(m*60));
				if(s > this.get('seconds') || m > this.get('minutes')){
					var time = ((m < 10) ? "0"+m : m) + ":" + ((s < 10) ? "0"+s : s);
					//Trigger an update time event
					this.set('minutes', m);
					this.set('seconds', s);
					app.trigger('updateTimeEvent', time, this.get('beat'));
				}
			},

			updateBeat: function() {
				var currentBeat = this.get('beat');
				var t = Ticker.getTime() - this.get('gap');
				var b = Math.round(t * this.get('bpms'));

				// We don't need to read tone status if we aren't in a scene yet
				if (this.get('currentScene') != null)
					this.checkTone(currentBeat, this.get('currentScene'));

				if (b != currentBeat) {

					this.set('beat', b);
					
					this.sceneHandler(currentBeat, b);
					
					
					this.calculateScore(b);

					app.trigger('newBeat', b);
				}
			},

			checkTone: function(currentBeat, scene) {
				var syllables = scene.get('syllables');
				var currentSyllable = syllables.find(function(s) {
					return (s.get('startBeat') <= currentBeat &&
						s.get('startBeat') + s.get('beats') > currentBeat);
				});

				// Read the current expected tone
				var currentExpectedTone = -1;
				if (currentSyllable) {
					currentExpectedTone = currentSyllable.get('tone');
				}

				// Read tone from microphone
				var currentTone = this.get('mic').getTone(currentExpectedTone);
				if (CHEATING)
					currentTone = currentExpectedTone;
				
				//Set the current Tone
				this.set('currentTone', currentTone);

				var match = currentExpectedTone == currentTone;
				
				//Trigger event
				app.trigger('toneChangeEvent', currentTone, match);
			},
			
			calculateScore: function(currentBeat) {
				var scene = this.get('currentScene');
				if(scene == undefined) return;
				var syllables = scene.get('syllables');
				var currentSyllable = syllables.find(function(s) {
					return (s.get('startBeat') <= currentBeat &&
						s.get('startBeat') + s.get('beats') > currentBeat);
				});
				// get whether the tone gives "extra credit"
				var currentToneBonus = currentSyllable && currentSyllable.get('type') == 'bonus';
				var currentTone = this.get('currentTone');
				
				var currentExpectedTone = -1;
				if (currentSyllable) {
					currentExpectedTone = currentSyllable.get('tone');
				}

				if (currentExpectedTone != -1
					&& currentTone == currentExpectedTone) {
					
					var points = currentToneBonus ? 50 : 10;
					if(currentToneBonus && this.get('useSparkles')) app.trigger('sparkleEvent', currentTone);
					this.get('GameOccurances').push({
						beat: currentBeat,
						scoreDelta: points
					});

					var totalScore = this.get('score') + points;
					this.set('score', totalScore);
									
					//Trigger event
					app.trigger('updateScoreEvent', totalScore);
				}
			},

			gameFinished: function() {
				this.log("Song was over, triggering event!");
				app.router.navigate('/play/' + this.get('songid')+ '/finished',{
					trigger:false,
					replace:true
				});
				app.trigger("gameFinished");
				Ticker.removeAllListeners();
			},

			updateChallengeVisual: function() {
				
				if (this.get('useChallengeMode')){
					var beatNum = this.get('beat'),
					ChallengeOccurances = this.get('challengeSession').events,
					//Use a counter instead of shifting the object
					i = this.get('occuranceCounter');
						
					if (ChallengeOccurances.length <= i) {
						return;
					}
					
					if (ChallengeOccurances[i].beat <= beatNum) {
						var newScore = this.get('challengeScore');
						while (ChallengeOccurances[i] != undefined &&
							ChallengeOccurances[i].beat <= beatNum){
							var occurrance = ChallengeOccurances[i];
							newScore += occurrance.scoreDelta;
							i++;
						}
							
						this.set({
							challengeScore: newScore,
							occuranceCounter: i
						});
						
						app.trigger("challengeScoreUpdateEvent", newScore);
					}
				}
			},
			
			verifySync: function() {
				var THRESHOLD = 1.0;

				/* Get current times from components. */
				var tTime = Ticker.getTime() / 1000;
				var jpTime = this.get('jplayer').getPosition() - (this.get('song').get('start') / 1000);

				/* See if they're badly out of sync. */
				if (Math.abs(jpTime - tTime) > THRESHOLD)
					errorHandler.addNotification("Possible synchronization problem detected.");
				else
					errorHandler.delNotification("Possible synchronization problem detected.");
			},

			/**
			 * Tick function is run automatically on each tick,
			 * since we have a Ticker listening on the view
			 */
			tick: function() {
				this.updateBeat();
				this.updateTime();
				this.verifySync();
				this.updateChallengeVisual();
				app.trigger('drawGameEvent');
			},

		});

		return Game;
	});
