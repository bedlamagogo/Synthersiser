let synthNoise;
let env;
let sPat = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let syPat = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let syPart;
let lpFilter;
let drums;

let attack = 0.001;
let decay = 0.24;
let sustain = 0.23;
let release = 0;

let dseconds = 3;
let drate = 2;
let Revreverse = true;

let del;
let dist;
let verb;

let bpmCTR = 130;
let beatLength = 16;
let chooseLength;
let cellWidth;

let scaleSelector;
let majorMinorSelector;

let majorSteps = [2, 4, 5, 7, 9, 11, 12];
let minorSteps = [2, 3, 5, 7, 8, 10, 12];

let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let noteFreq = [523.28, 554.40, 587.36, 622.24, 659.28, 698.48, 740, 784, 830.64, 880, 932.32, 987.84];
let selectedNotes = [];
let notePad;
let notePrintOut = [];

let octValue = 1;

let firstClick = 0;

let lfo;
let lfoRate;
let lfoDepth;

let fft = new p5.FFT();


let freqKnob, resKnob, gainKnob, delSendKnob, delTimeKnob, delFeedbackKnob, delFilterKnob, revSendKnob, revSecondsKnob, revDecKnob, revReverseSelect, distSendKnob, distAmountKnob, distOversampleSelect;


function windowResized() {
    setup();
}



function setup() {

    cellWidth = width / beatLength;


    lpFilter = new p5.LowPass();
    lpFilter.freq(1000);
    lpFilter.res(0.01, 250);


    synthNoise = new p5.Oscillator('triangle');
    synthNoise.start();

    lfo = new p5.Oscillator('sine');
    lfo.freq(1);
    lfo.amp(0);
    lfo.start();
    lfo.disconnect();


    // disconnect breaks the chain of the ocsilator dirrect to the speakers
    synthNoise.disconnect();

    //this routes the audio to the filter
    synthNoise.connect(lpFilter);


    del = new p5.Delay();
    dist = new p5.Distortion();
    verb = new p5.Reverb();

    //  Chain can be used to create FXs Chains
    lpFilter.chain(del, verb, dist);

    del.drywet(0);
    dist.drywet(0);
    verb.drywet(0);

    env = new p5.Envelope();
    env.setADSR(attack, decay, sustain, release);

    synthNoise.amp(env);

    callbasicScale();
    createPhrase();
    lpFilter.freq(lfo);

}


function createPhrase() {
    drums = new p5.Part();
    drums.setBPM(bpmCTR);

    syPart = new p5.Phrase('Synth', (time) => {
        env.play(synthNoise, time, 0)
    }, syPat);


    drums.addPhrase(syPart);
    drums.addPhrase('sec', sequence, sPat);



}

function changeNoteseq(beatIndex) {

    if (syPat[beatIndex - 1] == 1) {
        let thisNote = selectedNotes[beatIndex - 1] * octValue;
        synthNoise.freq(thisNote, 0);
    }
}

function sequence(time, beatIndex) {

    setTimeout(() => {

        changeNoteseq(beatIndex);

        let toChange = "stepLight" + beatIndex;
        let toClear = "";

        if (beatIndex == 1) {
            toClear = "stepLight16";
        } else {
            toClear = "stepLight" + (beatIndex - 1);
        }


        document.getElementById(toChange).setAttribute("class", "stepLightOn");

        document.getElementById(toClear).setAttribute("class", "stepLight");

    }, time * 1000);


}


function setStep(val) {

    let idToChange = "stepButton" + val;

    let indexClicked = val - 1;

    if (syPat[indexClicked] === 0) {
        syPat[indexClicked] = 1;
        document.getElementById(idToChange).setAttribute("class", "stepButtonpressed");

    } else {
        if (val == 1 || val == 5 || val == 9 || val == 12) {
            syPat[indexClicked] = 0;
            document.getElementById(idToChange).setAttribute("class", "stepButtonBeat");
        } else {

            syPat[indexClicked] = 0;
            document.getElementById(idToChange).setAttribute("class", "stepButton");
        }
    }

}




function startStop() {

    if (firstClick == 0) {
        userStartAudio();
        firstClick = 1;
    }

    if (!drums.isPlaying) {

        document.getElementById('startStopBut').style.background = 'lime';
        //       drums.metro.metroTicks = 0;
        drums.loop();

    } else {
        for (let i = 0; i < syPat; i++) {
            let idToChange = "stepLight" + i + 1;
            document.getElementById(idToChange).setAttribute("class", "stepButton");

        }
        drums.stop();
        document.getElementById('startStopBut').style.background = 'white';
    }

}

function changeValues(name, value) {
    if (name === "Frequency") {
        lpFilter.freq(value);
    } else if (name === "Res") {
        lpFilter.res(value);
    } else if (name === "Gain") {

    } else if (name === "Attack") {
        attack = value / 127;
        env.setADSR(attack, decay, sustain, release);
    } else if (name === "Decay") {
        decay = value / 127;
        env.setADSR(attack, decay, sustain, release);
    } else if (name === "Sustain") {
        sustain = value / 127;
        env.setADSR(attack, decay, sustain, release);
    } else if (name === "Release") {
        release = value / 127;
        env.setADSR(attack, decay, sustain, release);
    } else if (name === "Reverb Dry / Wet") {
        verb.drywet((value / 127));
    } else if (name === "Time") {
        dseconds = value * 0.07874;
        verb.set(dseconds, drate);
    } else if (name === "Verb Decay") {
        drate = value * 0.7874;
        verb.set(dseconds, drate);
    } else if (name === "Delay Dry / Wet") {
        del.drywet((value / 127));
    } else if (name === "Delay Time") {
        dseconds = value * 0.007874;
        del.delayTime(value * 0.007874);
    } else if (name === "Feedback") {
        del.feedback(value * 0.007874);;
    } else if (name === "Delay LP") {
        drate = value * 0.7874;
        del.filter(value * 63);
    } else if (name === "Distort Dry / Wet") {
        dist.drywet(value / 127);
    } else if (name === "Dist Amount") {
        dist.amount = (value / 127);
    } else if (name === "RevVerb") {

        if (Revreverse === true) {
            document.getElementById('revVerbBut').style.background = 'lime';
            dist.reverse = false;
            Revreverse = false;
        } else {
            document.getElementById('revVerbBut').style.background = 'white';
            dist.reverse = true;
            Revreverse = true;
        }
    } else if (name === 'BPM') {
        bpmCTR = value;
        drums.setBPM(bpmCTR);
    } else if (name === "Lfo HZ") {
        changeLFOFreq(value);
    } else if (name === "LFO Depth") {
        changeLFODepth(value);
    }
}

function loadRandom() {
    for (let i = 0; i < syPat.length; i++) {
        syPat[i] = Math.round(Math.random());
    }
    document.getElementById('Random').style.background = 'white';

    for (let i = 0; i < syPat.length; i++) {
        let idToChange = "stepButton" + (i + 1);

        if (syPat[i] === 0) {

            if ((i + 1) == 1 || (i + 1) == 5 || (i + 1) == 9 || (i + 1) == 12) {
                document.getElementById(idToChange).setAttribute("class", "stepButtonBeat");
            } else {
                document.getElementById(idToChange).setAttribute("class", "stepButton");
            }
        } else {
            document.getElementById(idToChange).setAttribute("class", "stepButtonpressed");
        }
    }
    
}

function changeNote() {
    var scale = document.getElementById("keyScale").value;
    let mM = document.getElementById("minMaj").value;

    if (mM === "Minor") {
        selectedNotes = [];
        notePrintOut = [];
        for (let i = 0; i < 16; i++) {
            let randomNote = minorSteps[Math.round(Math.random() * 6)];
            randomNote = notes.indexOf(scale) + randomNote;


            if (randomNote >= 12) {
                randomNote -= 12;
            }
            notePrintOut.push(notes[randomNote]);
            selectedNotes.push(randomNote);



        }
        for (let i = 0; i < selectedNotes.length; i++) {
            selectedNotes[i] = noteFreq[selectedNotes[i]];
        }
    } else {
        selectedNotes = [];
        notePrintOut = [];
        for (let i = 0; i < 16; i++) {

            let randomNote = majorSteps[Math.round(Math.random() * 6)];
            randomNote = notes.indexOf(scale) + randomNote;

            if (randomNote >= 12) {
                randomNote -= 12;
            }
            notePrintOut.push(notes[randomNote]);
            selectedNotes.push(randomNote);



        }
        for (let i = 0; i < selectedNotes.length; i++) {
            selectedNotes[i] = noteFreq[selectedNotes[i]];
        }
    }

    for (i = 0; i < 16; i++) {

        let id = "noteStep" + (i + 1);
        var node = document.createElement("DIV");

        document.getElementById(id).innerHTML = "";

        node.innerHTML = notePrintOut[i];
        document.getElementById(id).appendChild(node);
    }


}

function setMajor() {
    document.getElementById("minMaj").value = "Major";
}

function setMinor() {
    document.getElementById("minMaj").value = "Minor";
}

function callbasicScale() {
    let scale = document.getElementById("keyScale").value;
    let note = notes.indexOf(scale);
    note = noteFreq[note];

    for (let i = 0; i < 16; i++) {
        selectedNotes[i] = note;
    }
    for (i = 0; i < 16; i++) {
        let id = "noteStep" + (i + 1);
        document.getElementById(id).innerHTML = "";
    }
}

function changeOct(chg) {
    octValue = chg;
}

function changeLFOFreq(value) {
    lfo.freq(value);
}

function changeLFODepth(value) {
    if (value == "0") {
        //       synthNoise.amp(0.5);
    }

    lfo.amp(value * 8);
}

function runLFO() {

    lpFilter.freq(lfo);
}


function exportMidi() {;

    var file = new Midi.File();
    var track = new Midi.Track();
    file.addTrack(track);

    track.addNote(0, 'c4', 64);
    track.addNote(0, 'd4', 64);
    track.addNote(0, 'e4', 64);
    track.addNote(0, 'f4', 64);
    track.addNote(0, 'g4', 64);
    track.addNote(0, 'a4', 64);
    track.addNote(0, 'b4', 64);
    track.addNote(0, 'c5', 64);

    fs.writeFileSync('test.mid', file.toBytes(), 'binary');

}
