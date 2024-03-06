import express, { NextFunction, Request, Response } from 'express'
var router = express.Router();

/* GET home page. */
router.get('/', function (_req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.json({ data: 'express is running' });
});

export default router;
