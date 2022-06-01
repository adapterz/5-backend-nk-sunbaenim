/* eslint-disable no-undef */
const { createLogger, format, transports, addColors } = require("winston");
require("dotenv").config();
const winstonDaily = require("winston-daily-rotate-file");
const moment = require("moment-timezone");
const logDir = "logs";
const { combine, printf, colorize, json, prettyPrint } = format;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  // eslint-disable-next-line no-undef
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

addColors(colors);

const myFormat = printf((info) => {
  return `${info.timestamp} ${info.level} : ${info.message}`;
});

const koreaTime = format((info) => {
  info.timestamp = moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
  return info;
});


const logger = createLogger({
  level: level(),
  levels,
  format: combine(koreaTime(), json(), prettyPrint()),
  transports: [
    //error 레벨 로그만 따로 관리하는 파일 생성
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      filename: `%DATE%.error.log`,
      dirname: logDir + "/error.log",
    }),
    //info 레벨 로그 관리 파일 생성
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      filename: `%DATE%.info.log`,
      dirname: logDir + "/info.log",
    }),
    //모든 레벨 로그 관리 파일 생성
    new winstonDaily({
      datePattern: "YYYY-MM-DD",
      filename: `%DATE%.all.log`,
      dirname: logDir + "/all.log",
    }),
  ],
  exceptionHandlers: [
    //uncaughtException 발생시
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      filename: `%DATE%.exception.log`,
      dirname: logDir + "/exception.log",
    }),
  ],
});

logger.stream = {
  write: (message) => {
    // logger.info(message.substring(0, ));
    const{
      method,
      url,
      status,
      contentLength,
      responseTime
    } = JSON.parse(message)

    logger.info('HTTP Access Log', {
      timestamp: new Date().toString(),
      method,
      url,
      status: Number(status),
      contentLength,
      responseTime: Number(responseTime)
    });
  }
}

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize({ all: true }), koreaTime(), myFormat),
      handleExceptions: true
    })
  );
}

module.exports = logger;
