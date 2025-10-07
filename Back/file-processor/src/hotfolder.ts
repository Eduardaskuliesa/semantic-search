import chokidar from "chokidar";
import path from "path";
import logger from "./utils/logger";
import config from "./config";
import fs, { createReadStream } from "fs";
import fileProcessingQueue from "./queues/localFileProccesingQueue";
import { parse } from "csv-parse";

const HOTOFOLDER_PATH = path.resolve(config.hotfolder.processPath);

function createTestFiles(fileCount: number) {
  const products = [
    "nike shoes",
    "adidas sneakers",
    "puma trainers",
    "reebok running shoes",
    "samsung phone",
    "iphone case",
    "laptop bag",
    "wireless mouse",
    "gaming keyboard",
    "office chair",
  ];

  const colors = ["black", "white", "blue", "red", "green", "gray", "brown"];
  const sizes = ["38", "39", "40", "41", "42", "43", "44", "45"];

  for (let i = 1; i <= fileCount; i++) {
    const filePath = path.join(HOTOFOLDER_PATH, `testfile${i}.csv`);

    let csvContent = "productId,productName,description\n";

    for (let row = 1; row <= 100; row++) {
      const productId = `PROD-${i}-${row.toString().padStart(3, "0")}`;
      const product = products[Math.floor(Math.random() * products.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const price = (Math.random() * 100 + 20).toFixed(2);

      const description = `This is ${product} they are very good quality newest model 2025 size is ${size} eu price is ${price} euros color is ${color} anyone who buys it will love it`;

      csvContent += `${productId},"${product}","${description}"\n`;
    }

    fs.writeFileSync(filePath, csvContent);
  }
}

// createTestFiles(10);

function enusreDirectoryExists() {
  if (!fs.existsSync(HOTOFOLDER_PATH)) {
    fs.mkdirSync(HOTOFOLDER_PATH, { recursive: true });
    logger.info(`Created hotfolder directory at: ${HOTOFOLDER_PATH}`);
  } else {
    logger.info(`Hotfolder found at: ${HOTOFOLDER_PATH}`);
  }
}
enusreDirectoryExists();

const watcher = chokidar.watch(HOTOFOLDER_PATH, {
  persistent: true,
  depth: 0,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
});

watcher.on("add", async (filePath) => {
  logger.info(`New file detected: ${filePath}`);
  if (!filePath.endsWith(".csv")) {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Error deleting non-csv file ${filePath}:`, err);
      } else {
        logger.info(`Deleted non-csv file: ${filePath}`);
      }
    });
  }

  await fileProcessingQueue.add(`${config.queue.localQueue}`, { filePath });
});
