const audioBuffers = [];
const audioContext = new AudioContext();

// Create a new instance of the MediaRecorder object
let mediaRecorder = null;
const recognition = new webkitSpeechRecognition();
let transcriptText = '';

$(document).ready(function () {
    $('#play_recording').on('click', function (e) {
        let textButton = $('#play_recording').text();

        if (textButton === 'Mulai rekaman') {
            $('#play_recording').text('Stop rekaman');
            getUserInput();
        }

        if (textButton !== 'Mulai rekaman') {
            mediaRecorder.stop();
            recognition.stop();
            $('#play_recording').text('Mulai rekaman');
            $('#output').text(transcriptText)
        }
    });

    $('#reset_transkrip').on('click', function (e) {
        $('#output').html('')
    });
});

function getUserInput() {
    // set transcript to null
    transcriptText = '';
    $('#output').text('')

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'id-ID';

    recognition.start();
    // Audio chunks array to store the recorded audio data
    let chunks = [];

    // Get the audio stream from the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            // Create a new MediaRecorder object and pass in the audio stream
            mediaRecorder = new MediaRecorder(stream);

            // Event listener for when data is available to be collected
            mediaRecorder.ondataavailable = (event) => {
                // Add the new data to the chunks array
                chunks.push(event.data);
            };

            mediaRecorder.start();

            // Event listener for when recording is stopped
            mediaRecorder.onstop = (event) => {
                // Combine all the recorded chunks into a single blob
                const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });

                // Convert the blob into a URL that can be used as a source for an audio element
                const audioURL = URL.createObjectURL(blob);
            };
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const resp = event.results[0][0].transcript;
        
        console.log({ result });
        transcriptText = String(resp)
        // $('#output').append(transcript)
        let textButton = $('#play_recording').text();

        if (textButton === 'Mulai rekaman') {
            $('#output').text(transcriptText)
        }
    };

    recognition.onerror = (event) => {
        console.log({ event });
    };
}

function stopRecording() {

}

