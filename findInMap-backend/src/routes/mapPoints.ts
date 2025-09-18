import { Router } from "express";
import {
    getAllMapPoints,
    createMapPoint,
} from "../controllers/mapPointsController";

const router: Router = Router();

router.get("/", getAllMapPoints);
router.post("/", createMapPoint);

export { router as mapPointsRouter };
