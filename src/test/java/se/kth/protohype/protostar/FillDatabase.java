package se.kth.protohype.protostar;

import java.sql.SQLException;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.structs.RawSong;

public class FillDatabase {

	String udxSnook = "#TITLE:Svett och tarar\n#ARTIST:Snook\n#MP3:Snook - Snook.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	String udxFloRida= "#TITLE:Good feeling\n#ARTIST:FloRida\n#MP3:FloRida - Good Feeling.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	String udxByz = "#TITLE:Karatefylla\n#ARTIST:Byz\n#MP3:Byz - Karatefylla.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	String udxLMFAO = "#TITLE:Sorry for party Rocking\n#ARTIST:LMFAO\n#MP3:LMFAO - Sorry for Party Rocking.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	String udxCarter = "#TITLE:Whereever You Will Go\n#ARTIST:Carter\n#MP3:Carter - Wherever You Will Go.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	
	boolean DEBUG = false;

	public FillDatabase(DatabaseStore db){
		fillDatabase(db);
	}
	
	public void debug(String msg){
		if(DEBUG)
			System.out.println(msg);
	}
	
	public void debug(int msg){
		if(DEBUG)
			System.out.println(msg);
	}

	public void fillDatabase(DatabaseStore db) {
		int id = -1;
		
		try{
			RawSong rs = new RawSong(udxSnook);
			id = db.addSong(rs, "Snook", "Snook", "mp3");
			debug(id);
			//--------------------------------------------------
			rs = new RawSong(udxFloRida);
			id = db.addSong(rs, "Good Feeling", "FloRida", "mp3");
			debug(id);
			//--------------------------------------------------
			rs = new RawSong(udxByz);
			id = db.addSong(rs, "Karatefylla", "Byz", "mp3");
			debug(id);
			//--------------------------------------------------
			rs = new RawSong(udxLMFAO);
			id = db.addSong(rs, "Sorry for Party Rocking", "LMFAO", "mp3");
			debug(id);
			//--------------------------------------------------
			rs = new RawSong(udxCarter);
			id = db.addSong(rs, "Wherever You Will Go", "Carter", "mp3");
			debug(id);
		}
		catch(SQLException e){
			System.out.println(e);
		}
	}

}
