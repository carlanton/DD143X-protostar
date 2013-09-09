define([
	'namespace',
	'backbone',
	'syllable',
	'scene',
	'song'
], function(namespace, Backbone, Syllable, Scene, Song) {
	
	var app = namespace.app; //TODO app is never read

	/**
	 * UdxFormatParser
	 *
	 * Backbone-style construction:
	 *	new UdxFormatParser({
	 *		errorHandler: function () { ... }
     *  });
	 *
	 * @author Andreas Gabrielsson
	 * @author Viktor Collin
	 */
	var UdxFormatParser = Backbone.Model.extend({

		defaults: {
			// A number that contains the number of header lines in the udx format String
			'numberOfHeaderLines': 0,

			// A callback function that will be called if an error occurs
			'errorHandler': null,
		},

		// All beats are multipled with this factor to create a smoother game experience :-)
		bpmFactor: 8,
		
		// An errorstring that will be sent to the errorhandler in case we get no "E" at the end
		NoUdxEnd: "No Udx end of file",
		
		// An errorstring that will be sent to errorhandler in case of unexpected "E"
		UnexpectedEnd: "Unexpected end of UDX format file on line ",

		// A regexp that matches the UnexpectedEnd errorString, group 1 will contain the row number where the error occured
		UnexpectedEndMatcher: /Unexpected end of UDX format file on line ([0-9]+)/,
		
		// If an error was found in a line this String will be the beginning of the String that is sent to errorhandlern as a parameter
		InvalidLine: "Sytax error in udx format string on line ",
		
		// A regexp that matches the Invalidline errorString, group 1 will contain the row number where the error occured
		InvalidLineMatcher: /Syntax error in udx format string on line ([0-9]+)/,
		
		// If an unknown error occurs we pass this to the error handler
		UnknownError: "An unknown error occured",

		// If relative is set to yes we pass this to the error handler
		RelativeError: "Udx-file is in relative mode, file should be edited to normal mode",

		// If an mandatory field is missing in header we pass this to the error handler
		MandatoryFieldMissing: "Mandatory field(s) is missing in header. Missing: ",

		// A regexp that matches the an end of line row in a udx String
		EndOfLine: /^- ?([0-9]+)( ([0-9]+))? ?$/,

		// A regexp that matches the #TITLE-line in the udx-format 
		RegExTitle: /^#TITLE:(.+)$/,

		// A regexp that matches the #ARTIST-line in the udx-format 
		RegExArtist: /^#ARTIST:(.+)$/,
		
		// A regexp that matches the #MP3-line in the udx-format 
		RegExMp3: /^#MP3:(.+)$/,
		
		// A regexp that matches the #BPM-line in the udx-format 
		RegExBpm: /^#BPM:([0-9]+([,.][0-9]+)?)$/,
		
		// A regexp that matches the #GAP-line in the udx-format 
		RegExGap: /^#GAP:([0-9]+([,.][0-9]+)?)$/,
		
		// A regexp that matches the #ENCODING-line in the udx-format 
		RegExEncoding: /^#ENCODING:(CP1250|CP1252|UTF8|LOCALE|AUTO)$/i,
		
		// A regexp that matches the #COVER-line in the udx-format 
		RegExCover: /^#COVER:(.+)$/,
		
		// A regexp that matches the #BACKGROUND-line in the udx-format 
		RegExBackground: /^#BACKGROUND:(.+)$/,
		
		// A regexp that matches the #GENRE-line in the udx-format 
		RegExGenre: /^#GENRE:(.+)$/,
		
		// A regexp that matches the #RELATIVE-line in the udx-format
		// only if its set to yes for error handling.
		RegExRelative: /^#RELATIVE:(yes)/i,
		
		//A regexp that matches the #EDITION-line in the udx-format 
		RegExEdition: /^#EDITION:(.+)$/,
		
		// A regexp that matches the #LANGUAGE-line in the udx-format 
		RegExLanguage: /^#LANGUAGE:(.+)$/,
		
		// A regexp that matches the #VIDEO-line in the udx-format 
		RegExVideo: /^#VIDEO:(http:\/\/)?www.youtube.com\/watch\?.*v=([^&]+).*$/,
		
		// A regexp that matches the #VIDEOGAP-line in the udx-format 
		RegExVideoGap: /^#VIDEOGAP:([0-9]+([,.][0-9]+)?)$/,
		
		// A regexp that matches the #START-line in the udx-format 
		RegExStart: /^#START:([0-9]+([,.][0-9]+)?)$/,

		// Static value that represents the a normal syllable type
		SYLLABLE_NORMAL: "normal",
		
		// Static value that represents the a freestyle syllable type
		SYLLABLE_FREE_STYLE: "freestyle",
		
		// Static value that represents the a bonus syllable type
		SYLLABLE_BONUS: "bonus",
		
		// Static value that may be thrown by the constructor of the Syllable class
		SYLLABLE_NOMATCH: "Invalid Syllable",

		/**
		  This function parses a Udx format String to a Song object. If an error occurs the function will return a song but it may be invalid. 
		  @param {String} rawsong The udx format String to be parsed
		  @return {Song} Returns a parsed Song object 
		  */
		parse: function(rawsong) {
			var rows = rawsong.split(/\r?\n/);
			var song = new Song();
			this.numberOfHeaderLines = 0;
			this.parseHeader(rows, song);
			this.parseBody(rows, song);
			return song;
		},

		/**
		  This function parses the header lines of an array with udxformat lines.
		  It also removes the header lines from the array.
		  @private
		  @param {String[]} rows An array with all where each element is a row from a udx format String
		  */
		parseHeader: function(rows, song) {
			var mandatoryFields = [
				this.RegExTitle,
				this.RegExArtist,
				this.RegExMp3,
				this.RegExBpm,
				this.RegExGap
			];
			
			var fields = mandatoryFields.concat([
				this.RegExEncoding,
				this.RegExCover,
				this.RegExBackground,
				this.RegExGenre,
				this.RegExRelative,
				this.RegExEdition,
				this.RegExLanguage,
				this.RegExVideo,
				this.RegExVideoGap,
				this.RegExStart
			]);
			
			while (rows[0].match(/^#/)) {
				this.numberOfHeaderLines++;
				var row = rows.shift(); // Get and removes first row
				
				for (i in fields) {
					var field = fields[i];
					
					if (match = field.exec(row)){ 
						var groupNr = 1;
						var key = field.toString();
						key = key.substring(3,key.indexOf(":")).toLowerCase();

						if (key == "video") {
							groupNr = 2;
							key = "videourl"; // handle special case: key video converted to videoUrl
						} else if (key == "bpm") {
							var orgBpm = 4 * parseFloat(match[groupNr].replace(',','.'));

							// 30 fps = 1800 bpm
							this.bpmFactor = Math.ceil(1800 / orgBpm);
							match[groupNr] = orgBpm * this.bpmFactor;
							song.set('bpmFactor', this.bpmFactor);

						} else if (key == "gap" || key == "videogap"){
							match[groupNr] = Math.round(match[groupNr]); // round Decimal to Integer
						} else if(key == "start"){
							match[groupNr] = Math.round(match[groupNr]*1000); //convert to millis and round
						} else if (key == "relative"){
							this.get('errorHandler')(this.RelativeError); // handle error when relative is set to yes
						}
						song.set(key, match[groupNr]); // Set value in song object
						
						var idx = mandatoryFields.indexOf(field); // Find the index in mandatory
						if (idx!=-1)
							mandatoryFields.splice(idx, 1); // Remove from mandatory if found
						
						fields.splice(i, 1); // Remove from fields
						
						break;
					}
				}	
			}
			if (mandatoryFields.length != 0) {
				var missing = "";
				
				for (i in mandatoryFields) {
					var field = mandatoryFields[i].toString();
					field = field.substring(2,field.indexOf(":"));
					missing += "[" + field + "] & ";
				}

				missing = missing.substring(0,missing.length-3);
				this.get('errorHandler')(this.MandatoryFieldMissing + missing);
			}
		},

		/**
		  This function parses the body lines of an array with udxformat lines.
		  @private
		  @param {String[]} rows An array with all where each element is a row from a udx format String
		  */
		parseBody: function(rows, song) {
			var endOfUdx = false;
			var scene = new Scene();	
			var syllable = null;

			// The first scene shall be shown from the start
			scene.set('showScene', 0);
			for (var i = 0; i < rows.length && !endOfUdx; i++) {
				if (this.EndOfLine.test(rows[i])){
					scene = this.processEndOfLine(rows[i], scene, song);
					
					if (rows[i+1] == "E")
						this.get('errorHandler')(this.UnexpectedEnd + (i+1+this.numberOfHeaderLines)); 
				
				} else if (rows[i] == "E"){
					// The end character
					scene.set('hideScene', scene.get('syllables').at(scene.get('syllables').length-1).get('startBeat') + 
						scene.get('syllables').at(scene.get('syllables').length-1).get('beats') + 10);
					song.addScene(scene);
					endOfUdx = true;

				} else {
					// We should have a syllable!
					try{
						syllable = this.parseSyllable(rows[i]);
						scene.addSyllable(syllable);
						
					} catch (error){
						if (error == this.SYLLABLE_NOMATCH){
							this.get('errorHandler')(this.InvalidLine + (this.numberOfHeaderLines + i +1));	
						} else {
							this.get('errorHandler')(this.UnknownError + ": " + error);	
						}
					}
				}	
			}

			if (!endOfUdx) {
				this.get('errorHandler')(this.NoUdxEnd);
			}
		},

		/**
		 * @param {String} udxSyllableRow A Syllable row from udx file
		 * @throws Syllable.NOMATCH if udxSyllableRow is an invalid udx row
		 */
		parseSyllable: function(row) {
			var regExp = /^([:F*]) ([0-9]+) ([0-9]+) (-?[0-9]+) ( ?.+)$/i;	
			var match = regExp.exec(row);
			
			if (match == null){
				throw this.SYLLABLE_NOMATCH;
			}

			var syllable = new Syllable();

			// The Syllable type. Possible values Syllable.NORMAL, Syllable.FREE_STYLE, Syllable.BONUS
			if (match[1] == ":") {
				syllable.set('type', this.SYLLABLE_NORMAL);
			} else if (match[1] == "*") {
				syllable.set('type', this.SYLLABLE_BONUS);
			} else {
				syllable.set('type', this.SYLLABLE_FREE_STYLE);
			}

			syllable.set({
				// The start beat of this syllable
				'startBeat': parseInt(match[2]) * this.bpmFactor,
				
				// The lenght in beats of this syllable
				'beats': parseInt(match[3]) * this.bpmFactor,
				
				// The correct tone for this syllable
				'tone': parseInt(match[4]) + 24,
				
				// The text of this syllable
				'text': match[5]
			});

			return syllable;
		},

		/**
		  Processes an end of line row
		  @private
		  @param {String} endOfLine The end of line row 
		  @param {Scene} currentScene The Scene that is currently processed
		  @return The next Scene to process
		  */
		processEndOfLine: function(endOfLine, currentScene, song) {
			var match = this.EndOfLine.exec(endOfLine);
			if (match == null){
				this.get('errorHandler')(this.InvalidLine + (this.numberOfHeaderLines + i));
			}
			song.addScene(currentScene);
			if (match[3] == undefined){
				// create the next scene.
				currentScene = new Scene();
				// set startbeat for that scene

				currentScene.set('showScene', parseInt(match[1]) * this.bpmFactor);

			} else {
				/* 
				 * Here we have two numbers, the first one means the 
				 * beat when the previous scene should be hidden and
				 * the second one means when the next should be shown
				 */
				currentScene.set('hideScene', parseInt(match[1]) * this.bpmFactor);
				currentScene = new Scene();	
				currentScene.set('showScene', parseInt(match[3]) * this.bpmFactor);
			}
			return currentScene;
		}
	});

	return UdxFormatParser;
});
