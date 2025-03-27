const { chatZEUS } = require("./aiController");
const chatController = (userPrompt, userData, universities) => {
  let messages = [];
  if (/country for |abroad|university abroad|abroad /i.test(userPrompt)) {
    // Fetch user preferences
    if (userData.perferredCountry) {
      // Fetch universities based on preferred country
      if (universities.length) {
        // Format university details
        const universityDetails = universities
          .map((uni) => `- ${uni.name}, Website: ${uni.websiteLink}`)
          .join("\n");
        messages.push(
          { role: "user", content: userPrompt },
          {
            role: "assistant",
            content: `I found some universities in ${user.preferdCountry}:\n${universityDetails} tell user about this University and its website link .Your Answer should be simple and short `,
          }
        );
        console.log(JSON.stringify(messages) + "message to ai");
      } else {
        // No universities found in preferred country
        messages.push(
          { role: "user", content: userPrompt },
          {
            role: "assistant",
            content: `Just ask from user Would you like to explore another country?.Answer should be short and simple`,
          }
        );
        console.log(messages + "message to ai login user with no country");
      }
    } else {
      // No preferred country found
      messages.push(
        { role: "user", content: userPrompt },
        {
          role: "assistant",
          content:
            "Ask User Which country are you interested in for study?.Answer should be short and simple",
        }
      );
      console.log(messages + "message to ai  by non login user");
    }
  }
  // else if (/in uk|uk|canada|usa/i.test(userPrompt)) {
  //     if (userData.perferredCountry) {
  //       if (universities.length) {
  //         const universityDetails = universities
  //           .map((uni) => `- ${uni.name}, Website: ${uni.websiteLink}`)
  //           .join("\n");
  //         messages.push(
  //           { role: "user", content: userPrompt },
  //           {
  //             role: "assistant",
  //             content: `I found some universities in ${studentPreferred.perferredCountry}:\n${universityDetails} tell user about this University and its website link .Your Answer should be simple and short `,
  //           }
  //         );
  //         console.log(JSON.stringify(messages) + "message to ai ");
  //       } else {
  //         // No universities found in preferred country
  //         messages.push(
  //           { role: "user", content: userPrompt },
  //           {
  //             role: "assistant",
  //             content: `Just ask from user Would you like to explore another country?.Answer should be short and simple`,
  //           }
  //         );
  //         console.log(messages + "message to ai login user with no country");
  //       }
  //     } else {
  //       // No preferred country found
  //       messages.push(
  //         { role: "user", content: userPrompt },
  //         {
  //           role: "assistant",
  //           content:
  //             "Which country are you interested in for study?.Answer should be short and simple",
  //         }
  //       );
  //       console.log(messages + "message to ai  by non login user");
  //     }
    
  // } 
  // else if (/ai|ai program/i.test(userPrompt)) {
  //   const universities = University.find({ "programs.name": "AI" });
  //   if (universities.length) {
  //     messages.push(
  //       { role: "user", content: userPrompt },
  //       {
  //         role: "assistant",
  //         content: `Here are universities offering AI programs:\n${universities
  //           .map((u) => `- ${u.name}, Link: ${u.websiteLink}`)
  //           .join(
  //             "\n"
  //           )}.Tell the names and webite links of these universities.The answer should be short and simple`,
  //       }
  //     );
  //   } else {
  //     messages.push({
  //       role: "assistant",
  //       content: "Sorry, no universities found offering AI programs.",
  //     });
  //   }
  // } 
  else {
    messages.push({ role: "user", content: userPrompt });
  }
  const answer = chatZEUS(messages , userData , universities);
  return answer;
};
module.exports = { chatController };