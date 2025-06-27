
const startBtn = document.getElementById("startBtn");
const startCaptureBtn = document.getElementById("startCaptureBtn");
const landingPage = document.getElementById("landingPage");
const capturePage = document.getElementById("capturePage");
const resultPage = document.getElementById("resultPage");
const video = document.getElementById("video");
const countdown = document.getElementById("countdown");
const finalStrip = document.getElementById("finalStrip");
const flash = document.getElementById("flash");
const downloadBtn = document.getElementById("downloadBtn");
const snapSound = document.getElementById("snapSound");
const addTextBtn = document.getElementById("addTextBtn");
const userText = document.getElementById("userText");

let stream;
let photos = [];
let captureCount = 0;
let overlayText = "";
let selectedBgColor = "white";
const photoWidth = 300;
const photoHeight = 240;

function showPage(page) {
  [landingPage, capturePage, resultPage].forEach(p => p.classList.add("hidden"));
  page.classList.remove("hidden");
}

startBtn.onclick = async () => {
  showPage(capturePage);
  stream = await navigator.mediaDevices.getUserMedia({ video: { width: photoWidth, height: photoHeight } });
  video.srcObject = stream;
};

startCaptureBtn.onclick = () => {
  startCaptureBtn.style.display = "none";
  photos = [];
  captureCount = 0;
  countdown.innerText = "";
  startCountdownAndCapture();
};

function startCountdownAndCapture() {
  let seconds = 3;
  countdown.innerText = seconds;

  const countdownInterval = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      countdown.innerText = seconds;
    } else {
      clearInterval(countdownInterval);
      countdown.innerText = "";
      takePhoto();
    }
  }, 1000);
}

function takePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = photoWidth;
  canvas.height = photoHeight;
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  photos.push(canvas);

  snapSound.play();
  flash.classList.add("show");
  setTimeout(() => flash.classList.remove("show"), 200);

  captureCount++;
  if (captureCount < 3) {
    setTimeout(() => startCountdownAndCapture(), 1000);
  } else {
    stream.getTracks().forEach(track => track.stop());
    showResult();
  }
}

function showResult() {
  showPage(resultPage);
  renderStrip(selectedBgColor);

  document.querySelectorAll(".color-box").forEach(box => {
    box.addEventListener("click", () => {
      selectedBgColor = box.dataset.color;
      renderStrip(selectedBgColor);
    });
  });

  downloadBtn.onclick = () => {
    downloadBtn.href = finalStrip.toDataURL("image/png");
  };
}

addTextBtn.onclick = () => {
  overlayText = userText.value;
  renderStrip(selectedBgColor);
};

function renderStrip(color) {
  const ctx = finalStrip.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, finalStrip.width, finalStrip.height);

  const margin = 10;
  photos.forEach((photo, i) => {
    const topOffset = margin + i * (photoHeight + margin);
    ctx.drawImage(photo, margin, topOffset, photoWidth, photoHeight);
  });

  if (overlayText) {
    ctx.fillStyle = "#000";
    ctx.font = "18px 'Noto Sans TC'";
    ctx.textAlign = "center";
    ctx.fillText(overlayText, finalStrip.width / 2, finalStrip.height - 20);
  }
}


document.getElementById("lineShare").addEventListener("click", function () {
  const base64Image = finalStrip.toDataURL("image/png");
  const blob = dataURItoBlob(base64Image);
  const tempURL = URL.createObjectURL(blob);
  const message = encodeURIComponent("來看看我的拍貼！請在電腦上下載並分享到手機：https://yourwebsite.com"); // Replace as needed
  this.href = `https://line.me/R/msg/text/?${message}`;
});

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
