// import * as tf from '@tensorflow/tfjs';
// import * as tmPose from '@teachablemachine/pose';
// import * as tmImage from '@teachablemachine/image';

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = 'https://teachablemachine.withgoogle.com/models/wMgGXgIGv/';

let model;
let webcam;
let labelContainer;
let maxPredictions;

// Load the image model and setup the webcam
async function init() {
  const modelURL = `${URL}model.json`;
  const metadataURL = `${URL}metadata.json`;

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const w = window.parent.screen.width / 3;
  const h = window.parent.screen.height / 3;
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(w, h, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById('webcam-container').appendChild(webcam.canvas);
  labelContainer = document.getElementById('label-container');
  for (let i = 0; i < maxPredictions; i++) { // and class labels
    const valueElement = document.createElement('div');
    valueElement.className = 'detected-values';
    labelContainer.appendChild(valueElement);
  }

  // example img
  const img = document.getElementById('img-example');
  img.setAttribute('src', './img/pose_heart_hand_woman.png');
  img.setAttribute('width', w);
  img.setAttribute('height', h);
  const title = document.getElementById('title-message');
  title.innerHTML = 'LIVE FIT!';
  const msg = document.getElementById('order-message');
  msg.innerHTML = '左の写真と同じポーズをとってみよう！';
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  const heart = prediction[0];
  const msg = document.getElementById('correct-message');
  if (heart.probability.toFixed(1) > 0.9) {
    msg.style.backgroundColor = '#DB6273';
    msg.innerHTML = 'それそれ！そのポーズ！！！';
  } else {
    msg.style.backgroundColor = '#41B6CA';
    msg.innerHTML = 'ちょっと違うかも・・・';
  }
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}`;
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
}
init();
