
const fs = require("fs");
const express = require("express");
const router = express.Router();
const authenticateAiToken = require("../middlewares/authAi");
const getUserData = require("../controller/getUserDb");
// const { chatController } = require("../controller/chatController");
const { chatZEUS } = require("../controller/aiController");

const sessionStore = {}; // Consider Redis for production
// const universitiesData = JSON.parse(fs.readFileSync("./universityData.json", "utf-8"));

router.post("/", authenticateAiToken, async (req, res) => {
  const userPrompt = req.body.userPrompt;
  const userId = req.user?.id;
  const user = await getUserData(userId);
  if (!userPrompt) {
    return res.status(200).json({ succes: false, answer: "Please enter a message" })
  }
  try {
    let messages = [];
    // const universities = universitiesData.countries.filter((country) => country.name === user?.preferdCountry)
    if (!sessionStore[userId]) {
      sessionStore[userId] = { hasInteracted: false, conversation: [] };
    }
    const userSession = sessionStore[userId];

    if (!req.user && userSession.conversation.length >= 5) {
      return res.status(200).json({
        success: true,
        answer:
          "Please log in for better results. Click here: https://worldwideadmissionhub.com/signin",
      });
    }
    else {
      messages.push(
        // {role:"assistant" , content: `${userSession.conversation} Response to user according to the old conversation`},
        { role: "user", content: userPrompt }
      );
      const answer = await chatZEUS(messages, user);
      // const answer = await chatController(userPrompt, user, universities
      res.status(200).json({ success: true, answer });
    }
    userSession.conversation.push({ role: "user", content: userPrompt });
  }
  catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
module.exports = router;
