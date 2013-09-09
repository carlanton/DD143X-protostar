package se.kth.protohype.protostar.structs;

import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.google.gson.annotations.Expose;
import java.util.ArrayList;

/**
 * A GameResult models one play-through of a song,
 * it keeps track of the score, which song it concerns,
 * the nickname the user supplied, and a list of the game events.
 *
 * If the structure was fetched from the database, the databse will
 * populate it with an id and rank as well.
 */
@XmlRootElement
public class GameResult {

	public static final int UNKNOWN = -1;
	private int id;
	@Expose
	private int result;
	@Expose
	private String nickname;
	private int songId;
	private int rank;
	@Expose
	private List<GameEvent> events;


	@SuppressWarnings("unused")
	// For JSON-serialization
	private GameResult() {
	}

	/**
	 * Instantiates this data structure.
	 * @param id
	 * @param result
	 * @param nickname
	 * @param songId
	 * @param rank
	 */
	public GameResult(int id, int result, String nickname, int songId, int rank) {
		this.id = id;
		this.result = result;
		this.nickname = nickname;
		this.songId = songId;
		this.rank = rank;
		this.events = new ArrayList<GameEvent>();
	}



	/**
	 * Get the id of the game result
	 *
	 * @return id of game result as int
	 */
	public int getId() {
		return id;
	}

	/**
	 * Get the result of this game result
	 *
	 * @return the result as int
	 */
	public int getResult() {
		return result;
	}

	/**
	 * set the result of this game result
	 *
	 * @param result
	 *            to set as int
	 */
	public void setResult(int result) {
		this.result = result;
	}

	/**
	 * Get the nickname of the one who did this game result
	 *
	 * @return the nickname as String
	 */
	public String getNickname() {
		return nickname;
	}

	/**
	 * set the nickname of this game result
	 *
	 * @param nickname
	 *            of the one who did the result as String
	 */
	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	/**
	 * Get the song id which this game result is a score of
	 *
	 * @return the song id of what song the result corresponds to as int
	 */
	public int getSongId() {
		return songId;
	}

	/**
	 * set what song this result corresponds to
	 *
	 * @param songId
	 *            what song to set as an int
	 */
	public void setSongId(int songId) {
		this.songId = songId;
	}

	/**
	 * get the rank of this result
	 *
	 * @return rank as an int
	 */
	public int getRank() {
		return rank;
	}

	/**
	 * sets the rank of this result
	 *
	 * @param rank
	 *            to set as an int
	 */
	public void setRank(int rank) {
		this.rank = rank;
	}

	public List<GameEvent> getEvents() {
		return events;
	}

	public void setEvents(List<GameEvent> events) {
		this.events = events;
	}

	@Override
	public String toString() {
		return "GameResult{" + "id=" + id + ", result=" + result + ", nickname=" + nickname + ", songId=" + songId + ", rank=" + rank + ", events=" + events + '}';
	}

}
