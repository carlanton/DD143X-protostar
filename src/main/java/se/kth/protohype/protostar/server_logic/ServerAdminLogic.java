package se.kth.protohype.protostar.server_logic;

import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;
import se.kth.protohype.protostar.data_access.FileDA;
import se.kth.protohype.protostar.structs.RawSong;

import com.sun.jersey.core.header.FormDataContentDisposition;

/**
 * The server logic for dealing with administrative tasks on the server.
 */
public class ServerAdminLogic {


	private static DatabaseStore db = new DatabaseStoreImplSQLite();


	/**
	 * Adds song to the database and to the filesystem
	 * @param audioFile byte array to store in the filesystem
	 * @param udx RawSong of the udx file
	 * @return the songId of the added song
	 * @throws SQLException
	 */
	public static int newSong(FormDataContentDisposition fileDetail,
			InputStream audio, RawSong udx) throws IOException, SQLException {

		String extension = getExtension(fileDetail);

		int id = db.addSong(udx, udx.getTitle(), udx.getArtist(), extension);

		FileDA.saveFile(audio, id, extension);

		return id;
	}

	/**
	 * Updates the song with the song id both in the database and on the filesystem.
	 * @param songId id of the song
	 * @param audioFile bytearray of the audiofile
	 * @param udx RawSong, the udx file
	 * @throws SQLException
	 */
	public static void updateSong(int songId,
			FormDataContentDisposition fileDetail, InputStream audio,
			RawSong udx) throws IOException, SQLException {// TODO return void?

		if (audio != null) {
			String extension = getExtension(fileDetail);

			FileDA.saveFile(audio, songId, extension);

			if (udx == null) {
				db.updateSong(songId, extension);
			} else {
				db.updateSong(songId, udx, extension, udx.getTitle(), udx.getArtist());
			}
		} else {
			db.updateSong(songId, udx, udx.getTitle(), udx.getArtist());
		}
	}

	/**
	 * deletes the song with the specified songId
	 * @param songId song id of the song to be deleted
	 * @throws SQLException
	 */
	public static void deleteSong(int songId) throws IOException, SQLException{//TODO return void?
		String extension = db.getFileExtension(songId);
		FileDA.deleteFile(songId, extension);
		db.deleteSong(songId);
	}

	private static String getExtension(FormDataContentDisposition fileDetail) {
		String orginalFilename = fileDetail.getFileName();
		String extension = orginalFilename.substring(1 + orginalFilename
				.lastIndexOf('.'));

		if (extension.isEmpty())
			extension = "mp3";

		return extension;
	}

}
