import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadVideo } from "../controllers/video.controller.js";

const videoRouter = Router();


videoRouter.route("/video-upload").post(upload.single("videoFile"),uploadVideo);

export default videoRouter;