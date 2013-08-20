package microphone {
	import spark.components.Application;
	import flash.events.StatusEvent;
	import flash.media.Microphone;
	import flash.external.ExternalInterface;

	/**
	 * This class implements MICROPHONE_HANDLER.
	 *
	 * Purpose: This class tier together MICROPHONE_DATA_ACCESS,
	 * MICROPHONE_ACCESS_CONTROL and MICROPHONE_ANALYZER and provides a simple
	 * interface for initializing of microphone access and getting result from
	 * the audio analysis.
	 *
	 * @author Anton Lindström (antlinds at kth.se)
	 */
	public class MicrophoneHandler extends Application {
		private static var version:String = "1.0";

		private var micDA:MicrophoneDataAccess;
		private var analyzer:AudioAnalyzer;
		private var status:int;
		private var sampleRate:uint;
		private var bufferSize:uint;
		private var setup:Boolean;

		/**
		 * When constructed, MicrophoneHandler sets default parameters and
		 * registers ActionScript methods callable from JavaScript.
		 */
		public function MicrophoneHandler() {
			// Configuration
			sampleRate = 44100;
			bufferSize = 2048;
			status = 0;
			setup = false;

			// JavaScript interface
			ExternalInterface.addCallback("init", init);
			ExternalInterface.addCallback("getStatus", getStatus);
			ExternalInterface.addCallback("getTone", getTone);
			ExternalInterface.addCallback("getVersion", getVersion);
		}

		/**
		 * Initializes the microphone and audio analyzer. When this metohd is called,
		 * the flash object must be visible for the user and at least 215 x 138 px.
		 * This is the minimum size Flash Player requires to display the dialog box.
		 *
		 * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Microphone.html#getMicrophone()
		 */
		public function init():void {
			// We should only be able to do this once!
			if (setup) {
				return;
			} else {
				setup = true;
			}

			// Microphone setup
			var mic:Microphone = Microphone.getMicrophone();
			mic.rate = sampleRate/1000;		
			mic.setSilenceLevel(0.0);

			if (mic.muted) {
				mic.addEventListener(StatusEvent.STATUS , statusHandler);
			} else {
				status = 1;
			}

			// Sub components
			micDA = new MicrophoneDataAccess(mic, bufferSize);
			analyzer = new AudioAnalyzer(sampleRate, bufferSize);
		}

		/**
		 * Used by the microhpone to handle status events.
		 */
		private function statusHandler(event:StatusEvent):void {
			if (event.code == "Microphone.Unmuted") {
				status = 1;
			} else if (event.code == "Microphone.Muted") {
				status = -1;
			}
		}

		/**
		 * Returns the current status of the object. The return values are:
		 * -1: Failed to get microphone access.
		 *  0: No microphone access yet.
		 *  1: Microphone available
		 */
		public function getStatus():int {
			return status;
		}

		/**
		 * If we have microphone access this function will return the current tone,
		 * If we do not have access or analyze fails, the function will return -1.
		 *
		 * @See AudioAnalyzer.as
		 */
		public function getTone():int {
			return analyzer.analyze(micDA.getData());
		}

		public function getVersion():String {
			return version;
		}
	}
}
