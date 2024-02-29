import express, { NextFunction, Request, Response } from 'express'
var router = express.Router();

/* GET users listing. */
router.get('/', function (_req: Request, res: Response, next: NextFunction) {
  res.send('respond with a resource');
});

export default router;
