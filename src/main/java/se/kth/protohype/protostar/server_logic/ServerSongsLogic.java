package se.kth.protohype.protostar.server_logic;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;
import se.kth.protohype.protostar.data_access.FileDA;
import se.kth.protohype.protostar.structs.RawSong;
import se.kth.protohype.protostar.structs.SongInfo;

/**
 * The logic to deal with fetching songs, and querying the song database.
 */
public class ServerSongsLogic {

	private static DatabaseStore db = new DatabaseStoreImplSQLite();

	/**
	 * Get the RawSong with corresponding songId.
	 *
	 * @param songId of the song to get
	 * @return the RawSong with corresponding songId
	 * @throws IOException on database error.
	 */
	public static RawSong getRawSong(int songId) throws SQLException {
		return db.getUdxFile(songId);
	}

	/**
	 * Get a list of all songs.
	 *
	 * @return an array of all songs
	 * @throws IOException on database error
	 */
	public static List<SongInfo> getSongList() throws SQLException {
		return db.getSongList();
	}

	/**
	 * Get a list of all songs within length and offset limits.
	 *
	 * @param length how many songs to get
	 * @param offset where to start
	 * @return an array of all songs
	 * @throws IOException on database error
	 */
	public static List<SongInfo> getSongList(int length, int offset) throws SQLException {
		return db.getSongList(length, offset);
	}

	/**
	 * Get a list of all songs matching the search query within length and
	 * offset limits.
	 *
	 * @param length how many songs to get
	 * @param offset where to start
	 * @param query with search terms
	 * @return an array of all songs
	 * @throws IOException on database error
	 */
	public static List<SongInfo> getSongList(int length, int offset, String query) throws SQLException {
		return db.getSongList(length, offset, query);
	}

	/**
	 * Get the total number of songs.
	 *
	 * @return the number of songs.
	 * @throws IOException on database error
	 */
	public static int getNumberOfSongs() throws SQLException {
		return db.getNumberOfSongs();
	}

	/**
	 * Get the total number of songs matching the search query.
	 *
	 * @param query with the search terms
	 * @return the total number of songs matching the search query
	 * @throws IOException on database error
	 */
	public static int getNumberOfSongs(String query) throws SQLException {
		return db.getNumberOfSongs(query);
	}

	/**
	 * Get the song meta data for a given track
	 *
	 * @param id the song to fetch meta data for
	 * @return the meta data of the song
	 * @throws IOException on database error
	 */
	public static SongInfo getSongInfo(int id) throws SQLException {
		return db.getSong(id);
	}

	/**
	 * @return the filename of the song's audio relative audio/
	 * @throws IOException if there is a problem querying the DB.
	 */
	public static String getFilename(int songId) throws IOException {
		try {
			String extension = db.getFileExtension(songId);
			return FileDA.getFilename(songId, extension);
		} catch (SQLException ex) {
			throw new IOException(ex);
		}
	}
}
