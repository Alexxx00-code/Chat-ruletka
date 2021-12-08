import io from 'socket.io-client';

const PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
const IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
const SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
const configuration = {};
let Stream;
let User = {};
let socket;
let setConectStatusFunction;

export function setConectStatus(func)
{
    setConectStatusFunction = func;
}

const video_constraints = {
    mandatory: {
        maxHeight: 480,
        maxWidth: 720
    },
    optional: []
};
navigator.mediaDevices.getUserMedia({ audio: true,
    video: video_constraints
})
    .then(gotStream)
    .catch(function(error) { console.log(error);
        alert(error);});

function gotStream(stream) {
    Stream = stream;
    document.getElementById("localVideo").srcObject = stream;
}

export function Next() {
    socket.emit('next');
}

export function Stop() {
    setConectStatusFunction(false);
    socket.emit('stop');
}

export function Start() {
    socket.emit('active');
}

function ConnectPeer() {
    
    setConectStatusFunction(true);
    User.peer = new PeerConnection(configuration);

    User.peer.addEventListener('icecandidate', e => gotIceCandidate(e, User));
    User.peer.ontrack = e =>  gotRemoteStream(e, User);

    if(Stream != null)
    {
        let tracks = Stream.getTracks();

        for (let index = 0; index < tracks.length; ++index) {
            User.peer.addTrack(tracks[index],Stream);
        }
    }
}


// Step 2. createOffer
function createOffer(user) {
    user.peer.createOffer(
        d=> gotLocalDescription(d, user),
        function(error) { console.log(error) },
        { 'mandatory': { 'OfferToReceiveAudio': 1, 'OfferToReceiveVideo': 1 } }
    );
}


// Step 3. createAnswer
function createAnswer(user) {
    user.peer.createAnswer(
        d=> gotLocalDescription(d, user),
        function(error) { console.log(error) },
        { 'mandatory': { 'OfferToReceiveAudio': 1, 'OfferToReceiveVideo': 1 } }
    );
}


function gotLocalDescription(description,user){
    user.peer.setLocalDescription(description);
    sendMessage(description);
    setConectStatusFunction(true);
}

function gotIceCandidate(event, user){
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            candidate: event.candidate
        });
    }
}

function gotRemoteStream(event){
    document.getElementById("remoteVideo").srcObject = event.streams[0];
    setConectStatusFunction(true);
}
socket = io('http://localhost:3333');

function sendMessage(message){
    if(message.type == null)
        socket.emit('messageUser',
            {
                message: message
            }
        );
    else
        socket.emit('messageUser',
            {
                type: message.type,
                message: message
            }
        );
};

socket.on('messageUser', function (message){
    if(message.type != null)
    {
        if (message.type === 'offer') {
            ConnectPeer(User);
            User.peer.setRemoteDescription(new SessionDescription(message.message));
            createAnswer(User);
        }
        else if (message.type === 'answer') {
            User.peer.setRemoteDescription(new SessionDescription(message.message));
        }
        else if (message.type === 'candidate') {
            User.peer.addIceCandidate(new IceCandidate(message.message.candidate));
        }
    }
    else
    {

    }
});

socket.on('active', function () {
    ConnectPeer();    
    createOffer(User);
});

socket.on('disconnectUser', function () {
    setConectStatusFunction(false);
    document.getElementById("remoteVideo").srcObject = null;
});

socket.on('disconnect', function () {
    setConectStatusFunction(false);    
    document.getElementById("remoteVideo").srcObject = null;
});