package se.kth.protohype.protostar;


import java.io.File;
import java.io.IOException;
import java.sql.SQLException;

import org.junit.After;
import org.junit.BeforeClass;
import org.junit.Ignore;

import se.kth.protohype.protostar.server_logic.ServerSongsLogic;
import se.kth.protohype.protostar.structs.RawSong;

public class ServerAdminLogicTest extends DatabaseTest {

	static String udxSnook = "#TITLE:Svett och tarar\n#ARTIST:Snook\n#MP3:Snook - Snook.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";
	String udxSnook_update = "#TITLE:Koper kott\n#ARTIST:Dr Ash\n#MP3:Snook - Snook.mp3\n#BPM:500\n#GAP:0\n: 0 3 4 hej\n" +
			": 3 5 6 du\n: 5 7 9 ar\n: 7 9 9 sa\n: 9 11 9 fin\n- 13\n: 15 17 9 du\n: 17 19 9 ar\n: 19 21 9 sa\n" +
			": 21 23 9 fin\nE";	
	
	static File snookF, karateF;
	static RawSong snookRS, karateRS;

	@BeforeClass
	public static void setup() {
		snookF = new File("testfiler/Snook.mp3");
		snookRS = new RawSong(udxSnook);
	}
	
	@Ignore
	public void printSongs() throws SQLException {
		RawSong rs = db.getUdxFile(1);
	}
/*
	@Test
	public void testAddSong() throws IOException {
		int a = ServerSongsLogic.getNumberOfSongs();

		InputStream is = new FileInputStream(snookF);
		byte[] buffer = IOUtils.toByteArray(is);		
		InputStream audio = new ByteArrayInputStream(buffer);
		
		int id = -1;
		for(int i = 0; i<10; i++) {
			id = ServerAdminLogic.newSong(audio, snookRS);
			//rsCompare = ServerSongsLogic.getRawSong(id);
			//System.out.println(id + ". " + rsCompare.getArtist() + " - " + rsCompare.getTitle());
		}		
		int b = ServerSongsLogic.getNumberOfSongs();
		assertEquals(a+10, b);
	}

	@Test
	public void testUpdateSong() throws IOException {
		int a = ServerSongsLogic.getNumberOfSongs();
		
		/**RawSong rsCompare = ServerSongsLogic.getRawSong(1);
		assertEquals("Snook", rsCompare.getArtist());
		assertEquals("Svett och tarar", rsCompare.getTitle());
		*		
		
		InputStream is = new FileInputStream(snookF);
		byte[] buffer = IOUtils.toByteArray(is);		
		InputStream audio = new ByteArrayInputStream(buffer);

		RawSong snookRs_update = new RawSong(udxSnook_update);

		ServerAdminLogic.updateSong(1, audio, snookRs_update);
		
		/**rsCompare = ServerSongsLogic.getRawSong(1);
		assertEquals("Dr Ash", rsCompare.getArtist());
		assertEquals("Koper kott", rsCompare.getTitle());
		*
		int b = ServerSongsLogic.getNumberOfSongs();
		assertEquals(a, b);
		
	}


	@Test
	public void testDeleteSong() throws IOException {
		int a = ServerSongsLogic.getNumberOfSongs();
		byte[] testVector = {0x01, 0x02, 0x7f};
		InputStream audio = new ByteArrayInputStream(testVector);
		int id = db.addSong(new RawSong("test"), "test", "test", audio);
		db.deleteSong(id);
		int b = ServerSongsLogic.getNumberOfSongs();
		assertEquals(a, b);
	}
*/
	@After
	public void printSong() throws IOException {
		RawSong rs;
		//System.out.println("******* Print 10 songs ******* ");
		for(int i = 1; i<=10; i++) {
			try {
				rs = ServerSongsLogic.getRawSong(i);
				//System.out.println( i + ". " + rs.getArtist() + " - "+ rs.getTitle());
			}
			catch (Exception e) {				
			}			
		}
		//System.out.println("******* Done printing 10 songs ******* ");
	}
	
}
