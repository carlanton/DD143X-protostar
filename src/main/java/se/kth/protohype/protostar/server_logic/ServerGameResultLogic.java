package se.kth.protohype.protostar.server_logic;

import java.sql.SQLException;
import java.util.List;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;
import se.kth.protohype.protostar.structs.GameResult;

/**
 * The logic that deals with fetching, storing, and querying
 * the databse for gameresults.
 */
public class ServerGameResultLogic {
	private static DatabaseStore db = new DatabaseStoreImplSQLite();

	/**
	 * puts a game result to the database
	 * @param result the game result to store
	 */
	public static int putGameResult(GameResult result) throws SQLException {
		return db.putGameResult(result);
	}

	/**
	 * Gets a list of game results from the specified song in parameter songId
	 * from the database in the length of parameter length
	 * and from the offset of parameter offset.
	 * @param songId song to get results from
	 * @param length length of the list
	 * @param offset start offset from total list of game results
	 * @return A List of GameResult objects
	 */
	public static List<GameResult> getGameResultList(int songId, int length, int offset) throws SQLException {
		return db.getGameResultList(songId, length, offset);
	}
	/**
	 * get a single game result from the database
	 * @param resultId the result to get
	 * @return A GameResult object if the requested result exists, else null
	 */
	public static GameResult getGameResult(int resultId) throws SQLException {
		return db.getGameResult(resultId);
	}
}
