const BASE_STRINGS = [4, 9, 14, 19, 24, 29];
const MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];
const NUM_STRINGS = 6;
const NUM_FRETS = 21;
// let MODE = "HARMONY";
let MODE = "MELODY";

// A marked fret is one for visualization purposes only
// An activated fret is one that is being played at the moment (happens only for an instant)
// fretted means that the fret has been clicked on and is ready to be activated


// TODO make a context class with all data and pass that around.
// Then we won't have to reach in here with getters and setters we do
// add in ability to have superset chords as well.
// ability to randomize the chord sequence as well as a random chord sequence
// ability to refret justPlayed for fast modification
// show current mode next to settings
// add in isplayable into conideration when

// Keyboard only navigation (a setting in the setting menu) (maybe just do vim controls lol, yeah this.)
// press a letter from qwerty which gives you a selection of each of the strings 0 up to 5
// if you are on a string which already has a fret selected the letters a/s followd by a number
// add or subtract that many frets, and clamp between 0 and numFrets
// You can also specify an absolute position by pressing some key and then a fret number

// You use vim controls in normal mode and then pressing space will create/select a fret and then you can move it
// or auto select based on if you're on it, I guess I can decide.

// an option to load in my custom settings in the terminal that no one knows about

// add information about other hotkeys to it. as well as format for the chord sequence.
// add in parsing for different type of sequence.

let noteToInteger = {
    "C": 0,
    "C#/Db": 1,
    "D": 2,
    "D#/Eb": 3,
    "E": 4,
    "F": 5,
    "F#/Gb": 6,
    "G": 7,
    "G#/Ab": 8,
    "A": 9,
    "A#/Bb": 10,
    "B": 11,
}

let integerToNote = invertDictionary(noteToInteger);

// var KEY = getRandomInt(12);
var KEY = 0;

let tonePosition = 0;

function posMod(n, d) {
    return ((n % d) + d) % d;
}

function normalizeIntegerChord(integerChord) {
    return integerChord.map(n => {
        return posMod(n - integerChord[0],12);
    });
}

let notationMode = "INTEGER";

let standardToInteger = {
    "X": [0, 4, 7 ],
    "X5": [0, 7 ],
    "X2": [0, 2, 7 ],
    "Xadd9": [0, 2, 4, 7 ],
    "X+": [0, 4, 8 ],
    "Xo": [0, 3, 6 ],
    "Xsus": [0, 5, 7 ],
    "X-": [0, 3, 7 ],
    "XΔ7": [0, 4, 7, 11 ],
    "X-7": [0, 3, 7, 10 ],
    "X7": [0, 4, 7, 10 ],
    "X7sus": [0, 5, 7, 10 ],
    "X∅7": [0, 3, 6, 10 ],
    "Xo7": [0, 3, 6, 9 ],
    "XΔ9": [0, 2, 4, 7, 11 ],
    "XΔ13": [0, 2, 4, 7, 9, 11 ],
    "X6": [0, 4, 7, 9 ],
    "X69": [0, 2, 4, 7, 9 ],
    "XΔ7#11": [0, 4, 6, 7, 11 ],
    "XΔ9#11": [0, 2, 4, 6, 7, 11 ],
    "XΔ7#5": [0, 4, 8, 11 ],
    "X-6": [0, 3, 7, 9 ],
    "X-69": [0, 2, 3, 7, 9 ],
    "X-Δ7": [0, 3, 7, 11 ],
    "X-Δ9": [0, 2, 3, 7, 11 ],
    "X-9": [0, 2, 3, 7, 10 ],
    "X-11": [0, 2, 3, 5, 7, 10 ],
    "X-7b5": [0, 3, 6, 10 ],
    "X∅9": [0, 2, 3, 6, 10 ],
    "X-b6": [0, 3, 7, 8 ],
    "X-#5": [0, 3, 8 ],
    "X9": [0, 2, 4, 7, 10 ],
    "X7b9": [0, 1, 4, 7, 10 ],
    "X7#9": [0, 3, 4, 7, 10 ],
    "X7#11": [0, 4, 6, 7, 10 ],
    "X7b5": [0, 4, 6, 10 ],
    "X7#5": [0, 4, 8, 10 ],
    "X9#11": [0, 2, 4, 6, 7, 10 ],
    "X9b5": [0, 2, 4, 6, 10 ],
    "X9#5": [0, 2, 4, 8, 10 ],
    "X7b13": [0, 4, 7, 8, 10 ],
    "X7#9#5": [0, 3, 4, 8, 10 ],
    "X7#9b5": [0, 3, 4, 6 ],
    "X7#9#11": [0, 3, 4, 6, 7, 10 ],
    "X7b9#11": [0, 1, 4, 6, 7, 10 ],
    "X7b9b5": [0, 1, 4, 6, 10 ],
    "X7b9#5": [0, 1, 4, 8, 10 ],
    "X7b9#9": [0, 1, 3, 4, 7, 10 ],
    "X7b9b13": [0, 1, 4, 7, 8, 10 ],
    "X7alt": [0, 1, 3, 4, 8, 10, 6 ],
    "X13": [0, 2, 4, 5, 7, 9, 10 ],
    "X13#11": [0, 2, 4, 6, 7, 9, 10 ],
    "X13b9": [0, 1, 4, 5, 7, 9, 10 ],
    "X13#9": [0, 3, 4, 5, 7, 9, 10 ],
    "X7b9sus": [0, 1, 5, 7, 10 ],
    "X7susadd3": [0, 4, 5, 7, 10 ],
    "X9sus": [0, 2, 5, 7, 10 ],
    "X13sus": [0, 2, 5, 7, 9, 10 ],
    "X7b13sus": [0, 5, 7, 8, 10 ],
    "X11": [0, 2, 4, 5, 7, 10 ],
}

let integerToStandard = invertDictionary(standardToInteger);

// HELPERS

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function invertDictionary(dictionary){
    let ret = {};
    for(let key in dictionary){
        ret[dictionary[key]] = key;
    }
    return ret;
}

function setNotationMode(mode) {
    notationMode = mode;
}

function setKey(newKey) {
    KEY = newKey;
    let keyElement = document.getElementById("key");
    if (notationMode === "INTEGER") {
        keyElement.innerHTML = newKey.toString();
    } else if (notationMode === "STANDARD") {
        keyElement.innerHTML = integerToNote[newKey];
    }
}

function shuffle(array) {
    // in place
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function getKey() {
    return KEY;
}

function arraysEqual(a, b) {
    a = a.slice(0);
    b = b.slice(0);

    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    a.sort()
    b.sort()

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function quotientRemainder(n, d) {
    let quotient = Math.floor(n/d);
    let remainder = n % d;
    return [quotient, remainder];
}

function constructNoteAndOctaveFromFretboardPosition(string, fret) {
    const inverted_y_index = (NUM_STRINGS - 1) - string;
    let octave, note;
    [octave, note] = quotientRemainder((BASE_STRINGS[inverted_y_index] + fret), 12);
    octave += 3;
    return [octave, note];
}

function preloadAudio() {
    let progress = document.getElementById("progress");
    for (let i = 0; i < NUM_STRINGS; i++) {
        for (let j = 0; j < NUM_FRETS; j++) {
            const [octave, note] = constructNoteAndOctaveFromFretboardPosition(i, j);
            // this makes sense since we iterate from 0 to 5 and then from 0 to 20
            // so the final number is 120, which is 5 * 20 (we don't count last fret)
            let total = (NUM_FRETS - 1) * NUM_STRINGS;
            let numConstructed = i * j + j;
            let progressPercent = numConstructed/total * 100;
            let progressString = `${progressPercent}%`;
            progress.style.width = progressString;
            progress.innerHTML = progressString;
            let x = new Audio(`../guitar_samples/${octave}_${note}.flac`);
            // x.muted = true;
            // x.play();
            console.log(`loading : ../guitar_samples/${octave}_${note}.flac`)
        }
    }
}

function loadNotation() {
    setKey(KEY);
}

function fretPosition(position) {
    // Forces it so that you can only have a single finger per string
    // position is a table cell
    // fret is a verb here

    let table = document.getElementById("fret_table");
    for (let string of table.rows) {
        if (string.contains(position)) {
            for (let fret of string.cells) {
                if (fret === position) {
                    fret.classList.toggle("fretted");
                } else {
                    fret.classList.remove("fretted");
                }
            }
        }
    }
}

function tableCreate() {

    let tbl = document.createElement('table');
    tbl.id = "fret_table";
    tbl.style.border = '1px solid black';

    loadNotation();

    for (let i = 0; i < NUM_STRINGS; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < NUM_FRETS; j++) {
            const [octave, note] = constructNoteAndOctaveFromFretboardPosition(i, j);
            const td = tr.insertCell();
            td.classList.add("fret")
            if (j === 0) {
                td.appendChild(document.createTextNode("o"));
            } else {
                td.appendChild(document.createTextNode("*"));
            }
            td.id = `${octave}_${note}`;
            td.onclick = function () {
                if (MODE === "HARMONY") {
                    fretPosition(td);
                } else if (MODE === "MELODY") {
                    new Audio(`../guitar_samples/${octave}_${note}.flac`).play();
                    td.classList.add("activated");
                    td.classList.add("just_played");
                    let chordWindow = document.getElementById("chord_window");
                    chordWindow.innerHTML = posMod(note - KEY, 12).toString();
                    // this.style.transitionDuration = "0.001ms"
                    // this.style.backgroundColor = 'green';
                }
            }
            td.addEventListener("transitionend", function() {
                // This gets called when it turns to blue or when it turns green
                // After one is activated it gets the just_played tag
                if (this.classList.contains("just_played")) {
                    this.classList.remove("activated");
                }
            })
            if (MARKERS.includes(j)) {
                td.style.borderRight = '3px solid black';
                td.style.borderLeft = '1px solid black';
                td.style.borderTop = '1px solid black';
                td.style.borderBottom = '1px solid black';
            } else {
                td.style.border = '1px solid black';
            }
        }
    }

    let fretboard = document.getElementById("fretboard")
    fretboard.appendChild(tbl);
    // body.appendChild(tbl);
}

function unmarkFrets() {
    let markedFrets = Array.from(document.getElementsByClassName("marked"));
    for (let i = 0; i < markedFrets.length; i++) {
        let markedFret = markedFrets[i];
        markedFret.classList.toggle("marked")
    }
}

function clearPrevious() {
    let frettedNotes = Array.from(document.getElementsByClassName("fretted"));
    for (let i = 0; i < frettedNotes.length; i++) {
        let frettedNote = frettedNotes[i];

        frettedNote.classList.toggle("fretted");
    }
}

function playChord() {
    // Copy since we are modifying during iterations by using toggle
    let justFrettedNotes = Array.from(document.getElementsByClassName("just_played"));
    // Unmark previous chord
    for (let i = 0; i < justFrettedNotes.length; i++) {
        let justFrettedNote = justFrettedNotes[i];
        justFrettedNote.classList.toggle("just_played");
    }
    let frettedNotes = Array.from(document.getElementsByClassName("fretted"));
    let notesPlayed = [];
    // play sound and visual feedback on chord that is just played
    for (let i = 0; i < frettedNotes.length; i++) {
        let frettedNote = frettedNotes[i];
        const [octave, note] = frettedNote.id.split("_").map(Number)
        notesPlayed.push(note);
        new Audio(`../guitar_samples/${octave}_${note}.flac`).play();
        frettedNote.classList.add("activated");
        frettedNote.classList.toggle("just_played");
    }
    // Removes duplicates (octave equivalence)
    let cleanedNotesPlayed = [...new Set(notesPlayed)];
    let keyIntervalsPlayed = cleanedNotesPlayed.map(n => (n - KEY + 12) % 12);
    shuffle(keyIntervalsPlayed);
    let chordWindow = document.getElementById("chord_window");
    chordWindow.innerHTML = keyIntervalsPlayed.toString().replace(/,/g, ' ');
}

document.body.onkeyup = function(e){
    if (e.key === 'H'){
        MODE = "HARMONY"
    }
    if(e.key === 'M'){
        MODE = "MELODY"
        // Turn off fretted Notes
        let frettedNotes = Array.from(document.getElementsByClassName("fretted"));
        for (let i = 0; i < frettedNotes.length; i++) {
            let frettedNote = frettedNotes[i];
            frettedNote.classList.toggle("fretted")
        }
    }
    if (e.key === 'A') {
        let frets = Array.from(document.getElementsByClassName("fret"));
        let randomFret = frets[getRandomInt(frets.length)];
        randomFret.classList.add("marked");
    }
    if (e.key === 'C') {
        clearPrevious();
    }
    if (e.key === 'U') { // Unmark
        unmarkFrets();
    }
    if(MODE === "HARMONY" && e.key === ' '){
        playChord();
        // unmarkFrets();
        clearPrevious();
    }
}

function constructLoadingArea() {
    let loaderDiv = document.createElement('div');
    loaderDiv.classList.add("centered_container");
    loaderDiv.id = "loading_area";
    loaderDiv.style.width = "80%";
    let progressBar = document.createElement('div');
    progressBar.id = "progress_bar";
    let progress = document.createElement('div');
    progress.id = "progress";
    // progress.innerHTML = "10%";
    let fretboard = document.getElementById("fretboard");
    let textProgress = document.createElement('div');
    textProgress.id = "text_progress";
    progressBar.appendChild(progress);
    loaderDiv.appendChild(progressBar);
    loaderDiv.appendChild(textProgress);
    fretboard.appendChild(loaderDiv);
}

function removeLoadingArea() {
    let loadingArea = document.getElementById("loading_area");
    let fretboard = document.getElementById("fretboard")
    fretboard.removeChild(loadingArea);
}

window.onload = function () {
    constructLoadingArea();
    preloadAudio();
    removeLoadingArea();
    console.log("yes");
    tableCreate();
}

export { setKey, getKey, setNotationMode, loadNotation };
