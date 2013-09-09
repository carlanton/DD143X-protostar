package microphone {
	import flash.events.SampleDataEvent;
	import flash.media.Microphone;
	
	/**
	 * This class implements MICROPHONE_DATA_ACCESS.
	 *
	 * @author Anton Lindström (antlinds at kth.se)
	 */
	public class MicrophoneDataAccess {
		private var bufferSize:uint;
		private var ringBuffer:Vector.<Number>;
		private var pos:uint;

		/**
		 * Setups the ring buffer and adds an event handler for data.
		 */
		public function MicrophoneDataAccess(mic:Microphone, bufferSize:uint) {
			this.bufferSize = bufferSize;

			// Initialize ring buffer
			ringBuffer = new Vector.<Number>(bufferSize);
			for (var i:uint = 0; i < bufferSize; i++)
				ringBuffer[i] = 0;

			pos = 0;

			// Add event handler for incomming data
			mic.addEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
		}

		private function micSampleDataHandler(event:SampleDataEvent):void {
			// event.data.length is the length of the ByteArray in bytes.
			// We're using readFloat, 1 float = 32 bit = 4 bytes.
			var n:uint = event.data.length / 4;

			// Write new data in the ring buffer:
			for (var i:uint = 0; i < n; i++) {
				ringBuffer[pos] = event.data.readFloat();
				pos = (pos + 1) % bufferSize;
			}
		}

		/**
		* Returns the current data from the ring buffer
		*/
		public function getData():Vector.<Number> {
			return ringBuffer;;
		}
	}
}
