import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tokeniseRouter from "./tokenise";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tokeniseRouter);

export default router;
