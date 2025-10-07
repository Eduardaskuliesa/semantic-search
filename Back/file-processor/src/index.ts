import "./workers/localProccesingWorker";
import "./workers/cloudProccesingWorker";
import "./workers/s3ProccesingWorker";
import "./hotfolder";
import logger from "./utils/logger";

logger.info("File processor service started");
