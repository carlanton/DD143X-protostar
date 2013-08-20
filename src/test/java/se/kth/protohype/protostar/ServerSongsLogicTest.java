package se.kth.protohype.protostar;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;
import se.kth.protohype.protostar.server_logic.ServerSongsLogic;
import se.kth.protohype.protostar.structs.RawSong;
import se.kth.protohype.protostar.structs.SongInfo;

public class ServerSongsLogicTest extends DatabaseTest {

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

	
	@Before
	public void fillDatabase() {
		DatabaseStore db = new DatabaseStoreImplSQLite();
		new FillDatabase(db);
	}

	@Test
	public void testGetRawSong() throws SQLException {
		RawSong expected = new RawSong(udxSnook);
		RawSong actual = ServerSongsLogic.getRawSong(1);
		assertEquals(expected.getArtist(), actual.getArtist());
		assertEquals(expected.getMp3(), actual.getMp3());
		assertEquals(expected.getTitle(), actual.getTitle());
		assertEquals(expected.getUdx(), actual.getUdx());

		expected = new RawSong(udxFloRida);
		actual = ServerSongsLogic.getRawSong(2);
		assertEquals(expected.getArtist(), actual.getArtist());
		assertEquals(expected.getMp3(), actual.getMp3());
		assertEquals(expected.getTitle(), actual.getTitle());
		assertEquals(expected.getUdx(), actual.getUdx());

		expected = new RawSong(udxByz);
		actual = ServerSongsLogic.getRawSong(3);
		assertEquals(expected.getArtist(), actual.getArtist());
		assertEquals(expected.getMp3(), actual.getMp3());
		assertEquals(expected.getTitle(), actual.getTitle());
		assertEquals(expected.getUdx(), actual.getUdx());

		expected = new RawSong(udxLMFAO);
		actual = ServerSongsLogic.getRawSong(4);
		assertEquals(expected.getArtist(), actual.getArtist());
		assertEquals(expected.getMp3(), actual.getMp3());
		assertEquals(expected.getTitle(), actual.getTitle());
		assertEquals(expected.getUdx(), actual.getUdx());

		expected = new RawSong(udxCarter);
		actual = ServerSongsLogic.getRawSong(5);
		assertEquals(expected.getArtist(), actual.getArtist());
		assertEquals(expected.getMp3(), actual.getMp3());
		assertEquals(expected.getTitle(), actual.getTitle());
		assertEquals(expected.getUdx(), actual.getUdx());
	}

	@Test
	public void getIllegalRawSong() throws SQLException {
		RawSong actual = ServerSongsLogic.getRawSong(100);
		assertEquals(actual,null);
	}

	//Get song list
	@Test
	public void testGetSongList() throws SQLException {
		/*
		 * This test is invalid, because the server (as expected)
		 * sorts the results according to artist. A more suitable test
		 * would be to assert that the expected songs are among the results.
		 * 
		 *	// ansjob
		 */
		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList();		
		boolean found;

		for (int i = 0; i<5; i++) {
			found = false;
			for (int j = 0; j<5; j++) {
				if(expected.get(i).getArtist().equals(actual.get(j).getArtist())) {
					found = true;
					break;
				}
			}
			if(!found)
				fail("Didn't find song");
		}
	}

	//Get song list
	@Test(expected=IndexOutOfBoundsException.class)
	public void testGetSongList2() throws SQLException {
		List<SongInfo> actual = new ArrayList<SongInfo>();
		actual = ServerSongsLogic.getSongList();
		SongInfo o = actual.get(5);
	}

	//Get song list with length and offset
	@Test
	public void testGetSongListLO() throws SQLException {
		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();
		
		/*
		 * This test is also invalid since the results are sorted by artist's name.
		 */

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(5,0);
		boolean found;
		
		for (int i = 0; i<5; i++) {
			found = false;
			for (int j = 0; j<5; j++) {
				if(expected.get(i).getArtist().equals(actual.get(j).getArtist())) {
					found = true;
					break;
				}
			}
			if(!found)
				fail("Didn't find song");
		}
	}

	//Get song list with length and offset
	@Test
	public void testGetSongListLO2() throws SQLException {
		/*
		 * This test is invalid because of the misconception of the offset
		 * usage discussed with mpals. 
		 */
		List<SongInfo> expected = new ArrayList<SongInfo>();
		List<SongInfo> actual = new ArrayList<SongInfo>();

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = ServerSongsLogic.getSongList(2,0);	
		if(actual.size() > 2)
			fail("Array to fat");
		
		boolean found;		
		for (int i = 0; i<2; i++) {
			found = false;
			for (int j = 0; j<5; j++) {
				if(expected.get(j).getArtist().equals(actual.get(i).getArtist())) {
					found = true;
					break;
				}
			}
			if(!found)
				fail("Didn't find song");
		}
	}

	//Get song list with length, offset and query
	@Test
	public void testGetSongListLOQ() throws SQLException {
		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		/*
		 * This test is also invalid because of the sorting of the results
		 */
		
		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(5,0,"");
		boolean found;
		
		for (int i = 0; i<5; i++) {
			found = false;
			for (int j = 0; j<5; j++) {
				if(expected.get(i).getArtist().equals(actual.get(j).getArtist())) {
					found = true;
					break;
				}
			}
			if(!found)
				fail("Didn't find song");
		}
	}

	//Get song list with length, offset and query
	@Test
	public void testGetSongListLOQ1() throws SQLException {
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		String query = "LMFAO";
		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(5,0,query);
		assertEquals(query, actual.get(0).getArtist());
		if(actual.size() != 1)
			fail("There should only be one song: " + query);
	}

	//Get song list with length, offset and query
	@Test
	public void testGetSongListLOQ2() throws SQLException {
		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(2,1,"");
		if(actual.size() > 2)
			fail("Array to fat");
		
		boolean found;		
		for (int i = 0; i<2; i++) {
			found = false;
			for (int j = 0; j<5; j++) {
				if(expected.get(j).getArtist().equals(actual.get(i).getArtist()))
					found = true;
			}
			if(!found)
				fail("Didn't find song");
		}
	}

	//Get song list with length, offset and query
	@Test
	public void testGetSongListLOQ3() throws SQLException {
		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(5,0,"s");
		if(actual.size() > 2)
			fail("Actual array larger than");
		boolean found = false;
		
		if (expected.get(0).getArtist().equals(actual.get(0).getArtist()))
			found = true;
		if (expected.get(3).getArtist().equals(actual.get(0).getArtist()))
			found = true;
		if (!found)
			fail("Didn't find song using query 's'");
		
		found = false;
		
		if (expected.get(0).getArtist().equals(actual.get(1).getArtist()))
			found = true;
		if (expected.get(3).getArtist().equals(actual.get(1).getArtist()))
			found = true;
		if (!found)
			fail("Didn't find song using query 's'");
	}

	//Get song list with length, offset and query
	@Test
	public void testGetSongListLOQ4() throws SQLException {

		ArrayList<SongInfo> expected = new ArrayList<SongInfo>();
		ArrayList<SongInfo> actual = new ArrayList<SongInfo>();

		expected.add(db.getSong(1));
		expected.add(db.getSong(2));
		expected.add(db.getSong(3));
		expected.add(db.getSong(4));
		expected.add(db.getSong(5));

		actual = (ArrayList<SongInfo>) ServerSongsLogic.getSongList(5,1,"S");
		assertEquals(expected.get(0).getArtist(), actual.get(0).getArtist());
		
	}

	@Test
	public void testNumberOfSongs() throws SQLException {
		assertEquals(5,ServerSongsLogic.getNumberOfSongs());
	}

	//Get number of song with query
	@Test
	public void testNumberOfSongsQ() throws SQLException {
		String query1 = "S";
		String query2 = "LMFAO";
		String query3 = "Good Feeling";
		
		assertEquals(2,ServerSongsLogic.getNumberOfSongs(query1));
		assertEquals(1,ServerSongsLogic.getNumberOfSongs(query2));
		assertEquals(1,ServerSongsLogic.getNumberOfSongs(query3));
	}
}
