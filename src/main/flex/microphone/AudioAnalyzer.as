package microphone {
	import flash.media.Microphone;
	import flash.external.ExternalInterface;

	/**
	 * This class implements MICROPHONE_AUDIO_ANALYZER.
	 * Purpose: Analyze audio data to detect a distinct pitch value.
	 *
	 * @author Anton Lindström (antlinds at kth.se)
	 */
	public class AudioAnalyzer {
		// Lowest tone in Hz (C2 in this case).
		private const baseTone:Number = 65.4064;

		// Number of tones.
		private const N:uint = 36;

		// Volume treshold beteween 0 and 1.
		private var threshold:Number;
		private var bufferSize:uint;
		private var sampleRate:uint;

		// Reference frequencies.
		private var freqs:Vector.<Number>;
	
		/**
		 * Constructs the class and generates frequencies.
		 *
		 * @param bufferSize Size of buffer
		 * @param sampleRate Sample rate in Hz
		 */
		public function AudioAnalyzer(sampleRate:uint, bufferSize:uint) {
			this.threshold = 0.05;
			this.bufferSize = bufferSize;
			this.sampleRate = sampleRate;

			// Calculate frequencies. BaseTone and the next (N-1) tones.
			freqs = new Vector.<Number>(N);

			for (var i:uint = 0; i < N; i++) {
				freqs[i] = baseTone * Math.pow(2, i/12);
			}
		}
		
		/**
		 * This function uses autocorrelation between the audio data
		 * in the buffer and an equal tempered scale from C2-B4. The best match
		 * is returned.
		 *
		 * @param data - audio data buffer
		 */
		public function analyze(data:Vector.<Number>):int {
			// Check if we are over the threshold:
			var pass:Boolean = false;
			for (var j:uint = 0; j < bufferSize; j++) {
				if (Math.abs(data[j]) >= threshold) {
					pass = true;
					break;
				}
			}

			// Return -1 if we ain't!
			if (pass == false)
				return -1;

			var maxWeight:Number = 0;
			var maxTone:int = 0;

			// Find the frequency with the best match:
			for (var i:uint = 0; i < N; i++) {
				var w:Number = analyzeByAutocorrelationFreq(data,freqs[i]);

				if (w > maxWeight) {
					maxWeight = w;
					maxTone = i;
				}
			}

			return maxTone;
		}

		/**
		 * Analyze by autocorrelation.
		 */
		private function analyzeByAutocorrelationFreq(data:Vector.<Number>, freq: Number):Number {
			var accuDist:Number = 0;
			var j:uint = 0;

			// compare correlating samples
			for (var i:uint = Math.round(sampleRate/freq); i < bufferSize; i++) {
				// calc distance (correlation: 1-dist) to corresponding sample in next period
				accuDist += Math.abs(data[j] - data[i]);
				j++;
			}

			return 1 - accuDist/bufferSize;
		}

		/**
		 * Returns the current threshold.
		 */
		public function getThreshold():Number {
			return threshold;
		}

		/**
		 * Sets the treshold.
		 */
		public function setThreshold(threshold:Number):void {
			this.threshold = threshold;
		}
	}
}
