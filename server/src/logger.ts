import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf, simple, prettyPrint, colorize } = format;

const level = process.env.LOG_LEVEL || 'debug';

interface Info {
  level: string;
  label: string;
  message: string;
  user: string;
  timestamp: string;
  [key: string]: string;
}

const myFormat = printf((info: Info) => {
  let str = `${info.level} [${info.label}] ${info.message}`;
  if (info.user) {
    str += ` | user: ${info.user}`;
  }
  if (info.args) {
    // @ts-ignore
    for (const key in info.args) {
      str += ` | ${key}: ${info.args[key]}`;
    }
  }
  return `${str} | ${info.timestamp}`;
});

const logger = createLogger({
  level,
  format: combine(colorize(), timestamp(), myFormat),
  transports: [new transports.Console({ level })]
});

export default logger;
