package se.kth.protohype.protostar.servlets;

import java.sql.SQLException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;

import se.kth.protohype.protostar.server_logic.ServerGameResultLogic;
import se.kth.protohype.protostar.structs.GameResult;

import com.sun.jersey.api.NotFoundException;

/**
 * This class collects the API method calls where the URL
 * starts with /gameresult
 * @author ansjob
 */
@Path("gameresult")
public class GameResultResource {
	private static Logger log = Logger.getLogger(GameResultResource.class);

	/**
	 * This method handles the method calls which look like /gameresult/23.
	 * @param resultId The ID of the GameResult needed.
	 * @return The GameResult in JSON format, if it exists in the database.
	 * @throws NotFoundException if no GameResult with the given ID was found.
	 * @throws WebApplicationException if some other database error occurs. 
	 */
	@GET
	@Path("{resultId}")
	@Produces(MediaType.APPLICATION_JSON)
	public GameResult getGameResult(@PathParam("resultId") int resultId) {
		log.trace("Request: get game result for song #" + resultId);

		GameResult res;

		try {
			res = ServerGameResultLogic.getGameResult(resultId);
		} catch (SQLException ex) {
			log.error("getGameResult error", ex);
			throw new WebApplicationException();
		}

		if (res == null) {
			log.debug("GameResult with id " + resultId + " not found");
			throw new NotFoundException();
		}

		return res;
	}
}