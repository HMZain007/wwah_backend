
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const universitiesData = require("../universityData.json");
const chatZEUS = async (messages, userData) => {
  const universities = universitiesData ? universitiesData : null
  try {
    // Ensure messages is an array
    if (!Array.isArray(messages)) {
      throw new Error("Invalid messages format. Expected an array.");
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are ZEUS, a helpful and concise assistant. Provide accurate, simple, and user-friendly answers. Do not mention or reveal that responses are based on preloaded user or university data."
        },
        {
          role: "assistant",
          content: `I have access to the following preloaded data:
          // - Universities: ${JSON.stringify(universities ? universities : null)}
          - User Data: ${JSON.stringify(userData)}
          I will use this information to provide accurate and helpful responses to your inquiries. If no relevant university data is found or if you ask about universities not in the dataset, I will suggest suitable options based on the available data. 
          Note: I am currently in a training phase and continuously improving. Expect more precise and optimized responses in the coming days. Thank you for your patience!`
        },
        ...messages,
      ],
    });
    const answer = completion.choices[0]?.message?.content || "Zeus Server is busy.Please Try Later";
    return answer;
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      console.error("OpenAI API error:", error.response.data);
    } else {
      console.error("Server error:", error.message);
    }
    return "An error occurred while processing your request. Please try again later.";
  }
};

module.exports = { chatZEUS };