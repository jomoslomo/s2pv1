let mic; // audio input
let recorder; // sound recorder
let soundFile; // recorded sound file
let isRecording = false; // whether the program is currently recording
let isPlaying = false; // whether the program is currently playing back recorded sound
let captureButton, stopButton, playbackButton, uploadButton; // buttons to start, stop, and playback recording
let graphGenerated = false;
let displayShape = false;
let exportButton;
let video; // webcam video
let thicknessSlider; // slider to control radial graph thickness
let thicknessLabel; // label for radial graph thickness slider
let radiusSlider;
let radiusLabel
let amplitudeSlider; 
let interpolationValue = 0.5;
let interpolationSlider;
let graphX, graphY;
let ampLabel;
let currentScale = 1, currentAngle = 0;

let transform = {
  angle: 0,
  scale: 1,
  x: 0,
  y: 0
}

function setup() {
  imageMode(CENTER);
  angleMode(DEGREES);
  let canvas = createCanvas(windowWidth, windowHeight); // create canvas
  
  interact(canvas.elt)
  .draggable({
    // enable inertial throwing
    // inertia: true,
    // keep the element within the area of it's parent
    // modifiers: [
    //   interact.modifiers.restrictRect({
    //     restriction: 'parent',
    //     endOnly: true
    //   })
    // ],
    // enable autoScroll
    // autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move (event) {
        transform.x += event.dx;
        transform.y += event.dy;
      }
    }
  })
  .gesturable({
    listeners: {
      start (event) {
        transform.angle -= event.angle
      },
      move (event) {
        console.log("scale: " + event.scale);
        // document.body.appendChild(new Text(event.scale))
        currentAngle = event.angle + transform.angle
        currentScale = event.scale * transform.scale
      },
      end (event) {
        transform.angle = transform.angle + event.angle
        transform.scale = transform.scale * event.scale
      }
    }
  });


  mic = new p5.AudioIn(); // create audio input object
  mic.start(); // start audio input
  recorder = new p5.SoundRecorder(); // create sound recorder object
  recorder.setInput(mic); // set input for recorder object to audio input
  soundFile = new p5.SoundFile(); // create sound file object
  graphX = width / 2;
  graphY = height / 2;
  
  const buttonContainer = createDiv();
  buttonContainer.addClass('button-container');



  // Create the playback button and append it to the container
  playbackButton = createButton('Playback');
  playbackButton.mousePressed(playbackRecording);
  playbackButton.style('font-size', '24px');
  playbackButton.style('width', '120px');
  playbackButton.style('height', '60px');
  buttonContainer.child(playbackButton);

  // Create the export button and append it to the container
  exportButton = createButton('Export Graph');
  exportButton.mouseClicked(exportImage);
  exportButton.style('font-size', '24px');
  exportButton.style('width', '180px');
  exportButton.style('height', '60px');
  buttonContainer.child(exportButton);

  // Create the upload button and append it to the container
  uploadButton = createButton('Upload');
  uploadButton.mouseClicked(uploadFile);
  uploadButton.style('font-size', '24px');
  uploadButton.style('width', '120px');
  uploadButton.style('height', '60px');
  buttonContainer.child(uploadButton);

  // Append the button container to the body of the HTML document
  buttonContainer.parent(document.body);

  // Create slider and label for radial graph thickness
  thicknessSlider = createSlider(1, 50, 10);
  thicknessSlider.position(20, 110 );
  thicknessLabel = createDiv('Radial Graph Thickness');
  thicknessLabel.position(20, 80);

  amplitudeSlider = createSlider(1, 200, 100);
  amplitudeSlider.position(20, 180);
  ampLabel.position(20, 110);
  ampLabel.createDiv('Amplitude');


}

function draw() {
  clear();
  textSize(20); // set text size
  // text(currentScale, 20, height - 40);
  // text(currentAngle, 20, height - 80);
  fill(0); // set fill color

  if (soundFile.duration() > 0)
    displayRadialGraph(soundFile);
}

function startRecording() {
  userStartAudio();
  if (!isRecording) { // if program is not currently recording
    
    recorder.record(soundFile); // start recording into sound file object
    isRecording = true; // set recording flag to true
  }
}

function stopRecording() {
  if (isRecording) { // if program is currently recording
    recorder.stop(); // stop recording
    isRecording = false; // set recording flag to false
    soundFile.playMode('sustain'); // set play mode for sound file to sustain
  }
}

function playbackRecording() {
  if (!isRecording && !isPlaying && soundFile.duration() > 0) { // if program is not currently recording or playing back and sound file has recorded audio
    soundFile.play(); // play back sound file
    isPlaying = true; // set playing flag to true
    
    soundFile.onended(stopPlayback); // call stopPlayback() function when playback is complete
  }
}

function stopPlayback() {
  isPlaying = false; // set playing flag to false
  graphGenerated = true;

}

function displayRadialGraph(sound) {
  push();
    translate(width/2+transform.x,height/2+transform.y);
    scale(currentScale);
    rotate(currentAngle);
    let waveform = sound.getPeaks(width/2); // get waveform of sound file
    stroke(255,0,0, 90); // set stroke color
    strokeWeight(thicknessSlider.value());
    noFill(); // remove fill color

    beginShape(); // start shape
      for (let i = 0; i < waveform.length; i++) { // loop through waveform
        let theta = map(i, 0, waveform.length, 0, TWO_PI); // map index to angle
        let adjustedWaveform = waveform[i] * (amplitudeSlider.value() / 100); // adjust waveform value by amplitude slider
        //console.log("theta: " + theta);
        let radius = map(adjustedWaveform, -1, 1, 0, 200); // map value to radius
        //console.log("radius: " + radius);
        let x = (radius) * Math.cos(theta); // calculate x-coordinate based on angle and radius
        let y = (radius) * Math.sin(theta); // calculate y-coordinate based on angle and radius
        curveVertex(x, y); // add vertex to shape
      }
    endShape(CLOSE); // end shape and connect last vertex to first vertex
  pop();
  
}





// // function displayRadialGraph(sound) {
// //   let waveform = sound.getPeaks(width); // get waveform of sound file
// //   push();
// //   stroke(0); // set stroke color
// //   noFill(); // remove fill color
// //   beginShape(); // start shape
// //   for (let i = 0; i < waveform.length; i++) { // loop through waveform
// //     let angle = map(i, 0, waveform.length, 0, TWO_PI); // map index to angle
// //     let radius = map(waveform[i], -1, 1, 0, height/2); // map value to radius
// //     let x = width/2 + radius * cos(angle); // calculate x-coordinate based on angle and radius
// //     let y = height/2 + radius * sin(angle); // calculate y-coordinate based on angle and radius
// //     vertex(x, y); // add vertex to shape
// //   }
// //   endShape(CLOSE); // end shape and connect last vertex to first vertex
// //   pop()
// // }




function display3DRadialGraph(sound) {
  let waveform = sound.getPeaks(width); // get waveform of sound file
  let numCylinders = waveform.length;
  let angleStep = TWO_PI / numCylinders;
  orbitControl();

  // Loop through waveform and create cylinders
  for (let i = 0; i < numCylinders; i++) {
    let angle = i * angleStep;
    let radius = map(waveform[i], -1, 1, 50, height / 2);
    let x = width / 2 + radius * cos(angle);
    let y = height / 2 + radius * sin(angle);

    // Set cylinder properties
    let cylHeight = map(waveform[i], -1, 1, 10, 100);
    let cylDiameter = 5;

    // Draw the cylinder
    push();
    translate(x-200, y-200);
    scale(currentScale);
    rotateX(HALF_PI);
    fill(0, 100, 255);
    noStroke();
    cylinder(cylDiameter, cylHeight);
    pop();
  }

  // Restore original settings
  //pop();
}

function exportImage() {
  // Get the canvas element
  let canvas = document.getElementById('defaultCanvas0');

  // Convert the canvas to a data URL
  let dataURL = canvas.toDataURL('image/png');

  // Create an image element and set its source to the data URL
  let img = new Image();
  img.src = dataURL;

  // Create a link element and set its href to the data URL
  let link = document.createElement('a');
  link.href = dataURL;

  // Set the download attribute of the link to the desired file name
  link.download = 'graph.png';

  // Append the link element to the document body and click it to initiate the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Create the export directory if it does not exist
  if (!fs.existsSync('export')){
    fs.mkdirSync('export');
  }

  // Create a file writer object for the audio file
  let writer = createWriter('export/audio.wav', function(error) {
    if (error) {
      console.error('Error creating file writer:', error);
      return;
    }

    // Write the audio data to the file
    writer.write(soundFile.data);

    // Close the file writer object
    writer.close();
  });
}




function uploadFile() {
  let fileInput = createFileInput(handleFile);
  fileInput.elt.click(); // simulate a click event to open the file picker
}

function handleFile(file) {
  if (file.type === 'audio') {
    // Clear the previous sound file
    soundFile.dispose();

    // Load the new sound file
    soundFile = loadSound(file.data, function() {
      console.log('Audio file loaded successfully');
      graphGenerated = true; // Set graphGenerated to true so the new graph will be displayed
      displayRadialGraph(soundFile); // Display the radial graph for the new sound file
    });
  } else {
    console.error('Invalid file type. Please select an audio file.');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

