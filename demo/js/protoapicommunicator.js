/**
	A class that handles requests to the server
	@param {function(cause:String)} A function that will be called in case any errors occurs
*/
function ProtoApiCommunicator(errorHandler){
	this.errorHandler = errorHandler;
}

/**
	The Base Url for the server
*/
ProtoApiCommunicator.BASE_URL = "api/";

/**
	The audio base Url for the server
*/
ProtoApiCommunicator.AUDIO_BASE_URL = "audio/";

/**
	A string that will be sent to the errorHandler of saveResult if the parameter result isn't a valid gameresult object
*/
ProtoApiCommunicator.INVALID_GAME_RESULT = 2;
/**
	An integervalue that will be sent to the callback functions that expects an integer statusCode, this value indicates that a save failed
*/
ProtoApiCommunicator.SAVE_SUCCESS = 1;
/**
	An integervalue that will be sent to the callback functions that expects an integer statusCode, this value indicates that a save failed
*/
ProtoApiCommunicator.SAVE_FAILURE = -1;
/**
	An integervalue that will be sent to the callback functions that expects an integer statusCode, this value indicates that a delete succeded
*/
ProtoApiCommunicator.DELETE_SUCCESS = 3;
/**
	An integervalue that will be sent to the callback functions that expects an integer statusCode, this value indicates that a delete failed
*/
ProtoApiCommunicator.DELETE_FAILURE = 4;

/**
	A string that will be sent to the errorHandler of saveResult, this value indicates that no nick was giiven to saveResult
*/
ProtoApiCommunicator.NO_NICK = 'NoNick';

/**
	This function will fetch a list from the protostar server containing information about
	playable songs and send it to the callback function, if any error occurs it will be sent to either errorHandler or this.errorHandler.
	@param {Integer} offset The index of the first song in the list.
	@param {Integer} length The length of the list.
	@param {function(songs: [Songinfo], numSongs: Integer)} callback The function that will recieve the result as parameters 
	@param {function(cause: String)} errorHandler The function that will recieve errorstrings as a parameter
	@param {String} query The result will be filtered against artist name and song name by this string if it is not null
*/
ProtoApiCommunicator.prototype.getSongs = function(offset, length, query, callback, errorHandler){
	var data = {length:length, offset:offset};
	if (typeof query == 'string'){
		data.q = query;
	}
	$.ajax({
		url: ProtoApiCommunicator.BASE_URL + "songs/",
		type: "GET",
		async:false,
		data: data,
		success: function(data){
			callback(data);
		},
		error: function(error){
			errorHandler(error);
		},
		dataType: "json"
	});
}

ProtoApiCommunicator.prototype.getSingleSong = function(songId, callback, errorHandler){
	$.ajax({
		url: ProtoApiCommunicator.BASE_URL + "songs/" + songId + "/info",
		type: "GET",
		success: function(data){
			callback(data);
		},
		async: false,
		error: function(errorObj, text, error){
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		dataType: "json"
	});

}

/**
	This functions will fetch raw udx format song data about the song with id songId and send it to callback as a parameter
	@param {Integer} songId The id of the song to fetch
	@param {function(rawsong: String} callback The function that will recieve the result as parameters 
	@param {function(cause: String)} errorHandler The function that will recieve errorstrings as a parameter
*/
ProtoApiCommunicator.prototype.getSong = function(songId , callback, errorHandler){
	$.ajax({
		url:ProtoApiCommunicator.BASE_URL + "songs/" + songId + "/",
		type:"GET",
		async:false,
		success: function(data){
			callback(data);
		},
		error: function(errorObj, text, error){
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		dataType:"text"
	});
}

/**
	This function will save a gameresult on the server, it will call the callback with an Integer indicating succes or failure 
	@param {string} nick The nickname that posts the score
	@param {Integer} score The score
	@param {function(statusCode : Integer)} callback The callback function that will be called with the id of the saved result, if the result was not succesfully saved it will be called with ProtoApiCommunicator.SAVE_FAILURE.
	@param {function(statusCode : String)} errorHandler An error callback that will be called in case of an error.
*/
ProtoApiCommunicator.prototype.saveResult = function(songId, nick, score, gameEvents, callback, errorHandler){
	if (nick == ""){
		errorHandler(ProtoApiCommunicator.NO_NICK);
		callback(SAVE_FAILURE);
	}
	var gameResult = {
		nickname: nick,
		result	: score,
		events	: gameEvents
	};
	var asJson = $.toJSON(gameResult);
	
	$.ajax({
		url:ProtoApiCommunicator.BASE_URL + "songs/" + songId + "/gameresult/",
		type:"POST",
		data: {
			result: asJson
		},
		success: function(data){
			if (data)
				callback(data);
			else
				callback(ProtoApiCommunicator.SAVE_FAILURE);
		},
		error: function(errorObj, text, error){
			callback(ProtoApiCommunicator.SAVE_FAILURE);
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		//dataType:"json"
	});
	
}

/**
	This function will fetch a list of highscores that belongs to the song with id songId and pass it to the callback function as a parameter.
	@param {Integer} songId The id of the song.
	@param {Integer} offset The index of the first result in the list.
	@param {Integer} length The length of the list.	
	@param {function(highscores: [GameResult])} callback The function that will recieve the result as parameters 
	@param {function(cause: String)} errorHandler The function that will recieve errorstrings as a parameter
*/
ProtoApiCommunicator.prototype.getHighScore = function(songId, offset, length, callback, errorHandler){
	$.ajax({
		url:ProtoApiCommunicator.BASE_URL + "songs/" + songId + "/gameresults/",
		data:{
			length:length, 
			offset:offset
		},
		type:"GET",
		async:false,
		success: function(data){
			callback(data);
		},
		error: function(errorObj, text, error){
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		dataType:"json"
	});
}

/**
	This funtion will fetch a gameresult with id resultId and pass it to the callback function as a parameter.
	@param {Integer} resultId The id of the result to fetch
	@param {function(rawsong: String} callback The function that will recieve the result as parameters 
	@param {function(cause: String)} errorHandler The function that will recieve errorstrings as a parameter
*/
ProtoApiCommunicator.prototype.getResult = function(resultId , callback, errorHandler){
	$.ajax({
		url:ProtoApiCommunicator.BASE_URL + "gameresult/" + resultId + "/",
		type:"GET",
		success: function(data){
			callback(data);
		},
		error: function(errorObj, text, error){
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		dataType:"json"
	});
}

ProtoApiCommunicator.prototype.deleteSong = function(songId , callback, errorHandler){
	$.ajax({
		url:ProtoApiCommunicator.BASE_URL + "admin/song/delete/" + songId + "/",
		type:"POST",
		async: false,
		success: function(data){
			callback(ProtoApiCommunicator.DELETE_SUCCESS);
		},
		error: function(errorObj, text, error){
			callback(ProtoApiCommunicator.DELETE_FAILURE);
			if (text && text != "error"){
				errorHandler(text);
			} else {
				errorHandler(error);
			}
		},
		dataType:"json"
	});
	
}

ProtoApiCommunicator.prototype.getAudioUrl = function(songId) {
	var audioUrl;

	$.ajax({
		url: ProtoApiCommunicator.BASE_URL + "songs/" + songId + "/filename",
		async:false,
		success: function(data) {
			audioUrl = ProtoApiCommunicator.AUDIO_BASE_URL + data;
		}
	});

	return audioUrl;
}


