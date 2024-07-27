import {Router} from "express"
import { publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus} from "../controllers/video.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()
router.route("/publish-video").post(verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ])
    ,
    publishAVideo
)


router.route("/:videoId").get(getVideoById)

router.route("/updateVideoDetails/:videoId").patch(upload.single("thumbnail"),updateVideo)
router.route("/delete/:videoId").delete(deleteVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router