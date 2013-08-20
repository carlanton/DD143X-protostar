require.config({
	baseUrl: "js",
	paths: { 
		jquery: "libs/jquery/jquery",
		underscore: "libs/underscore/underscore",
		backbone: "libs/backbone/backbone",
		order: "libs/require/order",
		text: "libs/require/text",
		reveal: "libs/jquery/plugins/reveal",
		slimscroll: "libs/jquery/plugins/slimscroll",
		textfill: "libs/jquery/plugins/textfill",
		jqueryUI: "libs/jquery/jquery-ui",
		json: "libs/jquery/plugins/json",
		form: "libs/jquery/plugins/jquery.form",
		easel: "libs/easel/easel",
		templates: "../templates",
		jplayer: "libs/jplayer/jquery.jplayer.min",

		// Models
		game: "models/game",
		microphone: "models/microphone",
		gameresult: "models/gameresult",
		scene: "models/scene",
		song: "models/song",
		songinfo: "models/songinfo",
		syllable: "models/syllable",
		udxformatparser: "models/udxformatparser",
		errorhandler: "models/errorhandler",

        jplayerhandler: "models/jplayer",
        youtubehandler: "models/youtubehandler",

		//facebook: "http://connect.facebook.net/en_US/all",
		apicomm: "protoapicommunicator"
	},
	//waitSeconds: 10
});

require(["app"], function(App) {
	App.initialize();
});
