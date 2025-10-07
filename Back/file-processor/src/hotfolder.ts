import chokidar from "chokidar";
import path from "path";
import logger from "./utils/logger";
import config from "./config";
import fs from "fs";

const HOTOFOLDER_PATH = path.resolve(config.hotfolder.processPath);

function creeateTestFiles(fileCount: number) {
  for (let i = 1; i <= fileCount; i++) {
    const filePath = path.join(HOTOFOLDER_PATH, `testfile${i}.csv`);
    fs.writeFileSync(filePath, `This is test file ${i}`);
  }
}

creeateTestFiles(10)

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
});
