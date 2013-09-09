package se.kth.protohype.protostar;

import java.sql.SQLException;

import org.junit.AfterClass;
import org.junit.Before;

import se.kth.protohype.protostar.data_access.DatabaseStore;
import se.kth.protohype.protostar.data_access.DatabaseStoreImplSQLite;

public abstract class DatabaseTest {
	
	protected static DatabaseStore db = new DatabaseStoreImplSQLite();
	
	@Before
	public void clearDb() throws SQLException {
		db.clearDatabase();
	}
	
	@AfterClass
	public static void CloseConnection() throws Throwable {
		db.clearDatabase();
	}

}
