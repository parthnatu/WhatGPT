import pino from 'pino';
const logger = pino({
    transport: {
        targets: [
            {
                level: 'info',
                target: 'pino-pretty',
                options: {}
            },
            {
                level: 'trace',
                target: 'pino/file',
                options: { destination: './pino-logger.log' }
            }
        ],
    },
    level: 'trace',
    timestamp: pino.stdTimeFunctions.isoTime
})
export default logger;