package se.kth.protohype.protostar.structs;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * A simple tuple, consisting of the id, artist, and title of a song.
 */
@XmlRootElement
public class SongInfo {

	private int id;
	private String title;
	private String artist;

	@SuppressWarnings("unused")
	// For JSON-serialization
	private SongInfo() {
	}

	/**
	 * Inits song info object with the given params
	 *
	 * @param id
	 * @param title
	 * @param artist
	 */
	public SongInfo(int id, String title, String artist) {
		this.id = id;
		this.setTitle(title);
		this.setArtist(artist);

	}

	/**
	 * get the artist name
	 *
	 * @return artist name as Stirng
	 */
	public String getArtist() {
		return artist;
	}

	/**
	 * set the artist name
	 *
	 * @param artist
	 *            Artist name as Stirng
	 */
	public void setArtist(String artist) {
		this.artist = artist;
	}

	/**
	 * Get the song's title
	 *
	 * @return The title as String
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * Set the song's title
	 *
	 * @param title
	 *            The title to set
	 */
	public void setTitle(String title) {
		this.title = title;
	}

	/**
	 * Get the song id
	 *
	 * @return The song id as int
	 */
	public int getId() {
		return id;
	}

}
