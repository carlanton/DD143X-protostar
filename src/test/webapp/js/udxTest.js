udxTest = TestCase("udxTest");

//Set-Up
testString1 = "#ARTIST:Marten\n#TITLE:Du ar sa fin\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";

var u1 = new UdxFormatParser(function(error){console.log(error)}); 
var song1 = u1.parse(testString1);
//#ENCODING:AUTO\n#COVER:Marten - du.jpeg\n#BACKGROUND:Marten - ar.jpeg\n#GENRE:Techno


udxTest.prototype.testMandatoryHeader1 = function() {
	//assertEquals("AUTO", song1.encoding);
	assertEquals("Du ar sa fin",song1.title);
	assertEquals("Marten",song1.artist);
	assertEquals("Marten - du.mp3",song1.mp3);	
	assertEquals("500",song1.bpm);	
	assertEquals("0",song1.gap);	
	//assertEquals("Marten - du.jpeg", song1.cover);
	//assertEquals("Marten - hej.jpeg", song1.backgorund);
	//assertEquals("Techno",song1.genre);	
};

udxTest.prototype.testAmountOfScenes1 = function() {	 
	assertEquals(2,song1.scenes.length);
};

udxTest.prototype.testAmountOfSyllables1 = function() {
	var counter = 0;
	var i = 0;
	for(i = 0; i < song1.scenes.length; i++){
		var scene1 = song1.scenes[i];
		var syllables1 = scene1.syllables;
		var length = syllables1.length;
		counter = counter + length;
	} 
	assertEquals(9,counter);	
};

udxTest.prototype.testSyllables1 = function(){
	var rows = testString1.split("\n");
	var i = 0;
	var scenes = song1.scenes;

	while(rows[i].match("#")){
		i++;
	}
	for(var j=0; j < scenes.length;j++){
		for(var k=0; k < scenes[j].length;j++){

		}
	}
	/*
	for(var j=i;j<rows.length;j++){
		console.log(rows[j]);
	}*/
};








/**("id","title","artist","mp3","bpm","gap","cover","background","genre","relative","edition","language","videourl","videogap","videoresolution","start");


        song.id
        song.encoding
        song.title
        song.artist
        song.mp3
        song.bpm
        song.gap
        song.cover
        song.backgorund
        song.genre
        song.relative
        song.edition
        song.language
        song.videourl
        song.videogap
        song.videoresolution
        song.start
 */
