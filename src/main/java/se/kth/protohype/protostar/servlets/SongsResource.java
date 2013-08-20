package se.kth.protohype.protostar.servlets;

import java.sql.SQLException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;

import org.apache.log4j.Logger;

import se.kth.protohype.protostar.server_logic.ServerGameResultLogic;
import se.kth.protohype.protostar.server_logic.ServerSongsLogic;
import se.kth.protohype.protostar.structs.GameResult;
import se.kth.protohype.protostar.structs.RawSong;
import se.kth.protohype.protostar.structs.SongInfo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.sun.jersey.api.NotFoundException;
import java.io.IOException;
import java.util.Collections;

/**
 *
 * This class maps URLs to business logic requests. It uses Jersey annotations
 * to do the dirty work, and the code here is simply as specified in the ADD.
 *
 * @author ansjob
 *
 */
@Path("/songs")
public class SongsResource {

	private static Logger log = Logger.getLogger(SongsResource.class);
	@Context
	HttpServletResponse res;
	@Context
	HttpServletRequest req;
	Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

	/**
	 * Fetches a RawSong object from the business logic layer
	 *
	 * @param id
	 * @return The expected RawSong or a 404 it was not found
	 */
	@GET
	@Path("{id}")
	public String getRawSong(@PathParam("id") int id) {
		log.trace("Request: get raw song #" + id);
		RawSong s;

		try {
			s = ServerSongsLogic.getRawSong(id);
		} catch (SQLException ex) {
			log.error("getRawSong error for song #" + id, ex);
			throw new WebApplicationException();
		}

		if (s == null) {
			log.debug("Raw song #" + id + " was not found");
			throw new NotFoundException();
		}

		return s.toString();
	}

	/**
	 * This method queries the application logic for SongInfo objects
	 *
	 * @param query The search query, will be "" (empty String if none was
	 * specified)
	 * @param length The maximum length of the response (in listentries)
	 * @param offset The number of listentries to skip
	 * @return A list of SongInfo objects (may be empty, but never null)
	 */
	@GET
	@Produces("application/json")
	public List<SongInfo> searchSongs(
			@DefaultValue("") @QueryParam("q") String query,
			@DefaultValue("10") @QueryParam("length") int length,
			@DefaultValue("0") @QueryParam("offset") int offset) {

		log.trace(String.format(
				"Request: search songs {query: %s, length: %d, offset: %d}", query,
				length, offset));

		try {
			List<SongInfo> result = ServerSongsLogic.getSongList(length, offset, query);
			log.trace("Found " + result.size() + " songs");
			return result;
		} catch (SQLException ex) {
			log.error(String.format(
					"Search error! {query: %s, length: %d, offset: %d}", query, length, offset), ex);
			throw new WebApplicationException();
		}
	}

	/**
	 * Queries the application logic for a list of gameresults related to the
	 * song specified. Will cause a 404 error if the song was not found in the
	 * database.
	 *
	 * @param length The maximum length of the response (in listentries)
	 * @param offset The number of listentries to skip
	 * @param id The song ID specified
	 * @return The highscore list for the requested song skipping the first
	 * <code>offset</code> entries, and limiting output size to
	 * <code>length</code>
	 */
	@GET
	@Produces("application/json")
	@Path("{id}/gameresults/")
	public List<GameResult> getGameResults(
			@QueryParam("length") @DefaultValue("10") int length,
			@QueryParam("offset") @DefaultValue("0") int offset,
			@PathParam("id") int id) {

		log.trace(String.format(
				"Request: get game results {id: %d, length: %d, offset: %d",
				id, length, offset));

		try {
			return ServerGameResultLogic.getGameResultList(id, length, offset);
		} catch (SQLException ex) {
			log.error("getGameResults error!", ex);
			throw new WebApplicationException();
		}
	}

	/**
	 * Will save the reported gameresult to the server. Will respond with a 404
	 * if the song was not found, and will respond with a 500 (Internal server
	 * error) if the result-field could not be parsed as a GameResult JSON
	 * String.
	 *
	 * @param songId
	 * @param result A JSON-encoded GameResult object
	 * @return "true" or "false" depending on the outcome.
	 */
	@POST
	@Path("{id}/gameresult")
	@Produces("application/json")
	public int saveGameResult(
			@PathParam("id") int songId,
			@FormParam("result") String resultAsJSON) {
		log.trace("Request: save game result for song #" + songId);
		try {
			GameResult result = gson.fromJson(resultAsJSON, GameResult.class);
			result.setSongId(songId);
			Collections.sort(result.getEvents());
			return ServerGameResultLogic.putGameResult(result);

		} catch (JsonSyntaxException ex) {
			log.error("Received illegal gameresult object", ex);
			throw new WebApplicationException(HttpServletResponse.SC_BAD_REQUEST);
		} catch (SQLException ex) {
			log.error("saveGameResult error", ex);
			throw new WebApplicationException(ex);
		}
	}

	/**
	 * @param id The ID of the song.
	 * @return The filename relative to audio/ where the audio is stored
	 */
	@GET
	@Path("{id}/filename")
	public String getAudioFilename(@PathParam("id") int id) {
		log.trace("Request: get audio file name for song #" + id);
		try {
			String fileName = ServerSongsLogic.getFilename(id);
			if (fileName == null)
				throw new NotFoundException();
			return fileName;
		} catch (IOException ex) {
			log.error("getAudioFilename error", ex);
			throw new WebApplicationException();
		}
	}

	/**
	 * Get the metadata of the song with corresponding id.
	 *
	 * @param id of the song to get meta data from
	 * @return the meta data of song id
	 */
	@GET
	@Produces("application/json")
	@Path("{id}/info")
	public SongInfo getSongInfo(@PathParam("id") int id) {
		log.trace("Request: song info for song #" + id);

		try {
			return ServerSongsLogic.getSongInfo(id);
		} catch (SQLException ex) {
			log.error(String.format(
					"getSongInfo error! {id: %d}", id), ex);
			throw new WebApplicationException();
		}
	}
}
