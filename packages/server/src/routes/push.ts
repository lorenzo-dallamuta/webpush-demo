import express, { Request, Response } from 'express'
import webpush, { PushSubscription, SendResult, WebPushError } from "web-push"
import Database from 'better-sqlite3';

var router = express.Router();

type SubscriptionEntry = { id: number, subscription: string }

function deleteSubscriptionFromDatabase(id: number) {
  return new Promise<void>(function (resolve, reject) {
    try {
      const db = new Database("push.sqlite");
      db.pragma('journal_mode = WAL');
      db.prepare(/* sql */`DELETE FROM subscriptions WHERE rowId = (?)`).run(id)
      db.close()
      resolve();
    } catch (err) {
      reject(err);
    }
  })
}

function getAllSubscriptionsFromDatabase() {
  return new Promise<SubscriptionEntry[]>(function (resolve, reject) {
    try {
      const db = new Database("push.sqlite");
      db.pragma('journal_mode = WAL');
      const entries = db
        .prepare(/* sql */`SELECT rowId as id, subscription FROM subscriptions`)
        .all()
      db.close()
      resolve(entries as SubscriptionEntry[]);
    } catch (err) {
      reject(err);
    }
  })
}

function saveSubscriptionToDatabase(subscription: PushSubscription) {
  return new Promise<PushSubscription>(function (resolve, reject) {
    try {
      const db = new Database("push.sqlite");
      db.pragma('journal_mode = WAL');
      const { lastInsertRowid } = db
        .prepare(/* sql */`INSERT INTO subscriptions(subscription) VALUES(?)`)
        .run(JSON.stringify(subscription));
      const inserted = db
        .prepare(/* sql */`SELECT rowId as id, * FROM subscriptions WHERE rowid = (?)`)
        .get(lastInsertRowid) as { id: number, subscription: string };
      db.close()
      resolve(JSON.parse(inserted.subscription))
    } catch (err) {
      reject(err);
    }
  });
}

/* GET subscription objects. */
router.get('/', function (_req: Request, res: Response) {
  getAllSubscriptionsFromDatabase()
    .then(function (entries) {
      res.status(201);
      res.setHeader('Content-Type', 'application/json');
      res.json(entries.map((e) => (JSON.parse(e.subscription))));
    })
    .catch(function (err) {
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: {
          id: 'unable-to-get-subscriptions',
          message: 'We were unable to recover the subscriptions from our database.',
        },
      });
    });
});

/* POST subscription object. */
router.post('/', function (req: Request, res: Response) {
  saveSubscriptionToDatabase(req.body)
    .then(function (subscription) {
      res.setHeader('Content-Type', 'application/json');
      res.json(subscription)
    })
    .catch(function (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        res.setHeader('Content-Type', 'application/json');
        res.json({
          info: {
            id: 'subscriptions-already-exists',
            message: 'The provided subscription was already stored.',
          },
        });
      } else {
        res.status(500);
        res.setHeader('Content-Type', 'application/json');
        res.json({
          error: {
            id: 'unable-to-save-subscription',
            message: 'The subscription was received but we were unable to save it to our database.',
          },
        });
      }
    });
});

router.post("/notifications", function (req: Request, res: Response) {
  getAllSubscriptionsFromDatabase()
    .then(function (entries) {
      let promiseChain: Promise<void | SendResult> = Promise.resolve();
      entries.forEach((entry) => {
        promiseChain = promiseChain.then(() => {
          return webpush
            .sendNotification(
              JSON.parse(entry.subscription),
              req.body["message"]?.toString() ?? "no message"
            )
            .catch((err: WebPushError) => {
              if (err.statusCode === 404 || err.statusCode === 410) {
                console.error('Subscription has expired or is no longer valid: ', err);
                return deleteSubscriptionFromDatabase(entry.id);
              } else {
                throw err;
              }
            });
        });
      })
      return promiseChain;
    })
    .then(() => {
      res.status(200).end();
    })
    .catch(function (err) {
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: err.message ?? err,
      });
    });
});

// const isValidSaveRequest = (req: Request, res: Response) => {
//   if (!req.body || !req.body.endpoint) {
//     res.status(400);
//     res.setHeader('Content-Type', 'application/json');
//     res.send(
//       JSON.stringify({
//         error: {
//           id: 'no-endpoint',
//           message: 'Subscription must have an endpoint.',
//         },
//       }),
//     );
//     return false;
//   }
//   return true;
// };

export default router;
