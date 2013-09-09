package se.kth.protohype.protostar;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import se.kth.protohype.protostar.server_logic.ServerGameResultLogic;
import se.kth.protohype.protostar.structs.GameResult;

public class ServerGameResultLogicTest extends DatabaseTest {
	
	
		
	@Test
	public void testAddResult() throws SQLException {
		//rank can not be assigned, so let it equal to 0
		GameResult actual = new GameResult(1, 4, "ash", 2, 0);
		
		assertNotNull(actual);
		
		ServerGameResultLogic.putGameResult(actual);
		
		GameResult result = ServerGameResultLogic.getGameResult(1);
		assertEquals(actual.getResult(),result.getResult());
		assertEquals(actual.getNickname(),result.getNickname());
		assertEquals(actual.getSongId(),result.getSongId());
		assertEquals(actual.getRank(),result.getRank());
		
		assertTrue(actual.getId() == 1);
		assertTrue(actual.getResult() == 4);
		assertTrue(actual.getNickname().equals("ash"));
		assertTrue(actual.getSongId() == 2);
		
	}
	
	
	@Test
	public void testGetIllegalResult() throws SQLException {
		GameResult result = ServerGameResultLogic.getGameResult(2);
		assertEquals(result,null);
	}
	
	@Test
	public void testGetGameResultList() throws SQLException {
		GameResult actual1 = new GameResult(1, 4, "ash", 2, 0);
		GameResult actual2 = new GameResult(2, 3, "shi", 2, 0);
		GameResult actual3 = new GameResult(3, 6, "mar", 2, 0);
		
		ServerGameResultLogic.putGameResult(actual1);
		ServerGameResultLogic.putGameResult(actual2);
		ServerGameResultLogic.putGameResult(actual3);
		
		List<GameResult> list = new ArrayList<GameResult>();
		
		list = ServerGameResultLogic.getGameResultList(2, 3, 0);
		GameResult result1 = list.get(0);
		GameResult result2 = list.get(1);
		GameResult result3 = list.get(2);
		
		assertEquals(actual1.getSongId(),result1.getSongId());
		assertEquals(actual2.getSongId(),result2.getSongId());
		assertEquals(actual3.getSongId(),result3.getSongId());
		
		assertTrue(actual1.getSongId() == 2);		
	}
	
}
