// import * as tf from '@tensorflow/tfjs';
// import * as tmPose from '@teachablemachine/pose';

// import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js';
// import * as tmPose from 'https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js';

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = 'https://teachablemachine.withgoogle.com/models/rShjTwWj/';
let model;
let webcam;
let ctx;
let labelContainer;
let maxPredictions;

async function init() {
  const modelURL = `${URL}model.json`;
  const metadataURL = `${URL}metadata.json`;

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const w = window.parent.screen.width / 4;
  const h = window.parent.screen.height / 4;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(w, h, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById('canvas');
  canvas.width = w; canvas.height = h;
  ctx = canvas.getContext('2d');
  labelContainer = document.getElementById('label-container');
  for (let i = 0; i < maxPredictions; i++) { // and class labels
    const valueElement = document.createElement('div');
    valueElement.className = 'detected-values';
    labelContainer.appendChild(valueElement);
  }

  // example img
  const img = document.getElementById('img-example');
  img.setAttribute('src', './img/circle-woman.jpg');
  img.setAttribute('width', w);
  img.setAttribute('height', h);
  const title = document.getElementById('title-message');
  title.innerHTML = 'LIVE Fit!';
  const msg = document.getElementById('order-message');
  msg.innerHTML = '左の写真と同じポーズをとってみよう！';
}

async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);
  const msg = document.getElementById('correct-message');
  const circle = prediction[0];
  if (circle.probability.toFixed(2) > 0.9) {
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

  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}

init();
