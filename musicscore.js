//more features will be added later
document.getElementById("remove").addEventListener("click", function(){
  localStorage.clear()
  location.reload()
}); 
const length_dict = {"s":1/16, "e":1/8, "q":1/4, "t":1/3, "h":1/2, "w":1}
const length_bottom_dict = {"s": 16,"e": 8,"q": 4,"t": 4,"h": 2,"w": 1};
const s_width = window.screen.availWidth;
const s_height = window.screen.availHeight;
var notes = localStorage.getItem("notes"); 
var index = localStorage.getItem("index"); 
var measures_index = localStorage.getItem("measures_index"); 
var measures =  localStorage.getItem("measures"); 
var clef = localStorage.getItem("clef")
var time = localStorage.getItem("time")
var inputkey = localStorage.getItem("inputkey")
var bpm = localStorage.getItem("bpm")
notes = JSON.parse(notes) ?? []
measures = JSON.parse(measures) ?? []
index = Number(index)
measures_index = Number(measures_index) 
if (isNaN(index)) {
  index = 0;
}
if (isNaN(measures_index)) {
  measures_index = 0;
}

function back() {
  //del previous note
  measures[measures_index][index].pop()
  location.reload()
}

document.getElementById("addnote").addEventListener("click", function(){
    var inputnote = document.getElementById("musicnote").value;
    var clef = document.getElementById("clef").value;
    clef = clef.toLowerCase();
    globalThis.clef = clef;
    var time = document.getElementById("time").value;
    globalThis.time = time;
    var inputkey = document.getElementById("key").value;
    inputkey = inputkey.toUpperCase();
    var note_length = document.getElementById("length").value;
    note_length = note_length.toLowerCase()
    var bpm = document.getElementById("bpm_in").value;
    bpm = +bpm;
    globalThis.bpm = bpm;

    if (inputkey.includes("MAJOR")) {
      inputkey = inputkey.split(' ')[0]
    } else {
      inputkey = inputkey.split(' ')[0] + "minor"
    }
    globalThis.inputkey = inputkey;

    var notes_bottom
    notes_bottom = globalThis.notes_bottom
    notes_bottom = length_bottom_dict[note_length[0].toLowerCase()]
    notes.push(inputnote + `/` + notes_bottom); 
    index+=1 
    measures[measures_index] = notes.slice()
    var total = 0
    for (var ind = 0; ind< ((measures[measures_index]).length); ind++) {
      total += 1/(measures[measures_index][ind].at(-1))
    }
    var time_backup = time
    var [ntime_top, ntime_bottom] = time.split("/")
    ntime_top = Number(ntime_top)
    ntime_bottom = Number(ntime_bottom)
    var ntime = (ntime_top / ntime_bottom)
    var time = time_backup
    globalThis.time = time;
    if (total > ntime) {
      back()
    }
    else if (total == ntime) {
      // output + switch to next measure 
      measures[measures_index] = notes
      notes = []
      index = 0
      measures_index +=1
    }
    else {
      // output
      measures[measures_index] = notes

    }
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("index", index);
    localStorage.setItem("measures", JSON.stringify(measures));
    localStorage.setItem("measures_index", measures_index);
    localStorage.setItem("clef", clef)
    localStorage.setItem("time", time)
    localStorage.setItem("inputkey", inputkey)
    localStorage.setItem("bpm", bpm)
    render()
});


// if there is an error, output it 
// else continue program
function render() {
  const { Factory } = Vex.Flow;
  let x = 0;
  let y = 0;
  let width = 175;
  // Create a VexFlow renderer attached to the DIV element with id="output".
  const vf = new Factory({ renderer: { elementId: 'output', width:s_width, height:s_height*2} });
  const score = vf.EasyScore();
  for (let measure of measures) {
    const voice = score.voice(score.notes(measure.join(', '), {stem: 'auto'}, { options: { autoStem: true }}))
    voice.setStrict(false)
    const formatter = new Vex.Flow.Formatter();
    if (measures.indexOf(measure) == 0) {
      width = ((formatter.preCalculateMinTotalWidth([voice])) + measure.length*35);
      if (measure.length <=4) {
        width += 100
      } 
    } else {
      x += width 
      width = ((formatter.preCalculateMinTotalWidth([voice])+ measure.length*25));
          if (measure.length <=2) {
              width += 25
            } 
    }

    const system = vf.System({x:x, y:y, width:width, spaceBetweenStaves:10
      });
    if (measures.indexOf(measure) == 0) {
    system.addStave({ 
      voices: [voice],
    }).addClef(`${clef}`).addTimeSignature(`${time}`).addKeySignature(`${inputkey}`);
  } else {
    system.addStave({
    voices: [voice]
    });
  }
}
  vf.draw();
}

render()
document.getElementById("play").addEventListener("click", async () => {
	await Tone.start(); 
  firsttime = true
  Tone.Transport.bpm.value = bpm;
  const synth = new Tone.Synth().toDestination();
  for (var i=0; i<measures.length; i++) {
    if (firsttime) {
      const rn = Tone.now();
      var now_c = rn
      firsttime = false
    }
    for (var g=0; g<measures[i].length; g++) {
      synth.triggerAttackRelease(measures[i][g].split("/")[0], (measures[i][g].split("/")[1]+"n"), now_c)
      now_c += (60/bpm * (time.split("/")[1] / measures[i][g].split("/")[1]))
      now_c += 0.01
    };
  }

})
