package se.kth.protohype.protostar.data_access;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import org.apache.log4j.Logger;

import se.kth.protohype.protostar.structs.GameEvent;
import se.kth.protohype.protostar.structs.GameResult;
import se.kth.protohype.protostar.structs.RawSong;
import se.kth.protohype.protostar.structs.SongInfo;

/**
 * <h2>This is the implementation of the database interface for our application.</h2>
 *
 * <p>To use it, one may simply do: <br/>
 * <code>
 * 		DatabaseStore db = new DatabaseStoreImplSQLite();
 * 	</code>
 * </p>
 *
 * @author Andreas Sjöberg <ansjob@kth.se>
 *
 */
public class DatabaseStoreImplSQLite implements DatabaseStore {

	private static Logger log = Logger.getLogger(DatabaseStoreImplSQLite.class);

	/* Constant declarations */
	private static final int DEFAULT_LIST_SIZE = 10;
	private static final String CONNECTION_URL = "jdbc:sqlite:protostar.db";

	/* Prepared statement declarations */
	private static final String SEARCH_SONG_STMT = "select id, title, artist from songs where title like ? or artist like ? order by artist asc limit ?, ?";
	private static final String SEARCH_COUNT_STMT = "select count(*) from songs where title like ? or artist like ?";
	private static final String GET_UDX_STMT = "select udx_file from songs where id = ?";
	private static final String GET_FILE_EXTENSION_STMT = "select file_extension from songs where id = ?";
	private static final String INSERT_GAME_RESULT_STMT = "insert into game_results values (NULL, ?, ?, ?)";

	private static final String COUNT_SONGS_STMT = "select count(*) from songs";

	private static final String INSERT_SONG_STMT = "insert into songs "
			+ "values(NULL, ?, ?, ?, ?)";

	private static final String UPDATE_SONG_NO_AUDIO_STMT = "update songs set "
			+ "title 		= ?," + "artist		= ?," + "udx_file	= ?"
			+ "	where id 	= ? ";

	private static final String UPDATE_SONG_FILE_EXTENSION_ONLY_STMT = "update songs set "
			+ "file_extension	= ?" + "	where id 	= ? ";

	private static final String UPDATE_SONG_FILE_EXTENSION_AND_UDX_STMT = "update songs set "
			+ "title 		= ?, "
			+ "artist		= ?, "
			+ "udx_file	= ?, "
			+ "file_extension = ? " + "	where id 	= ? ";

	private static final String HIGH_SCORE_STMT = "select "
			+ "s1.id as id, s1.nick as nick, s1.score as score, s1.songID as songID , count(DISTINCT s2.score) as rank from "
			+ " (select * from game_results where songID = ?) as s1 "
			+ " join (select * from game_results where songID = ?) as s2 on "
			+ " (s1.score <= s2.score) group by s1.id order by rank asc limit ?, ?";

	private static final String DELETE_SONG_STMT = "DELETE FROM songs WHERE id = ?";

	private static final String GET_SONG_STMT = "SELECT * FROM songs WHERE id = ?";

	private static final String GET_RESULT_STMT = "select * from game_results where id = ?";

	private static final String GET_EVENTS_STMT =
			"select * from game_events where resultId = ? ORDER BY frame ASC";

	private static final String INSERT_EVENTS_STMT =
			"insert or replace into game_events values("
			+ "?, ?, "
			+ "(? + coalesce((select deltaScore from game_events where resultId = ? and frame = ?), 0)))";

	/* Data definition statements below */
	private static final String CREATE_SONGS_TABLE = "CREATE TABLE IF NOT EXISTS songs("
			+ "	id 			INTEGER PRIMARY KEY,"
			+ "	title 		TEXT,"
			+ "	artist 		TEXT,"
			+ "	udx_file	TEXT,"
			+ " file_extension	VARCHAR(5)"
			+ ")";

	private static final String CERATE_GAME_RESULTS_TABLE = "CREATE TABLE IF NOT EXISTS game_results("
			+ "	id			INTEGER PRIMARY KEY,"
			+ "	nick		TEXT,"
			+ "	score		INTEGER,"
			+ "	songID		INTEGER NOT NULL,"
			+ "	FOREIGN KEY(songID) REFERENCES songs(id)" + ")";

	private static final String CREATE_GAME_EVENTS_TABLE = "CREATE TABLE IF NOT EXISTS game_events("
			+ "resultId INTEGER,"
			+ "frame INTEGER,"
			+ "deltaScore INTEGER,"
			+ "FOREIGN KEY (resultId) REFERENCES game_results(id),"
			+ "PRIMARY KEY (resultId, frame)"
			+ ")";

	private static boolean setupComplete;
	/**
	 * Get the connection.
	 * @return the connection
	 * @throws SQLException
	 */
	private static Connection getConnection() throws SQLException {
		return DriverManager.getConnection(CONNECTION_URL);
	}

	/**
	 * Setup the database handler.
	 */
	public static void setup() {
		if (!setupComplete) {
			try {
				Class.forName("org.sqlite.JDBC");

				createTables();

				setupComplete = true;
			} catch (ClassNotFoundException e) {
				log.fatal("SQLite Driver not found", e);
			} catch (SQLException e) {
				log.fatal("Couldn't create tables!", e);
			}
		}
	}


	/**
	 * Create the tables in the database
	 * @throws SQLException on error
	 */
	private static void createTables() throws SQLException {
		Connection connection = null;
		Statement statement = null;

		try {
			connection = getConnection();
			statement = connection.createStatement();
			statement.execute(CREATE_SONGS_TABLE);
			statement.execute(CERATE_GAME_RESULTS_TABLE);
			statement.execute(CREATE_GAME_EVENTS_TABLE);
		} finally {
			if (statement != null)
				statement.close();

			if (connection != null)
				connection.close();
		}
	}

	/**
	 * Instantiates the handler.
	 */

	public DatabaseStoreImplSQLite() {
		if (!setupComplete)
			setup();
	}

	@Override
	public int addSong(RawSong udx, String title, String artistName,
			String fileExtension) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		int songId = -1;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(INSERT_SONG_STMT);
			statement.setString(1, title);
			statement.setString(2, artistName);
			statement.setString(3, udx.toString());
			statement.setString(4, fileExtension);
			statement.execute();

			resultSet = statement.getGeneratedKeys();

			if (resultSet != null && resultSet.next()) {
				songId = resultSet.getInt(1);
			} else {
				log.fatal("Failed getting last inserted ID");
			}
		} finally {
			close(resultSet, statement, connection);
		}

		return songId;
	}

	@Override
	public void updateSong(int songId, RawSong udx, String title,
			String artistName) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(UPDATE_SONG_NO_AUDIO_STMT);
			statement.setString(1, title);
			statement.setString(2, artistName);
			statement.setString(3, udx.toString());
			statement.setInt(4, songId);
			statement.execute();

		} finally {
			close(statement, connection);
		}
	}

	@Override
	public void updateSong(int songId, String fileExtension) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(UPDATE_SONG_FILE_EXTENSION_ONLY_STMT);
			statement.setString(1, fileExtension);
			statement.setInt(2, songId);
			statement.execute();
		} finally {
			close(statement, connection);
		}
	}

	@Override
	public void updateSong(int songId, RawSong udx, String fileExtension,
			String title, String artist) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(UPDATE_SONG_FILE_EXTENSION_AND_UDX_STMT);
			statement.setString(1, title);
			statement.setString(2, artist);
			statement.setString(3, udx.toString());
			statement.setString(4, fileExtension);
			statement.setInt(5, songId);
			statement.execute();
		} finally {
			close(statement, connection);
		}
	}

	@Override
	public RawSong deleteSong(int songId) throws SQLException {
		RawSong udx = getUdxFile(songId);
		Connection connection = null;
		PreparedStatement statement = null;

		if (udx == null)
			return null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(DELETE_SONG_STMT);
			statement.setInt(1, songId);
			statement.execute();

		} finally {
			close(statement, connection);
		}

		return udx;
	}

	@Override
	public List<SongInfo> getSongList(int length, int offset, String query)
			throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		List<SongInfo> result = new ArrayList<SongInfo>();

		query = '%' + query + '%';

		try {
			connection = getConnection();
			statement = connection.prepareStatement(SEARCH_SONG_STMT);
			statement.setString(1, query);
			statement.setString(2, query);
			statement.setInt(3, offset);
			statement.setInt(4, length);
			statement.execute();
			resultSet = statement.getResultSet();

			while (resultSet.next()) {
				int id = resultSet.getInt("id");
				String title = resultSet.getString("title");
				String artist = resultSet.getString("artist");

				result.add(new SongInfo(id, title, artist));
			}

			return result;
		} finally {
			close(resultSet, statement, connection);
		}
	}
	/**
	 * Close open sql parts.
	 * @param resultSet
	 * @param statement
	 * @param connection
	 * @throws SQLException
	 */
	private void close(ResultSet resultSet, PreparedStatement statement, Connection connection) throws SQLException {
		if (resultSet != null)
			resultSet.close();

		if (statement != null)
			statement.close();

		if (connection != null)
			connection.close();
	}

	/**
	 * Close open sql part
	 * @param statement
	 * @param connection
	 * @throws SQLException
	 */
	private void close(PreparedStatement statement, Connection connection) throws SQLException {
		close(null, statement, connection);
	}

	@Override
	public List<SongInfo> getSongList(int length, int offset)
			throws SQLException {
		return getSongList(length, offset, "");
	}

	@Override
	public List<SongInfo> getSongList() throws SQLException {
		return getSongList(DEFAULT_LIST_SIZE, 0);
	}

	@Override
	public SongInfo getSong(int id) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		SongInfo songInfo = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(GET_SONG_STMT);
			statement.setInt(1, id);
			statement.execute();
			resultSet = statement.getResultSet();

			if (resultSet != null && resultSet.next()) {
				String title = resultSet.getString("title");
				String artist = resultSet.getString("artist");

				songInfo = new SongInfo(id, title, artist);
			}

		} finally {
			close(resultSet, statement, connection);
		}

		return songInfo;
	}

	@Override
	public RawSong getUdxFile(int songId) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		String rawSongString = null;
		RawSong rawSong = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(GET_UDX_STMT);
			statement.setInt(1, songId);
			statement.execute();
			resultSet = statement.getResultSet();

			if (resultSet != null && resultSet.next()) {
				rawSongString = resultSet.getString(1);
			}
		} finally {
			close(resultSet, statement, connection);
		}

		if (rawSongString != null)
			rawSong = new RawSong(rawSongString);

		return rawSong;
	}

	@Override
	public int getNumberOfSongs() throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		int numberOfSongs = -1;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(COUNT_SONGS_STMT);
			statement.execute();

			resultSet = statement.getResultSet();

			if (resultSet != null && resultSet.next())
				numberOfSongs = resultSet.getInt(1);
		} finally {
			close(resultSet, statement, connection);
		}

		return numberOfSongs;
	}

	@Override
	public int getNumberOfSongs(String query) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;
		int numberOfSongs = -1;

		query = '%' + query + '%';

		try {
			connection = getConnection();
			statement = connection.prepareStatement(SEARCH_COUNT_STMT);

			statement.setString(1, query);
			statement.setString(2, query);
			statement.execute();

			resultSet = statement.getResultSet();

			if (resultSet != null && resultSet.next())
				numberOfSongs = resultSet.getInt(1);
		} finally {
			close(resultSet, statement, connection);
		}

		return numberOfSongs;
	}

	@Override
	public int putGameResult(GameResult gameResult) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		PreparedStatement statement2 = null;
		ResultSet resultSet = null;

		try {
			connection = getConnection();
			connection.setAutoCommit(false);
			statement = connection.prepareStatement(INSERT_GAME_RESULT_STMT);
			statement.setString(1, gameResult.getNickname());
			statement.setInt(2, gameResult.getResult());
			statement.setInt(3, gameResult.getSongId());
			statement.execute();

			resultSet = statement.getGeneratedKeys();
			int resultId = resultSet.getInt(1);
			resultSet.close();
			log.debug("Saved gameresult with id: " + resultId);

			statement2 = connection.prepareStatement(INSERT_EVENTS_STMT);

			for (GameEvent ev : gameResult.getEvents()) {
				statement2.setInt(1, resultId);
				statement2.setInt(2, ev.getBeat());
				statement2.setInt(3, ev.getScoreDelta());
				statement2.setInt(4, resultId);
				statement2.setInt(5, ev.getBeat());
				statement2.addBatch();
			}
			statement2.executeBatch();
			connection.commit();
			return resultId;

		} finally {
			if (resultSet != null)
				resultSet.close();

			if (statement != null)
				statement.close();

			if (statement2 != null)
				statement2.close();

			if (connection != null)
				connection.close();
		}
	}

	@Override
	public List<GameResult> getGameResultList(int songId, int length, int offset)
			throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;

		List<GameResult> results = new ArrayList<GameResult>(length);

		try {
			connection = getConnection();
			statement = connection.prepareStatement(HIGH_SCORE_STMT);
			statement.setInt(1, songId);
			statement.setInt(2, songId);
			statement.setInt(3, offset);
			statement.setInt(4, length);
			statement.execute();

			resultSet = statement.getResultSet();

			while (resultSet != null && resultSet.next()) {
				int id = resultSet.getInt("id");
				int score = resultSet.getInt("score");
				String nick = resultSet.getString("nick");
				int songID = resultSet.getInt("songID");
				int rank = resultSet.getInt("rank");

				results.add(new GameResult(id, score, nick, songID, rank));
			}
		} finally {
			close(resultSet, statement, connection);
		}

		return results;
	}

	@Override
	public GameResult getGameResult(int resultId) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		PreparedStatement statement2 = null;
		ResultSet resultSet = null;
		ResultSet eventsResult = null;

		GameResult gameResult = null;
		List<GameEvent> events = new LinkedList<GameEvent>();

		try {
			connection = getConnection();
			statement = connection.prepareStatement(GET_RESULT_STMT);
			statement.setInt(1, resultId);
			statement.execute();

			resultSet = statement.getResultSet();

			if (resultSet != null && resultSet.next()) {
				gameResult = new GameResult(resultSet.getInt("id"),
						resultSet.getInt("score"),
						resultSet.getString("nick"),
						resultSet.getInt("songID"),
						0);

				resultSet.close();

				gameResult.setEvents(events);

				/* Fetching events related to this resultId*/
				statement2 = connection.prepareStatement(GET_EVENTS_STMT);
				statement2.setInt(1, resultId);
				eventsResult = statement2.executeQuery();

				while (eventsResult != null && eventsResult.next()) {
					int beat = eventsResult.getInt("frame");
					int deltaScore = eventsResult.getInt("deltaScore");

					events.add(new GameEvent(beat, deltaScore));
				}
			}
		} finally {
			if (resultSet != null)
				resultSet.close();

			if (eventsResult != null)
				eventsResult.close();

			if (statement != null)
				statement.close();

			if (statement2 != null)
				statement2.close();

			if (connection != null)
				connection.close();
		}

		return gameResult;
	}

	@Override
	public void clearDatabase() throws SQLException {
		Connection connection = null;
		Statement statement = null;

		try {
			connection = getConnection();
			statement = connection.createStatement();
			statement.execute("DELETE FROM songs");
			statement.execute("DELETE FROM game_results");
		} finally {
			if (statement != null)
				statement.close();

			if (connection != null)
				connection.close();
		}
	}


	@Override
	public String getFileExtension(int id) throws SQLException {
		Connection connection = null;
		PreparedStatement statement = null;
		ResultSet resultSet = null;

		String fileExtension = null;

		try {
			connection = getConnection();
			statement = connection.prepareStatement(GET_FILE_EXTENSION_STMT);
			statement.setInt(1, id);
			statement.execute();

			resultSet = statement.getResultSet();
			if (resultSet != null && resultSet.next()) {
				fileExtension = resultSet.getString(1);
			}

		} finally {
			close(resultSet, statement, connection);
		}

		return fileExtension;
	}
}
