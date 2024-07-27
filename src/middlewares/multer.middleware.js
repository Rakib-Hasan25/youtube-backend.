import multer from "multer"


// file
const storage = multer.diskStorage({
    //to upload file on destionation
    destination:function(req,file,cb){
            cb(null,"./public/temp")
    },

    


//to configure file name 
    filename: function(req,file,cb){
        cb(null, file.originalname)
    }
})


export const upload = multer({storage:storage})