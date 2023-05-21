import { createSignal } from "solid-js";
import imageUpload from "./assets/imageUpload.svg";
import menta from "./assets/menta.png";
import styles from "./App.module.css";
import JSZip from "jszip";
import { ConfettiExplosion } from "solid-confetti-explosion";

// Function to convert PNG to WebP
async function convertToWebP(file) {
  const reader = new FileReader();
  const image = await new Promise((resolve) => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = image;
  const webp = await new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/webp");
    };
  });

  return webp;
}

function App() {
  const [files, setFiles] = createSignal([]);
  const [isSubmitted, setIsSubmitted] = createSignal(false);

  async function handleDrop(event) {
    event.preventDefault();
    const fileList = Array.from(event.dataTransfer.files);
    setFiles(fileList);
  }

  async function handleFileInput(event) {
    const fileList = Array.from(event.target.files);
    setFiles(fileList);
  }

  // async function handleSubmit() {
  //   const convertedFiles = await Promise.all(
  //     files().map((file) => convertToWebP(file))
  //   );
  //   setFiles(convertedFiles);
  //   setIsSubmitted(true);
  // }
  async function handleSubmit() {
    const zip = new JSZip();
    const promises = [];

    for (const index in files()) {
      const file = files()[index];
      const convertedFilePromise = convertToWebP(file).then((convertedFile) => {
        zip.file(`ConvertedWebP${index}.webp`, convertedFile);
      });
      promises.push(convertedFilePromise);
    }

    await Promise.all(promises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = "converted-files.zip";
      downloadLink.click();
      setIsSubmitted(true);
    });
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  return (
    <>
      <div
        class={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <img src={imageUpload} alt="imageUpload" />
        <h3>Drag and Drop PNG files or click the button to convert to WebP</h3>
        <input
          type="file"
          accept="image/png"
          multiple
          onChange={handleFileInput}
        />
      </div>
      <button
        class={styles.button}
        disabled={files().length === 0}
        onClick={handleSubmit}
      >
        Submit
      </button>
      {isSubmitted() && <ConfettiExplosion />}
      <a href="https://github.com/mentasuave01" target="_blank">
        <div class={styles.menta}>
          <div>
            powered by <div class={styles.mentaText}>Mensuave01</div>
          </div>
          <img src={menta}></img>
        </div>
      </a>
    </>
  );
}

export default App;
