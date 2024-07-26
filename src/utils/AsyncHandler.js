const asyncHandler  = (requestHandler) => 
    (req, res, next)=>{
       return Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err));
    }



//     const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         return await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message 
//         })
//     }
// }



    ()=>{()=>{}}
    export {asyncHandler}
