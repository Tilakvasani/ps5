const fs = require("fs");
const https = require("https");
const path = require("path");

const LOGOS = [
  {
    name: "iso.png",
    url: "https://medicevo.in/wp-content/uploads/2020/07/iso.png",
  },
  {
    name: "haccp.png",
    url: "https://magicomeal.in/wp-content/uploads/2019/12/haccp-logo.png",
  },
  {
    name: "fssc.png",
    url: "https://pslpet.com/wp-content/uploads/2019/12/fssc-logo.png",
  }
];
  
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const downloadFile = (name, url) => {
  return new Promise((resolve) => {
    const outputPath = path.join(publicDir, name);
    const file = fs.createWriteStream(outputPath);
    const options = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        console.warn(`[Warning] Failed to download ${name} from ${url}: Status Code ${response.statusCode}`);
        file.close();
        fs.unlink(outputPath, () => {});
        resolve(false);
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log(`[Success] Downloaded ${name} successfully!`);
        resolve(true);
      });
    }).on("error", (err) => {
      file.close();
      fs.unlink(outputPath, () => {});
      console.warn(`[Error] Failed to download ${name}: ${err.message}`);
      resolve(false);
    });
  });
};

async function main() {
  console.log("Downloading ISO, HACCP, FSSC assets...");
  for (const logo of LOGOS) {
    await downloadFile(logo.name, logo.url);
  }
  console.log("Downloads completed.");
}

main();
