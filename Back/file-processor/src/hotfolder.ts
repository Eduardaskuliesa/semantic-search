import chokidar from "chokidar";
import path from "path";
import logger from "./utils/logger";
import config from "./config";
import fs from "fs";
import { randomUUID } from "crypto";
import fileProcessingQueue from "./queues/localFileProccesingQueue";
import { log } from "console";

const HOTOFOLDER_PATH = path.resolve(config.hotfolder.processPath);

function createTestFiles(fileCount: number) {
  const products = [
    "Nike Air Max sneakers",
    "Adidas Ultra Boost running shoes",
    "Puma RS-X trainers",
    "Reebok Classic leather shoes",
    "New Balance 574 sneakers",
    "Samsung Galaxy S24 phone",
    "iPhone 15 Pro Max",
    "MacBook Pro 16-inch laptop",
    "Dell XPS 13 ultrabook",
    "HP Pavilion gaming laptop",
    "Logitech MX Master 3 wireless mouse",
    "Razer DeathAdder gaming mouse",
    "Corsair K95 mechanical keyboard",
    "Keychron K2 wireless keyboard",
    "Herman Miller Aeron office chair",
    "Secretlab Titan gaming chair",
    "Sony WH-1000XM5 headphones",
    "AirPods Pro 2",
    "Bose QuietComfort 45",
    "JBL Flip 6 Bluetooth speaker",
    "Canon EOS R5 camera",
    "GoPro Hero 12 action camera",
    "Apple Watch Series 9",
    "Fitbit Charge 6 fitness tracker",
    "Kindle Paperwhite e-reader",
    "iPad Air 5th generation",
    "Nintendo Switch OLED",
    "PlayStation 5 console",
    "Xbox Series X",
    "Dyson V15 vacuum cleaner",
  ];

  const descriptions = [
    "Premium quality product with excellent durability and modern design",
    "High-performance item perfect for daily use with outstanding features",
    "Top-rated product loved by customers worldwide for its reliability",
    "Latest model with cutting-edge technology and sleek appearance",
    "Professional grade quality built to last with superior materials",
    "Bestselling item featuring innovative design and functionality",
    "Award-winning product known for exceptional performance",
    "Highly recommended by experts with proven track record",
    "Revolutionary design combining style and practicality",
    "Industry-leading product with advanced features",
    "Customer favorite offering great value for money",
    "Premium craftsmanship with attention to detail",
    "State-of-the-art technology in a compact form",
    "Ergonomic design for maximum comfort and efficiency",
    "Versatile product suitable for various applications",
    "Eco-friendly option with sustainable materials",
    "Limited edition model with exclusive features",
    "Professional choice trusted by industry experts",
    "Innovative solution to everyday needs",
    "High-end quality at competitive pricing",
    "Durable construction for long-lasting performance",
    "User-friendly design with intuitive controls",
    "Compact yet powerful with impressive capabilities",
    "Stylish appearance meeting modern standards",
    "Reliable performance backed by warranty",
    "Advanced features for enhanced productivity",
    "Sleek design perfect for any environment",
    "Superior quality exceeding expectations",
    "Multi-functional product with versatile uses",
    "Energy-efficient option saving costs",
  ];

  const colors = [
    "black",
    "white",
    "blue",
    "red",
    "green",
    "gray",
    "silver",
    "gold",
    "rose gold",
    "navy",
    "burgundy",
    "olive",
    "beige",
    "charcoal",
  ];
  const conditions = [
    "brand new",
    "excellent",
    "like new",
    "refurbished",
    "mint condition",
  ];
  const features = [
    "with warranty",
    "fast shipping included",
    "original packaging",
    "certified authentic",
    "limited stock",
    "bestseller",
    "trending now",
    "top rated",
  ];

  for (let i = 1; i <= fileCount; i++) {
    const filePath = path.join(
      HOTOFOLDER_PATH,
      `testfile${i}-${randomUUID()}.csv`
    );
    let csvContent = "productId,productName,description\n";

    for (let row = 1; row <= 1; row++) {
      const productId = randomUUID();
      const product = products[Math.floor(Math.random() * products.length)];
      const desc =
        descriptions[Math.floor(Math.random() * descriptions.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const condition =
        conditions[Math.floor(Math.random() * conditions.length)];
      const feature = features[Math.floor(Math.random() * features.length)];
      const price = (Math.random() * 500 + 50).toFixed(2);
      const year = 2023 + Math.floor(Math.random() * 3);

      const description = `${desc}. ${product} in ${color}, ${condition}, ${year} model. Price: €${price}, ${feature}. Excellent choice for anyone looking for quality and reliability.`;

      csvContent += `${productId},"${product}","${description}"\n`;
    }

    fs.writeFileSync(filePath, csvContent);
    console.log(`Created ${filePath} with 100 unique products`);
  }
}

// createTestFiles(1);

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
  ignoreInitial: false,
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
    return;
  }

  try {
    const fileName = path.basename(filePath);
    const jobs = await fileProcessingQueue.getJobs([
      "active",
      "waiting",
      "delayed",
    ]);
    const duplicateJob = jobs.find((job) => job.data.filePath === filePath);
    if (duplicateJob) {
      logger.warn(
        `Job for file ${fileName} is already in the queue. Skipping duplicate.`
      );
      return;
    }
    await fileProcessingQueue.add(
      `${config.queue.localQueue}`,
      { filePath },
      {
        removeOnComplete: true,
      }
    );
    logger.info(`Queued: ${fileName}`);
  } catch (error) {
    logger.error(`Failed to queue ${filePath}:`, error);
  }
});
