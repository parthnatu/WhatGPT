import pino from 'pino';
const logger = pino({ level: 'trace',timestamp: pino.stdTimeFunctions.isoTime })
export default logger;