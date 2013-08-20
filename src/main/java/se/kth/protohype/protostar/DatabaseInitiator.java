package se.kth.protohype.protostar;//		try {
////DatabaseStoreImplSQLite.init();
////TODO fix this class
//} catch (IOException ex) {
//	event.getServletContext().log("Unable to initialize SQLite database");
//}

import java.util.logging.Logger;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;

/**
 * This class is called upon when the application starts and shuts down,
 * which means we can open a connection to the database file here,
 * and close it when the application is being shut down.
 *
 * @author ansjob
 *
 */
public class DatabaseInitiator implements ServletContextListener {

	Logger log = Logger.getLogger(this.getClass().getCanonicalName());

	@Override
	public void contextInitialized(ServletContextEvent event) {
		DatabaseStoreImplSQLite.setup();
	}

	@Override
	public void contextDestroyed(ServletContextEvent _) {

	}
}