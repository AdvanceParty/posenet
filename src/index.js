import './styles.css';
const posenet = require('@tensorflow-models/posenet');

const modelOptions = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: 513,
  multiplier: 0.75,
};

const els = {
  video: document.getElementById('video'),
  canvas: document.getElementById('canvas'),
};

const start = async () => {
  const net = await posenet.load(modelOptions);
  els.video.addEventListener('canplay', () => videoReady());
  els.video.srcObject = await getCamera();
  els.video.play();
};

const videoReady = () => {
  const { canvas, video } = els;
  const { videoWidth, videoHeight } = video;

  // Posenet throws an error unless the width and height
  // of the source image element is explicitly set
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  update();
};

const getCamera = async () => {
  try {
    const opts = { video: true, audio: false };
    return await navigator.mediaDevices.getUserMedia(opts);
  } catch (e) {
    console.log('Error starting video stream:', err);
  }
};

const update = async () => {
  // const video = document.getElementById('video')
  // const canvas = document.getElementById('canvas')
  const { video, canvas } = els;
  const opts = { flipHorizontal: false };
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pose = await net.estimateSinglePose(video, opts);

  requestAnimationFrame(update);
};

start();
