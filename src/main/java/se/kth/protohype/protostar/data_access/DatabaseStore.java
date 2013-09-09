package se.kth.protohype.protostar.data_access;

import java.sql.SQLException;
import java.util.List;

import se.kth.protohype.protostar.structs.GameResult;
import se.kth.protohype.protostar.structs.RawSong;
import se.kth.protohype.protostar.structs.SongInfo;

/**
 * A {@link DatabaseStore} is what the application should use to talk to the database.
 * We have divided this into an interface and an implementation separately so that a different
 * implementation can easily be dropped in. 
 * 
 * The default implementation is {@link DatabaseStoreImplSQLite}.
 * 
 * @author ansjob
 *
 */
public interface DatabaseStore {
	/**
	 * Adds a song to the database.
	 * 
	 * @param udx
	 *            The UDX text-file associated with the song
	 * @param title
	 *            The title of the song
	 * @param artistName
	 *            The Artist's name.
	 * @return the ID of the inserted song.
	 * @throws SQLException
	 */
	public int addSong(RawSong udx, String title, String artistName,
			String fileExtension) throws SQLException;

	/**
	 * Updates a song in the database.
	 * 
	 * @param songId
	 *            The song's id
	 * @param udx
	 *            The UDX-textfile to associate the song with.
	 * @param title
	 *            The new title of the song.
	 * @param artistName
	 *            The new artist's name.
	 * @throws SQLException
	 *             if the song didn't exist in the database. No insert of this
	 *             data is done in this case.
	 */
	public void updateSong(int songId, RawSong udx, String title,
			String artistName) throws SQLException;

	public void updateSong(int songId, String fileExtension) throws SQLException;

	public void updateSong(int songId, RawSong udx, String fileExtension,
			String title, String artist) throws SQLException;

	/**
	 * Deletes a song from the database.
	 * 
	 * @param songId
	 * @return The UDX-textfile associated with the song that was deleted from
	 *         the database. Null if the song did not exist.
	 * @throws SQLException
	 */
	public RawSong deleteSong(int songId) throws SQLException;

	/**
	 * Fetches a Song from the database.
	 * 
	 * @param id
	 * @return The song with the ID specified or null if no song with that ID
	 *         exists.
	 * @throws SQLException
	 *             if there's a IO Error.
	 */
	public SongInfo getSong(int id) throws SQLException;

	/**
	 * Searches the database for songs where the title or artist's name matches
	 * the query.
	 * 
	 * @param length
	 *            the maximum length of the result (may be shorter)
	 * @param offset
	 *            The offset in number of records (as opposed to pages)
	 * @param query
	 * @return
	 * @throws SQLException
	 */
	public List<SongInfo> getSongList(int length, int offset, String query)
			throws SQLException;

	/**
	 * Gets the song list, sorted by songId descending.
	 * 
	 * @param length
	 *            the maximum length of the result (may be shorter)
	 * @param offsetclearDatabase
	 *            The offset in number of records (as opposed to pages)
	 * @return
	 * @throws SQLException
	 */
	public List<SongInfo> getSongList(int length, int offset)
			throws SQLException;

	/**
	 * Is equivalent to getSongList(10, 0);
	 * 
	 * @return
	 * @throws SQLException
	 */
	public List<SongInfo> getSongList() throws SQLException;

	/**
	 * @return The total number of songs in the database.
	 * @throws SQLException
	 */
	public int getNumberOfSongs() throws SQLException;

	/**
	 * @return The total number of songs in the database matching the query.
	 * @param query
	 *            The search term to match against.
	 * @throws SQLException
	 */
	public int getNumberOfSongs(String query) throws SQLException;

	/**
	 * Stores a gameResult in the database.
	 * 
	 * @param gameResult
	 *            The result to store.
	 * @throws SQLException
	 *             if the associated song doesn't exist or there's another IO
	 *             error.
	 */
	public int putGameResult(GameResult gameResult) throws SQLException;

	/**
	 * Gets the highscore for a certain song from the database.
	 * 
	 * @param songId
	 *            the ID of the song.
	 * @param length
	 *            The maximum result length
	 * @param offset
	 *            the number of records to skip.
	 * @return
	 * @throws SQLException
	 */
	public List<GameResult> getGameResultList(int songId, int length, int offset)
			throws SQLException;

	/**
	 * @param songId
	 *            The ID of the song in the database.
	 * @return A {@link RawSong} object if it's found in the database, or null.
	 * @throws SQLException
	 *             if a communication error with the database arises.
	 */
	public RawSong getUdxFile(int songId) throws SQLException;

	/**
	 * Fetches the data associated with one play-through of a song.
	 * 
	 * @param resultId of that play-through
	 * @return A GameResult of that play-through
	 * @throws SQLException
	 */
	public GameResult getGameResult(int resultId) throws SQLException;

	/**
	 * Fetches the file extension of a certain song.
	 * @param id the song to get the file extension for
	 * @return the file extension matching the id
	 * @throws SQLException
	 */
	public String getFileExtension(int id) throws SQLException;

	/**
	 * Empties all data from the database.
	 * @throws SQLException if an I/O error occurs.
	 */
	public void clearDatabase() throws SQLException;

}
