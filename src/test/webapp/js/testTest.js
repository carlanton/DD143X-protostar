var testTest = AsyncTestCase("testTest");



var pac = new ProtoApiCommunicator(function(error){ console.log(error);});

var string = "";
var cod = "#TITLE:Consequence Of Dawn"; 
var mwbd = "#TITLE:Mensch, wo bist du? (Karaoke)";

var printS = function(data){
	var array= data.split("\n",1);
	var string = array.shift();
	console.log(string);
	//console.log(data);
};

var printF = function(data){
	console.log("Using error handler");
	console.log(data);
};

testTest.prototype.testGetSong1 = function() {
	var output = "";

	pac.getSong(1, function(data){
		var array= data.split("\n",1);
		var string = array.shift();
		output = string;
	}, printF);

	var expected = output.substring(0,output.length - 1);
	assertEquals(expected,cod);
	assertNotEquals(expected, "Knasig titel");
};

testTest.prototype.testGetSong2 = function() {
	var output = "";

	pac.getSong(2, function(data){
		var array= data.split("\n",1);
		var string = array.shift();
		output = string;
	}, printF);

	var expected = output.substring(0,output.length - 1);
	assertEquals(expected,mwbd);
	assertNotEquals(expected, "Knasig titel");
};

testTest.prototype.testGetSongs1 = function() {
	var output1;
	var output2;	
	/***
	 * Offset, length, ,query, callback, errorHandler
	 */
	pac.getSongs(0,2,"",function(data){
		var info1 = data.shift();
		var info2 = data.shift();
		output1 = info1;
		output2 = info2;
	}, printF);
	var actualTitle1 = output1.title.substring(0,output1.title.length-1);
	var actualTitle2 = output2.title.substring(0,output2.title.length-1);
	assertEquals(output1.id,1);
	assertEquals(output2.id,2);
	assertEquals(actualTitle1,"Consequence Of Dawn");
	assertEquals(actualTitle2, "Mensch, wo bist du? (Karaoke)");
};

testTest.prototype.testGetSongs2 = function() {
	var output1;	
	/***
	 * Offset, length, ,query, callback, errorHandler
	 */
	pac.getSongs(1,2,"",function(data){
		var info1 = data.shift();
		output1 = info1;
	}, printF);
	var actualTitle1 = output1.title.substring(0,output1.title.length-1);
	assertEquals(output1.id,2);
	assertEquals(actualTitle1, "Mensch, wo bist du? (Karaoke)");
};

testTest.prototype.testGetSongs3 = function() {
	var output1;	
	/***
	 * Offset, length, ,query, callback, errorHandler
	 */
	pac.getSongs(0,2,"wo",function(data){
		var info1 = data.shift();
		output1 = info1;
	}, printF);
	var actualTitle1 = output1.title.substring(0,output1.title.length-1);
	assertEquals(output1.id,2);
	assertEquals(actualTitle1, "Mensch, wo bist du? (Karaoke)");
};

testTest.prototype.testSaveResults1 = function() {
/**	var callBackResult;
	
	pac.saveResult({
		result: 40000,
		nickname: 'maren',
		songId: 1,
		rank: 87		
	}, function(data){
		console.log(data);
		callBackResult = data;
	}, printF);

	assertEquals(callBackResult,1);*/
};

testTest.prototype.testGetHishscore = function() {
	
	//todo
	
}

testTest.prototype.testGetResult = function() {
	
	//todo
	
}

/**
testTest.prototype.testDeleteSong1 = function() {
	var callBackResult;
	var output1;
	var output2;	
	/***
	 * Offset, length, ,query, callback, errorHandler
	 */
/**	pac.getSongs(0,2,"",function(data){
		output1 = data.length;
	}, printF);
	
	pac.deleteSong(2, function(data){
		console.log(data);
		callBackResult = data;
	}, printF);
	
	pac.getSongs(0,2,"",function(data){
		output2 = data.length;
	}, printF);
	
	
	//assertEquals(callBackResult,3);
	//assertNotEquals(output1,output2);
}*/

































/**
testTest.prototype.testSomething = function(queue) {
  var state = 0;

  queue.call('Step 1: assert the starting condition holds', function() {
    assertEquals(0, state);
  });

  queue.call('Step 2: increment our variable', function() {
    ++state;
  });

  queue.call('Step 3: assert the variable\'s value changed', function() {
    assertEquals(1, state);
  });
};*/

/**
testTest.prototype.test2 = function(queue) {
	var state = 0;
	var test = "";

	queue.call('Step 1: assert the starting condition holds', function(callbacks) {
		var myCallBack = callbacks.add(function(){
			pac.getSong(1, function(data){
				var array= data.split("\n",1);
				var string = array.shift();

				test = string;
				console.log(test);
			}, printF);
		});
	});

	queue.call('Step 2: increment our variable', function(callbacks) {
		var callback2 = callbacks.add(function(){
			console.log(test + "nya");
		});		
	});

	queue.call('Step 3: assert the variable\'s value changed', function() {
		assertEquals(0, state);
	});
};*/