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

let model = null;

const start = async () => {
  els.video.addEventListener('canplay', () => videoReady());
  model = await createModel();
  els.video.srcObject = await getCamera();
  els.video.play();
};

const videoReady = async () => {
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

/**
 * @returns promise
 */
const getCamera = () => {
  try {
    const opts = { video: true, audio: false };
    return navigator.mediaDevices.getUserMedia(opts);
  } catch (e) {
    console.log('Error starting video stream:', err);
  }
};

/**
 * @returns promise
 */
const createModel = () => {
  return posenet.load(modelOptions);
};

const update = async () => {
  const { video, canvas } = els;
  const context = canvas.getContext('2d');
  const opts = { flipHorizontal: false };

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pose = await model.estimateSinglePose(video, opts);

  requestAnimationFrame(update);
};

start();
