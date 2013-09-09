package se.kth.protohype.protostar.data_access;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.commons.io.IOUtils;


/**
 * A class with utility methods to store/fetch things from the file system.
 */
public class FileDA {
	private static final String path = "data/audio";

	/**
	 * saveFile will save file at path.
	 * If a file on that path already exists it will overwrite that file.
	 * @param file to be saved
	 * @param path where to save the file
	 * @throws IOException
	 * @throws FileNotFoundException
	 */
	public static void saveFile(InputStream audio, int songId, String extension)
			throws IOException {
		checkPath();


		File dest = getFile(songId, extension);

		OutputStream out = new FileOutputStream(dest);
		IOUtils.copy(audio, out);

		out.close();
		audio.close();
	}

	/**
	 * Delete a file from the filesystem
	 * @param songId the id of the song
	 * @param extension the file extension corresponding to the song
	 * @return boolean successfullnes of the operation
	 */
	public static boolean deleteFile(int songId, String extension) {
		return getFile(songId, extension).delete();
	}

	/**
	 * Get the filename for a song
	 * @param songId the id of the song
	 * @param extension the file extension of the song.
	 * @return the filename of the song
	 */
	public static String getFilename(int songId, String extension) {
		return extension == null ? null : String.format("%d.%s", songId, extension);
	}

	/**
	 * Get the file for a song.
	 * @param songId the id of the song
	 * @param extension the file extension of the song
	 * @return the audio file of a song.
	 */
	private static File getFile(int songId, String extension) {
		return new File(path, getFilename(songId, extension));
	}

	/**
	 * If path do not exist, create path
	 */
	private static void checkPath() {
		File p = new File(path);

		if (!p.exists())
			p.mkdirs();
	}
}
