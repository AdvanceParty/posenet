import Keypoint from './Keypoint/Keypoint';
import FrameRater from './FrameRater';
import Hud from './Hud';

import './styles.css';

const posenet = require('@tensorflow-models/posenet');
const PARTS = require('./Keypoint/parts');
const CONFIDENCE = require('./Keypoint/confidence');
const minConfidenceToRender = CONFIDENCE.HIGH;

const pics = [];
pics[PARTS.RIGHT_EYE] = new Image();
pics[PARTS.RIGHT_EYE].src = require('./img/rightEye.png');

pics[PARTS.LEFT_EYE] = new Image();
pics[PARTS.LEFT_EYE].src = require('./img/leftEye.png');

pics[PARTS.LEFT_EAR] = new Image();
pics[PARTS.LEFT_EAR].src = require('./img/leftEar.png');

pics[PARTS.RIGHT_EAR] = new Image();
pics[PARTS.RIGHT_EAR].src = require('./img/rightEar.png');

const fr = new FrameRater();
const hud = new Hud();

const modelOptions = {
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: 513,
  multiplier: 0.75,
};

const els = {
  video: document.createElement('video'),
  canvas: document.getElementById('canvas'),
};

let model = null;

const start = async () => {
  // loadPics();

  // attach hud display
  document.body.appendChild(hud.container);

  hud.print('• Connecting to camera');
  const cam = await getCamera();

  hud.print('• Building posenet model', { append: true });
  model = await createModel();

  hud.print('• Revving engine', { append: true });
  els.video.addEventListener('canplay', () => videoReady());
  els.video.srcObject = cam;
  els.video.play();
};

const videoReady = async () => {
  hud.print('• BOOGIE TIME •');

  const { canvas, video } = els;
  const { videoWidth, videoHeight } = video;

  // Posenet throws an error unless the width and height
  // of the source image element is explicitly set
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  update();
  fr.start();
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
const createModel = () => posenet.load(modelOptions);

const update = async () => {
  const pose = await getPose(els.video);
  const points = getPointsFromPoseData(pose);

  drawScene(points);

  hud.clear();
  hud.print(`Frame RateL ${fr.fps}`);
  hud.print(
    Object.values(points)
      .map(point => point.prettyPrint())
      .join('\n'),
  );

  requestAnimationFrame(update);
};

const getPose = img => {
  const opts = { flipHorizontal: true };
  return model.estimateSinglePose(img, opts);
};

const drawScene = points => {
  const { canvas } = els;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawImg(points[PARTS.RIGHT_EYE], context, pics[PARTS.RIGHT_EYE]);
  drawImg(points[PARTS.LEFT_EYE], context, pics[PARTS.LEFT_EYE]);
  // drawImg(points[PARTS.RIGHT_EAR], context, pics[PARTS.RIGHT_EAR]);
  // drawImg(points[PARTS.LEFT_EAR], context, pics[PARTS.LEFT_EAR]);
};

const drawImg = (point, context, img) => {
  if (!point) return;

  const xPos = point.x - img.width / 2;
  const yPos = point.y - img.height / 2;
  context.drawImage(img, xPos, yPos);
};

const drawPoint = (point, context, style = { lineWidth: 5, strokeStyle: 'white' }) => {
  if (!point) return;

  context.beginPath();
  context.lineWidth = style.lineWidth;
  context.strokeStyle = style.strokeStyle;
  context.rect(point.x + 150, point.y - 100, 10, 10);
  context.stroke();
};

const getPointsFromPoseData = pose => {
  return pose.keypoints.reduce((acc, pointData) => {
    const k = new Keypoint().parse(pointData);
    return k.confidence >= minConfidenceToRender ? (acc = { [k.part]: k, ...acc }) : acc;
  }, {});
};

start();
