udxTestParser = TestCase("udxTestParser");

var u = new UdxFormatParser(function(error){console.log(error)});

udxTestParser.prototype.testParsing1 = function(){
	testString2 = "#BACKGROUND:Marten - Du ar sa fin [BG].jpg\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString2);
};

udxTestParser.prototype.testParsing2 = function(){
	testString3 = "#ENCODING:AUTO\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString3);
};

udxTestParser.prototype.testParsing3 = function(){
	testString4 = "#COVER:Marten - Du ar sa fin [CO].jpg\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString4);
};

udxTestParser.prototype.testParsing4 = function(){
	testString5 = "#LANGUAGE:Swedish\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString5);
};

udxTestParser.prototype.testParsing5 = function(){
	testString6 = "#GENRE:Techno\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString6);
};

udxTestParser.prototype.testParsing6 = function(){
	testString7 = "#EDITION:Original\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString7);
};

udxTestParser.prototype.testParsing7 = function(){
	testString8 = "#VIDEO:Marten - Du ar sa fin.avi\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString8);
};

udxTestParser.prototype.testParsing8 = function(){
	testString9 = "#VIDEOGAP:0\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString9);
};

udxTestParser.prototype.testParsing9 = function(){
	testString10 = "#START:0\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString10);
};

udxTestParser.prototype.testParsing10 = function(){
	testString11 = "#END:0\n#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString11);
};

udxTestParser.prototype.testParsing11 = function(){
	testString12 = "#TITLE:Du ar sa fin\n#ARTIST:Marten\n#MP3:Marten - du.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n: 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n: 21 23 9 fin\nE";
	u.parse(testString12);
};
