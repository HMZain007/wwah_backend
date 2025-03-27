const userDb = require("../database/models/UserDb");
const studentPreference = require("../database/models/userPreference");

const getUserDb = async (userId) => {
  if (!userId) {
    console.error("No user ID provided");
    return null;
  }

  try {
    // Fetch user data
    const user = await userDb.findOne({ _id: userId });
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return null;
    }

    // Fetch student preferences
    const studentPreferenceData = await studentPreference.findOne({ user: userId });
    
    // Construct user details object
    const userDetails = {
      name: `${user.firstName} ${user.lastName}`,
      country: user.country || "Not specified",
      city: user.city || "Not specified",
      preferdCountry: studentPreferenceData?.perferredCountry || "Not specified",
    };
     
    return userDetails;
  } catch (error) {
    console.error("Error fetching user or preferences from database:", error.message);
    throw error;
  }
};

module.exports = getUserDb;