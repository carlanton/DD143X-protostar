package se.kth.protohype.protostar.structs;

import com.google.gson.annotations.Expose;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * An event during the game.
 * This simple tuple models that a certain score was acquired at a certain beat
 * in the song. 
 * @author Andreas Sjöberg
 */
@XmlRootElement
public class GameEvent implements Comparable<GameEvent> {
	@Expose
	private int beat;
	@Expose
	private int scoreDelta;


	/* To make this a proper bean,
	 * we need an empty constructor.
	 * Let's make it private, so no applications use it by mistake. */
	private GameEvent() {}

	public GameEvent(int beat, int scoreDelta) {
		this.beat = beat;
		this.scoreDelta = scoreDelta;
	}

	public int getBeat() {
		return beat;
	}

	public void setBeat(int beat) {
		this.beat = beat;
	}

	public int getScoreDelta() {
		return scoreDelta;
	}

	public void setScoreDelta(int scoreDelta) {
		this.scoreDelta = scoreDelta;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		final GameEvent other = (GameEvent) obj;
		if (this.beat != other.beat) {
			return false;
		}
		if (this.scoreDelta != other.scoreDelta) {
			return false;
		}
		return true;
	}

	@Override
	public int hashCode() {
		int hash = 3;
		hash = 97 * hash + this.beat;
		hash = 97 * hash + this.scoreDelta;
		return hash;
	}

	@Override
	public String toString() {
		return "GameEvent{" + "frame=" + beat + ", scoreDelta=" + scoreDelta + '}';
	}

	@Override
	public int compareTo(GameEvent t) {
		return Integer.valueOf(this.beat).compareTo(Integer.valueOf(t.beat));
	}
}
