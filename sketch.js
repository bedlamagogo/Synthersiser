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

let octValue =1;

let lfo;
let lfoRate;
let lfoDepth;

let fft = new p5.FFT();


let freqKnob, resKnob, gainKnob, delSendKnob, delTimeKnob, delFeedbackKnob, delFilterKnob, revSendKnob, revSecondsKnob, revDecKnob, revReverseSelect, distSendKnob, distAmountKnob, distOversampleSelect;


function windowResized() {
    setup();
}


function setup() {


    seqCanvas = new p5.Element('sequencer');
    seqCanvas = createCanvas(windowWidth / 1.5, 600);
    seqCanvas.mousePressed(canvasPressed);
    seqCanvas.style('padding-left', "25px");
    seqCanvas.style('margin-top', "2rem");


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
    //  lpFilter.chain(verb);

    del.drywet(0);
    dist.drywet(0);
    verb.drywet(0);

    env = new p5.Envelope();
    env.setADSR(attack, decay, sustain, release);

    synthNoise.amp(env);

    callbasicScale();
    createPhrase();
    drawMatrix();
    lpFilter.freq(lfo);

}

function drawMatrix() {

    seqCanvas = createCanvas(windowWidth / 1.5, 600);

    stroke('grey');
    strokeWeight(2);
    fill('white');


    // Vertical Lines
    for (let i = 0; i < beatLength + 1; i++) {
        line(i * cellWidth, 500, i * cellWidth, 550);
    }

    //Horizontal
    //  for (let i = 0; i < 2; i++) {
    //    line(0, i * height / 3, width, i * height / 3);
    //  }
    line(0, 500, width, 500);
    line(0, 550, width, 550);

    noStroke();

    for (let i = 0; i < beatLength; i++) {

        if (syPat[i] === 1) {
            ellipse(i * cellWidth + 0.5 * cellWidth, 525, 10);
        }
    }

}

function createPhrase() {
    drums = new p5.Part();
    drums.setBPM(bpmCTR);

    syPart = new p5.Phrase('Synth', (time) => {
        env.play(synthNoise, time, 0)
    }, syPat);

    //    notePart = new p5.Phrase('Note', (time) => {
    //        changeNote(noteValue)
    //    }, selectedNotes);

    drums.addPhrase(syPart);
    //    drums.addPhrase(notePart);
    drums.addPhrase('sec', sequence, sPat);



}

function changeNoteseq(beatIndex) {

    if (syPat[beatIndex - 1] == 1) {
        let thisNote = selectedNotes[beatIndex - 1]*octValue;
        synthNoise.freq(thisNote, 0);
    //    synthNoise.freq(selectedNotes[beatIndex - 1], 0);
    }
}

function sequence(time, beatIndex) {

    setTimeout(() => {
        drawMatrix();
        stroke('red');
        fill(255, 0, 0, 30);
        rect((beatIndex - 1) * cellWidth, 500, cellWidth, 50);
        changeNoteseq(beatIndex);
        timeVal = time;
//        runLFO ();

    }, time * 1000);


}

function canvasPressed() {
    let rowClicked = floor(mouseY / height);
    let indexClicked = floor(beatLength * mouseX / width);
    if (mouseY >= 500 && mouseY <= 550) {

        if (syPat[indexClicked] === 0) {
            syPat[indexClicked] = 1;
        } else {
            syPat[indexClicked] = 0;
        }
    }
    drawMatrix();
}

function startStop() {
    if (!drums.isPlaying) {
        document.getElementById('startStopBut').style.background = 'lime';
        drums.metro.metroTicks = 0;
        drums.loop();
    } else {
        drums.stop();
        document.getElementById('startStopBut').style.background = 'white';
    }

}

function changeValues(name, value) {
    if (name === "Frequency") {
        lpFilter.freq(value);
    } else if (name === "Res") {
        lpFilter.res(value, 250);
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
    }else if (name === "Lfo HZ") {
        changeLFOFreq(value);
    }else if (name === "LFO Depth") {
        changeLFODepth(value);
    }
}

function loadRandom() {
    startStop();
    for (let i = 0; i < syPat.length; i++) {
        syPat[i] = Math.round(Math.random());
    }
    document.getElementById('Random').style.background = 'white';
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
    document.getElementById("musicNotePrintOut").innerHTML = "";
    var node = document.createElement("DIV");
    for (let i = 0; i < notePrintOut.length; i++) {
        if (i == notePrintOut.length - 1) {
            node.innerHTML += " " + notePrintOut[i];
        } else {
            node.innerHTML += " " + notePrintOut[i] + " - ";
        }
    }

    document.getElementById("musicNotePrintOut").appendChild(node);

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
    document.getElementById('musicNotePrintOut').innerHTML = "";

}

function changeOct(chg){ 
    octValue = chg;
}

function changeLFOFreq(value){
    lfo.freq(value);
}

function changeLFODepth(value){
    lfo.amp(value*8);
}

function runLFO (){
    
  lpFilter.freq(lfo);
}