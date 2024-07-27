import {Router} from "express"
import { registerUser,loginUser,logoutUser,refreshAccessToken,
    changeCurrentPassword,updateAccoutDetails,getCurrentUser,
    updateUserAvatar,updateUserCoverImage
} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
            
        }
    ])
    ,registerUser)

    router.route("/login").post(loginUser)
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refreshAccessToken").post(refreshAccessToken)
    router.route("/change-password").patch(verifyJWT,changeCurrentPassword)
    router.route("/change-account-details").patch(verifyJWT,updateAccoutDetails)
    router.route("/get-current-user"). get(verifyJWT,getCurrentUser)

    router.route("/update-avatar")
.patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
//we are just sending one single file for this we use upload.single("avatar")
router.route("/update-cover-image")
.patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

    export default router 