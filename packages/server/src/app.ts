import createError, { HttpError } from 'http-errors';
import express, { NextFunction, Request, Response } from 'express'
import betterSqlLite from 'better-sqlite3';
import cookieParser from 'cookie-parser'
import cors from 'cors';
import logger from 'morgan'
import webpush from "web-push"

import indexRouter from './routes/index'
import pushRouter from './routes/push'

import dotenv from 'dotenv'
dotenv.config()

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/push', pushRouter);

// catch 404 and forward to error handler
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response, _next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error response
  res.status(err.status || 500);
  res.setHeader('Content-Type', 'application/json');
  res.json({
    msg: err.message,
    status: err.status,
    stack: err.stack,
    name: err.name
  });
});

const db = new betterSqlLite("push.sqlite");
db.pragma('journal_mode = WAL');
db.exec(/* sql */`CREATE TABLE IF NOT EXISTS subscriptions (subscription TEXT UNIQUE)`);
db.exec(/* sql */`CREATE TABLE IF NOT EXISTS vapid (
  vapid_subject TEXT NOT NULL,
  vapid_public TEXT NOT NULL,
  vapid_private TEXT NOT NULL
)`);
const { "COUNT(rowId)": vapidCount } = db
  .prepare(/* sql */`SELECT COUNT(rowId) FROM vapid`)
  .get() as { "COUNT(rowId)": number };
if (vapidCount < 1) {
  const vapidKeys = webpush.generateVAPIDKeys();
  db
    .prepare(/* sql */`INSERT INTO vapid(vapid_subject, vapid_public, vapid_private) VALUES(?, ?, ?)`)
    .run(process.env.VAPID_SUBJECT!, vapidKeys.publicKey, vapidKeys.privateKey);
}
const vapid = db
  .prepare(/* sql */`SELECT vapid_subject, vapid_public, vapid_private FROM vapid`)
  .get() as {
    vapid_subject: string,
    vapid_public: string,
    vapid_private: string
  };
webpush.setVapidDetails(
  vapid.vapid_subject, // mail
  vapid.vapid_public,  // public
  vapid.vapid_private, // private
);
db.close();

export default app;
