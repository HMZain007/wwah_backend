const express = require('express')
const router = express.Router()

router.get('/' , (req,res) =>{
    res.clearCookie("authToken", {
        // httpOnly: true,
        // secure: true,
        sameSite: "strict",
      });
      res.status(200).json({ message: "Logged out" });
})
module.exports = router;