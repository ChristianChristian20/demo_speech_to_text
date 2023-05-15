
const { SpeechSynthesizer, SpeechConfig, SpeechSynthesisOutputFormat, ResultReason, AudioConfig, AudioOutputStream } = require('microsoft-cognitiveservices-speech-sdk');
const SPEECH_KEY = '60310a27f13148dba8774a0e53fbabe5';
const SPEECH_REGION = 'southeastasia';
const speechConfig = SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);


require('http').createServer((i,o)=>{
    const { url, method } = i;
    let chuncks = '';
    if(method === 'POST'){
        i.on('data',(chunck)=>{
            chuncks += chunck;
        });
        i.on('end',async ()=>{
            try{
                let body = JSON.parse(chuncks);
                console.warn(`chuncks${chuncks}`)
                if(!body || !body.voice || !body.text){
                    setResponse(o,400, 'Invalid request');
                } else {
                    const result = await textToAudio(body.voice, body.text);
                    console.warn(`result code: ${result.privReason}`)
                    const audioBuffer = Buffer.from(result.privAudioData);
                    o.setHeader('Content-Type', 'audio/wav');
                    o.setHeader('Content-Length', audioBuffer.length);
                    o.end(audioBuffer);
                }
            } catch(err){
                console.warn(err);
                setResponse(o,500,'Internal error');
            }
        })
    } else if(method === 'GET'){
        const BASE_DIRECTORY = __dirname.replace('src','');
        const filePath = `${BASE_DIRECTORY}/public${(url === '/' ? '/index.html' : url)}`;
        require('fs').readFile(filePath,function(err,content){
            if(err) {
                setResponse(o,200,'Not found!');
            } else {
                setResponse(o,200,content);
            }
        });       
    } else {
        setResponse(o,404,`handler for ${method} not found`);
    }

}).listen(3000,()=>{    
    console.warn('text to speech service running at 3000');
});




function setResponse(serverResponse,code,data) {
    serverResponse.writeHead(code,{                                
        'Access-Control-Allow-Origin': '*',                                                    
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',                           
        'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
        });
    
    serverResponse.end(data);
};


function textToAudio(voice, text){
                    speechConfig.speechSynthesisVoiceName = voice;
                    speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;

                    console.log(speechConfig.speechSynthesisOutputFormat);

                    const audio = 'result.wav';

                    const audioConfig = AudioConfig.fromAudioFileOutput(audio);

                    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

                    return new Promise((resolve, reject) => {
                        synthesizer.speakTextAsync(
                            text, 
                            result => {
                               resolve(result);
                            },
                            error => {  
                                reject(error);
                            });
                    });

                    
}



