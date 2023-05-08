import logger from './util/log';
import config from './util/config';
import { WhatsAppClient } from './whatsapp-client/whatsapp-client'

logger.info(JSON.stringify(config));
const wClient = new WhatsAppClient();
