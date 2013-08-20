package se.kth.protohype.protostar.servlets;

import java.io.InputStream;

import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

import org.apache.log4j.Logger;

import se.kth.protohype.protostar.server_logic.ServerAdminLogic;
import se.kth.protohype.protostar.structs.RawSong;

import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;

/**
 * These are the commands available to administrators. The authentication is
 * provided by the server and the configuration made in web.xml and
 * glassfish-web.xml
 *
 * The administrative commands to the server should be done using http BASIC
 * authentication or whatever other authentication mechanism the server may use
 * (this is configurable in the mentioned xml-files).
 *
 * What is important to note, is that this class does no authentication by
 * itself, but assumes that the request has been authenticated when it is passed
 * to this class.
 *
 * @author ansjob
 *
 */
@Path("/admin")
public class AdminResource {
	private static Logger log = Logger.getLogger(AdminResource.class);

	/**
	 * This object will contain information about the current security situation
	 */
	@Context
	private SecurityContext security;

	/**
	 * Deletes a song and all it's GameResults from the server. Will throw a 404
	 * if the song was not found.
	 *
	 * @param id
	 *            The ID of the song to be deleted.
	 * @return true iff the data was deleted.
	 */
	@POST
	@Path("song/delete/{id}")
	public Response deleteSong(@PathParam("id") int id) {
		log.trace("Request: delete song #" + id);

		try {
			ServerAdminLogic.deleteSong(id);
		} catch (Exception ex) {
			log.debug("deleteSong failure", ex);
			throw new WebApplicationException();
		}

		return Response.ok().build();
	}

	/**
	 * Will insert a song into the database.
	 *
	 * @return true iff the data was stored in the database
	 */
	@POST
	@Path("song")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response insertSong(
			@FormDataParam("audio") FormDataContentDisposition audioFileDetail,
			@FormDataParam("audio") InputStream audio,
			@FormDataParam("udx") byte[] udxTxt,
			@FormDataParam("youtubeUrl") String youtubeUrl) {
		log.trace("Request: insert song (Setting youtube url: " + (!youtubeUrl.isEmpty()) + ")");

		try {
			RawSong song = new RawSong(udxTxt, youtubeUrl);
			ServerAdminLogic.newSong(audioFileDetail, audio, song);
		} catch (Exception ex) {
			log.debug("insertSong failure", ex);
			throw new WebApplicationException();
		}

		return Response.ok().build();
	}

	/**
	 * Updates the audio file and lyrics file of a certain song. If the song is
	 * not found, a 404 message will be returned.
	 *
	 * @param id
	 *            The ID of the song to be updated.
	 * @return true iff the data was received and stored.
	 */
	@POST
	@Path("song/{id}")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	public Response updateSong(
			@PathParam("id") int id,
			@FormDataParam("audio") FormDataContentDisposition audioFileDetail,
			@FormDataParam("audio") InputStream audio,
			@FormDataParam("udx") byte[] udxTxt,
			@FormDataParam("youtubeUrl") String youtubeUrl) {
		log.trace("Request: update song #" + id + " (Setting youtube url: " + (!youtubeUrl.isEmpty()) + ")");

		try {
			RawSong song = new RawSong(udxTxt, youtubeUrl);
			ServerAdminLogic.updateSong(id, audioFileDetail, audio, song);
		} catch (Exception ex) {
			log.debug("insertSong failure", ex);
			throw new WebApplicationException();
		}

		return Response.ok().build();
	}

	/**
	 * This method is here to test the administrator's realm setup.
	 * @param context The ServletContext in which this servlet executes.
	 * @return A simple hello world message
	 */
	@GET
	public String authTest(@Context ServletContext context) {
		log.debug("/admin was used!");
		log.debug("Working at path: " + context.getRealPath("/"));
		return "One other secret message for " + security.getUserPrincipal().getName();
	}

}
