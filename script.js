
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const finalCanvas = document.getElementById('finalStrip');
const ctx = finalCanvas.getContext('2d');
const addTextBtn = document.getElementById('addTextBtn');
const textInputModal = document.getElementById('textInputModal');
const textInputField = document.getElementById('textInput');
const applyTextBtn = document.getElementById('applyText');
const downloadBtn = document.getElementById('downloadBtn');
const colorOptions = document.querySelectorAll('.color-option');

let photoArray = [];
let photoCount = 3;
let textOverlay = '';
let selectedBackgroundColor = 'white';

// Start camera
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing camera:", err);
  });

// Flash effect
function flashScreen() {
  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 100);
}

// Capture photo
function capturePhoto() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  photoArray.push(canvas);
  flashScreen();
  const shutterSound = new Audio('shutter.mp3');
  shutterSound.play();
}

// Countdown and auto-take 3 photos
function startCaptureSequence() {
  captureBtn.disabled = true;
  let current = 0;

  const takeNextPhoto = () => {
    if (current >= photoCount) {
      generatePhotoStrip();
      return;
    }

    let countdown = 3;
    const countdownInterval = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        capturePhoto();
        current++;
        setTimeout(takeNextPhoto, 500);
      }
      countdown--;
    }, 1000);
  };

  takeNextPhoto();
}

captureBtn.addEventListener('click', startCaptureSequence);

// Generate final strip
function generatePhotoStrip() {
  const padding = 20;
  const extraTextHeight = 80;
  const photoWidth = photoArray[0].width;
  const photoHeight = photoArray[0].height;

  finalCanvas.width = photoWidth + padding * 2;
  finalCanvas.height = photoHeight * photoArray.length + padding * (photoArray.length + 1) + extraTextHeight;

  ctx.fillStyle = selectedBackgroundColor;
  ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  photoArray.forEach((photo, index) => {
    const x = padding;
    const y = padding + index * (photoHeight + padding);
    ctx.drawImage(photo, x, y, photoWidth, photoHeight);
  });

  // Draw text
  if (textOverlay) {
    ctx.fillStyle = 'black';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(textOverlay, finalCanvas.width / 2, finalCanvas.height - extraTextHeight / 2);
  }

  document.getElementById('resultPage').style.display = 'block';
}

// Add text
addTextBtn.addEventListener('click', () => {
  textInputModal.style.display = 'flex';
  finalCanvas.style.opacity = 0.5;
});

applyTextBtn.addEventListener('click', () => {
  textOverlay = textInputField.value;
  textInputModal.style.display = 'none';
  finalCanvas.style.opacity = 1;
  generatePhotoStrip();  // regenerate with new text
});

// Download
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'photostrip.png';
  link.href = finalCanvas.toDataURL();
  link.click();
});

// Color change
colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    selectedBackgroundColor = option.dataset.color;
    generatePhotoStrip();  // update background
  });
});