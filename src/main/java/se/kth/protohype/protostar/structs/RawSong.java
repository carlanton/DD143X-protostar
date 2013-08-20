package se.kth.protohype.protostar.structs;

import java.io.UnsupportedEncodingException;

import javax.xml.bind.annotation.XmlRootElement;

import org.apache.log4j.Logger;

/**
 * This class models the raw metadata regarding a song,
 * in terms of a String in UDX-format.
 */
@XmlRootElement
public class RawSong {
	private static Logger log = Logger.getLogger(RawSong.class);
	private String udx;

	// For JSON-serialization
	@SuppressWarnings("unused")
	private RawSong() {
	}

	/**
	 * Inits a new RawSong object with the given udx file
	 *
	 * @param udx
	 *            The udx file as a String
	 */
	public RawSong(String udx) {
		this.udx = udx;
	}

	/**
	 * Inits a new RawSong object with the given udx file
	 *
	 * If paramter youtubeUrl is set it will be used for VIDEO
	 *
	 * @param udx
	 *            The udx file as a byte array
	 */
	public RawSong(byte[] udx, String youtubeUrl) throws UnsupportedEncodingException {
		this.udx = new String(udx, "ISO-8859-1");

		if (!youtubeUrl.isEmpty()) {
			this.setYoutubeUrl(youtubeUrl);
		}
	}

	/**
	 * Injects a youtube URL as the video tag in the RawSong
	 * @param youtubeUrl
	 */
	private void setYoutubeUrl(String youtubeUrl) {
		// Are we using \n or \r\n for line breaks?
		String newline = this.udx.contains("\r\n") ? "\r\n" : "\n";

		// Is a VIDEO tag present?
		boolean videoTagPresent = this.udx.contains("#VIDEO:");

		String lines[] = this.udx.split(newline);

		StringBuilder newUdx = new StringBuilder(this.udx.length());

		boolean done = false;

		for (String line : lines) {
			if (done) {
				newUdx.append(line).append(newline);
			} else if (videoTagPresent && line.startsWith("#VIDEO:")) {
				// If a video tag is present and we are on the right line, then we should
				// create a new VIDEO-line and use this instead.
				newUdx.append("#VIDEO:").append(youtubeUrl).append(newline);
				done = true;
			} else if (!videoTagPresent && line.startsWith("#BPM:")) {
				// If a video tag is not present and we are on the BPM line, then we can
				// add a new VIDEO line above.
				newUdx.append("#VIDEO:").append(youtubeUrl).append(newline);
				newUdx.append(line).append(newline);
				done = true;
			} else {
				newUdx.append(line).append(newline);
			}
		}

		if (!done)
			log.warn("Couldn't set VIDEO-tag to youtubeUrl... Is this really a valid UDX-file?");

		this.udx = newUdx.toString();

	}

	/**
	 * Parses the value from the row starting with string s
	 *
	 * @param s
	 *            The start to search for
	 * @return returns the value corresponding to param s as a String
	 */
	private String find(String s) {

		int offset;
		int endOffset;

		offset = udx.indexOf(s);
		if (offset == -1)
			return "";
		offset += s.length() + 1;
		endOffset = udx.indexOf('\n', offset);
		if (endOffset == -1)
			return "";
		s = udx.substring(offset, endOffset);

		return s;
	}

	/**
	 * Get the .mp3 filename of the song
	 *
	 * @return The filename as a String
	 */
	public String getMp3() {
		String s1 = find("#SOUND");
		String s2 = find("#MP3");
		if (!s1.equals(""))
			return s1;
		return s2;
	}

	/**
	 * Get the udx file
	 *
	 * @return The udx file as a String
	 */
	public String getUdx() {
		return udx;
	}

	/**
	 * Get the artist name of this song
	 *
	 * @return The artist name in form of String
	 */
	public String getArtist() {
		return find("#ARTIST");
	}

	/**
	 * Get the title of the song
	 *
	 * @return The title as String
	 */
	public String getTitle() {
		return find("#TITLE");
	}

	@Override
	public String toString() {
		return udx;
	}
}
