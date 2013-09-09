udxViktor = TestCase("udxViktor");

udxViktor.prototype.testSyllableNoMatch = function(){
	assertException("accepts scenendingline", new Syllable("- 1"), Syllable.NOMATCH);
	assertException("accepts scenendingline", new Syllable("- 1 1"), Syllable.NOMATCH);
	
	assertException("accepts illigal number of 'arguments' in string", new Syllable(":"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1 1"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1 1 1"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1 1 1 a a"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1 1 1 a a a"), Syllable.NOMATCH);
	assertException("accepts illigal number of 'arguments' in string", new Syllable(": 1 1 1 a a a a"), Syllable.NOMATCH);
};

udxViktor.prototype.testSyllableType = function(){
	normal = new Syllable("- 1 1 1 a");
	assertEquals("wrong type on syllable", normal.type, "normal");
	bonus = new Syllable("* 1 1 1 a");
	assertEquals("wrong type on syllable", bonus.type, "bonus");
	freestyle = new Syllable("F 1 1 1 a");
	assertEquals("wrong type on syllable", freestyle.type, "freestyle");
};


udxViktor.prototype.testSyllableSymbols = function(){
	syll = new Syllable("- 1 1 1 a.");
	assertEquals("dont accept . in syllable", syll.text, "a.");
	syll = new Syllable("- 1 1 1 a,");
	assertEquals("dont accept , in syllable", syll.text, "a,");
	syll = new Syllable("- 1 1 1 a~");
	assertEquals("dont accept ~ in syllable", syll.text, "a~");
	syll = new Syllable("- 1 1 1 å");
	assertEquals("dont accept å in syllable", syll.text, "å");
	syll = new Syllable("- 1 1 1 ä");
	assertEquals("dont accept ä in syllable", syll.text, "ä");
	syll = new Syllable("- 1 1 1 ö");
	assertEquals("dont accept ö in syllable", syll.text, "ö");
	syll = new Syllable("- 1 1 1 Å");
	assertEquals("dont accept Å in syllable", syll.text, "Å");
	syll = new Syllable("- 1 1 1 Ä");
	assertEquals("dont accept Ä in syllable", syll.text, "Ä");
	syll = new Syllable("- 1 1 1 Ö");
	assertEquals("dont accept Ö in syllable", syll.text, "Ö");
	syll = new Syllable("- 1 1 1 1");
	assertEquals("dont accept 1 in syllable", syll.text, "1");
	syll = new Syllable("- 1 1 1 a-");
	assertEquals("dont accept - in syllable", syll.text, "a-");
	syll = new Syllable("- 1 1 1 \"a\"");
	assertEquals("dont accept \" in syllable", syll.text, "\"a\"");
	syll = new Syllable("- 1 1 1 a:");
	assertEquals("dont accept : in syllable", syll.text, "a:");
	syll = new Syllable("- 1 1 1  a");
	assertEquals("dont accept space before word in syllable", syll.text, " a");
	syll = new Syllable("- 1 1 1 a ");
	assertEquals("dont accept space after word in syllable", syll.text, "a ");
};

udxViktor.prototype.testSyllableFunctions = function(){
	syll = new Syllable("- 1 2 3 a");
	assertEquals("Wrong type", syll.type, Syllable.NORMAL);
	assertEquals("Wrong startbeat", syll.startBeat, 1);
	assertEquals("Wrong number of beats", syll.beats, 2);
	assertEquals("Wrong tone", syll.tone, 3);
	assertEquals("Wrong text", syll.text, "a");
	
};


