const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const finalCanvas = document.getElementById('finalStrip');
const ctx = finalCanvas.getContext('2d');

let capturedImages = [];
let isCapturing = false;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

function takePhoto() {
  if (!video.videoWidth || !video.videoHeight) {
    alert("Camera not ready yet.");
    return;
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  // Mirror the video image
  context.translate(width, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0, width, height);

  capturedImages.push(canvas);

  if (capturedImages.length === 3) {
    renderPhotoStrip();
  }
}

function renderPhotoStrip() {
  const photoCount = capturedImages.length;
  const padding = 20;
  const width = capturedImages[0].width;
  const height = capturedImages[0].height;

  const stripWidth = width + padding * 2;
  const stripHeight = height * photoCount + padding * (photoCount + 1) + 60; // extra bottom padding for text

  finalCanvas.width = stripWidth;
  finalCanvas.height = stripHeight;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  for (let i = 0; i < photoCount; i++) {
    const y = padding + i * (height + padding);
    ctx.drawImage(capturedImages[i], padding, y, width, height);
  }

  // Optional placeholder text
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Your Text Here", stripWidth / 2, stripHeight - 30);
}

function countdownAndCapture() {
  if (isCapturing) return;

  isCapturing = true;
  capturedImages = [];

  let count = 3;
  captureBtn.innerText = `拍照倒數 ${count}...`;

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
      captureBtn.innerText = `拍照倒數 ${count}...`;
    } else {
      clearInterval(countdown);
      autoCapture(0);
    }
  }, 1000);
}

function autoCapture(step) {
  if (step >= 3) {
    captureBtn.innerText = "拍照完成 ✅";
    isCapturing = false;
    return;
  }

  takePhoto();

  setTimeout(() => {
    autoCapture(step + 1);
  }, 1000);
}

captureBtn.addEventListener('click', countdownAndCapture);
