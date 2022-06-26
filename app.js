// Set up the AudioContext and the dac.
const audioCtx = new AudioContext();
const dac = audioCtx.destination;


// Save a space for the audio data.
let buffer;
// The window shape to be used by `.setValueCurveAtTime()`.
let curve = new Float32Array([0, 0.3, 1, 0.3, 0]);

// Load the sound file, and store the data to our `buffer` variable.
const request = new XMLHttpRequest();
request.open("get", 'https://bjarnig.s3.eu-central-1.amazonaws.com/sounds/snd.mp3', true);
request.responseType = "arraybuffer";
request.onload = () => audioCtx.decodeAudioData(request.response, (data) => buffer = data);
request.send();

// Play a random grain.
const playGrain = (startTime, grainDuration, pos) => {

  // Create a node to play from a buffer.
  const grain = audioCtx.createBufferSource();
  grain.buffer = buffer;

  // Create a node to control the buffer's gain.
  const grainGain = audioCtx.createGain()
  grainGain.connect(dac);

  // Create a window.
  grainGain.gain.setValueAtTime(0, startTime);
  grainGain.gain.setValueCurveAtTime(curve, startTime, grainDuration);

  // put it randomly in the stereo field
  const panNode = audioCtx.createStereoPanner();
  let panVal = (((Math.random() * 2) - 1) + pos);
  if (panVal >= 0){
    panNode.pan.value =  (panVal % 1);

  } else{
    panNode.pan.value =  (1 - (panVal % 1))*(-1);
  };

  grain.connect(panNode);
  panNode.connect(grainGain);
  // Choose a random place to start.
  const offset = Math.random() * (buffer.duration - grainDuration);

  // Play the grain.
  grain.start(startTime, offset, grainDuration);
};


// Run the granulation when you click the play button.
$("#play").on("click", () => {
  // Get overlap time, grain duration, and total time from input sliders
  const overlapTime = Number($("#overlap-time").val() / 1000);
  const grainDuration = Number($("#grain-duration").val() / 1000);
  const totalTime = Number($("#total-time").val());
  const position =  Number($("#pos").val()/100);
  // const gateChance = Number($("#reverb-gate-chance").val() / 100);
  const numberOfGrains = (totalTime - grainDuration) / overlapTime;

  // Perform the granulation
  for (let i = 0; i < numberOfGrains; i += 1) {
    playGrain(audioCtx.currentTime + i * overlapTime, grainDuration, position);
  }
});


// Handle slider UI.
$("#second-level").on("change", () => {
  $("#second-level-indicator").text($("#second-level").val());
  curve[1] =  $("#second-level").val()/100;
});
$("#beforelast-level").on("change", () => {
  $("#beforelast-level-indicator").text($("#beforelast-level").val());
  curve[3] =  $("#second-level").val()/100;
});
$("#exponent").on("change", () => {
  $("#exponent-indicator").text($("#exponent").val());
  for(let i =0; i < curve.length; i++ ){
    curve[i] =  Math.pow(curve[i], $("#exponent").val());
  };
});
$("#overlap-time").on("change", () => {
  $("#overlap-time-indicator").text($("#overlap-time").val() + " ms");
});
$("#grain-duration").on("change", () => {
  $("#grain-duration-indicator").text($("#grain-duration").val() + " ms");
});
// $("#reverb-gate-chance"). on("change", () => {
//   $("reverb-gate-chance-indicator").text($("#reverb-gate-chance").val() +  " %");
// });
let cent=100;
$("#pos").on("change", () => {
  if ($("#pos").val()>= 50){
    cent = (100 - $("#pos").val());
  }else {
    cent =  $("#pos").val();
    };
  $("#pos-indicator").text("Left: " + (100 - $("#pos").val() + "%") +" | center: " + cent + "%" + " | Right: " +  $("#pos").val()+ "%");
});
$("#total-time").on("change", () => {
  $("#total-time-indicator").text($("#total-time").val() + " seconds");
});

$("#overlap-time-indicator").text($("#overlap-time").val() + " ms");
$("#grain-duration-indicator").text($("#grain-duration").val() + " ms");
$("#pos-indicator").text("Left: " + (100 - $("#pos").val() + "%") +" | center: " + cent + "%" + " | Right: " +  $("#pos").val()+ "%");
// $("#reverb-gate-chance-indicator").text($("#reverb-gate-chance").val() + " %");
$("#total-time-indicator").text($("#total-time").val() + " seconds");

// Listen to the click event of the button
// document.getElementById("impulseB").addEventListener("click", loadImpulse);
