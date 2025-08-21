const languageProficiencyDb = require("../database/models/languageProficiency");
const academicInfoDb = require("../database/models/userAcademicInfoDb");
const userPeferenceDb = require("../database/models/userPreference");
const UserDb = require("../database/models/UserDb");
const workExperience = require("../database/models/workExperience");
const bcrypt = require("bcryptjs");

const profileController = {
  // Update password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      console.log("User from request:", req.user);
      console.log(userId, "userId");
      // Check if all fields are provided
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required." });
      }
      console.log("Request body:", req.body);

      // Find user in database
      const user = await UserDb.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Compare current password with hashed password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect." });
      }
      console.log("Stored hashed password:", user.password);

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in database
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  // Personal Information Controller
  personalInfomation: async (req, res) => {
    const { countryCode, contactNo, dob, nationality, country, city } =
      req.body;
    console.log(
      req.body,
      "update personal information from req.body of personalInfomation controller"
    );

    try {
      const userId = req.user?.id; // Safely access req.user and get userId
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update Personal Information",
          success: false,
        });
      }
      // Update user information
      const user = await UserDb.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            contactNo,
            dob,
            countryCode,
            nationality,
            country,
            city,
          },
        },
        { new: true, upsert: true } // Return the updated document or create a new one
      );
      // Return the updated user data
      return res
        .status(200)
        .json({ message: "Updated Personal Information", success: true, user });
    } catch (error) {
      // Log the error for debugging (optional)
      console.error("Error updating personal information:", error);

      // Return a server error response
      res.status(500).json({ error: "Internal Server Error", success: false });
    }
  },
  // Update Personal Information Controller

  updatePersonalInfomation: async (req, res) => {
    try {
      const userId = req.user?.id || req.user?._id; // get from auth middleware

      if (!userId) {
        return res.status(401).json({
          message: "Login required.",
          success: false,
        });
      }

      const { firstName, lastName, phone, avatarUrl, coverUrl } = req.body;

      const updatedUser = await UserDb.findByIdAndUpdate(
        userId,
        {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
          // ONLY ADDITION: Map frontend field names to database schema
          ...(avatarUrl && { profilePicture: avatarUrl }),
          ...(coverUrl && { coverPhoto: coverUrl }),
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Personal information updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      console.error(`Error updating personal information: ${error}`);
      res.status(500).json({
        success: false,
        message: "Internal server error while updating personal information.",
      });
    }
  },
  // Academic Information Controller
  academicInformation: async (req, res) => {
    // Destructure request body
    const {
      highestQualification,
      majorSubject,
      previousGradingScale,
      previousGradingScore,
      standardizedTest,
      standardizedTestScore,
      institutionName,
      startDate,
      endDate,
    } = req.body;
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message:
            "Unauthorized: Please log in to update academic information.",
          success: false,
        });
      }
      // Update or insert academic information
      const academicInformation = await academicInfoDb.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            highestQualification,
            majorSubject,
            previousGradingScale,
            previousGradingScore,
            standardizedTest,
            standardizedTestScore,
            institutionName,
            startDate,
            endDate,
          },
        },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      // Return success response
      return res.status(200).json({
        message: "Updated academic information successfully.",
        success: true,
        academicInformation, // Optionally return updated data
      });
    } catch (error) {
      // Log error for debugging
      console.error("Error handling academic information route:", error);

      // Return generic server error response
      return res.status(500).json({
        message: "Internal server error while updating academic information.",
        success: false,
      });
    }
  },

  getAcademicInformation: async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.user?.id) {
        return res.status(403).json({
          message: "Forbidden: Please log in first.",
          success: false,
        });
      }

      const userId = req.user.id;

      // Fetch academic information
      const academicInformation = await academicInfoDb.findOne({
        user: userId,
      });
      if (!academicInformation) {
        return res.status(404).json({
          message: "No academic information found for this user.",
          success: false,
        });
      }

      // Return success response
      return res.status(200).json({
        message: "Academic information retrieved successfully.",
        success: true,
        academicInformation,
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error retrieving academic information:", error);

      // Return server error response
      return res.status(500).json({
        message: "Internal server error while retrieving academic information.",
        success: false,
      });
    }
  },
  // update Academic Information

  updateAcademicInformation: async (req, res) => {
    const {
      qualification,
      subject,
      gradingScale,
      obtainedScore,
      test,
      testScore,
      institution,
      startDate,
      endDate,
    } = req.body;
    console.log(req.body);
    try {
      const userId = req.user?.id;
      console.log(userId);
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const updateAcademicInformation = await academicInfoDb.findOneAndUpdate(
        { user: userId }, // Find by user ID
        {
          $set: {
            highestQualification: qualification,
            majorSubject: subject,
            previousGradingScale: gradingScale,
            previousGradingScore: obtainedScore,
            standardizedTest: test,
            standardizedTestScore: testScore,
            institutionName: institution,
            startDate,
            endDate,
          },
        },
        { new: true, upsert: true } // Return the updated document or insert if not found
      );

      return res.status(200).json({
        message: "Academic information updated successfully.",
        success: true,
        data: updateAcademicInformation,
      });
    } catch (error) {
      console.error(`Error updating Academic information: ${error}`);
      return res.status(500).json({
        message: "Internal server error while updating Academic information.",
        success: false,
      });
    }
  },
  // English Proficiency controller
  languageProficiency: async (req, res) => {
    const { proficiencyLevel, proficiencyTest, proficiencyTestScore } =
      req.body;
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login required to update user preferences.",
          success: false,
        });
      }
      const languageProficiency = await languageProficiencyDb.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            proficiencyLevel,
            proficiencyTest,
            proficiencyTestScore,
          },
        },
        { new: true, upsert: true } // Creates a new document if none exists
      );
      return res.status(200).json({
        message: "Updated  English Proficiency information",
        success: true,
        languageProficiency,
      });
    } catch (error) {
      console.error(
        `Error handling  English Proficiency controller : ${error}`
      );
      return res.status(500).json({
        message: "Internal server error in English proficiency controller",
        success: false,
      });
    }
  },

  // update english language proficiency

  updateEnglishProficiency: async (req, res) => {
    const { proficiencyLevel, testType, score } = req.body;
    console.log(req.body);
    try {
      const userId = req.user?.id;
      console.log(userId);
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const updatedEnglishProficiency =
        await languageProficiencyDb.findOneAndUpdate(
          { user: userId }, // Find by user ID
          {
            $set: {
              proficiencyLevel,
              proficiencyTest: testType,
              proficiencyTestScore: score,
            },
          },
          { new: true, upsert: true } // Return the updated document or insert if not found
        );

      return res.status(200).json({
        message: "English proficiency updated successfully.",
        success: true,
        data: updatedEnglishProficiency,
      });
    } catch (error) {
      console.error(`Error updating English proficiency: ${error}`);
      return res.status(500).json({
        message: "Internal server error while updating English proficiency.",
        success: false,
      });
    }
  },

  //user preferences
  userPreference: async (req, res) => {
    const {
      degreeLevel,
      fieldOfStudy,
      perferredCountry,
      perferredCity,
      livingcost,
      tutionfees,
      studyMode,
      currency,
    } = req.body;
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login required to update user preferences.",
          success: false,
        });
      }
      // Update or insert user preferences
      const userPreference = await userPeferenceDb.findOneAndUpdate(
        { user: userId }, // Match user by ID
        {
          $set: {
            degreeLevel,
            fieldOfStudy,
            perferredCountry,
            perferredCity,
            livingcost,
            tutionfees,
            studyMode,
            currency,
          },
        },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      // Success response
      return res.status(200).json({
        message: "User preferences updated successfully.",
        success: true,
        userPreference, // Optionally return updated data
      });
    } catch (error) {
      // Log error for debugging
      console.error(`Error updating user preferences: ${error}`);

      // Server error response
      return res.status(500).json({
        message: "Internal server error while updating user preferences.",
        success: false,
      });
    }
  },

  // update user preferences
  updateUserPreferences: async (req, res) => {
    const {
      degreeLevel,
      fieldOfStudy,
      country,
      city,
      livingBudget,
      tuitionBudget,
      studyMode,
      currency,
    } = req.body;
    console.log(req.body);
    try {
      const userId = req.user?.id;
      console.log(userId);
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const updatePreference = await userPeferenceDb.findOneAndUpdate(
        { user: userId }, // Find by user ID
        {
          $set: {
            degreeLevel,
            fieldOfStudy,
            perferredCountry: country,
            perferredCity: city,
            livingcost: livingBudget,
            tutionfees: tuitionBudget,
            studyMode,
            currency,
          },
        },
        { new: true, upsert: true } // Return the updated document or insert if not found
      );

      return res.status(200).json({
        message: "User Preference updated successfully.",
        success: true,
        data: updatePreference,
      });
    } catch (error) {
      console.error(`Error updating User Preference: ${error}`);
      return res.status(500).json({
        message: "Internal server error while updating User Preference.",
        success: false,
      });
    }
  },
  //Work experience
  workExperience: async (req, res) => {
    const {
      hasWorkExperience,
      fullTime,
      partTime,
      jobTitle,
      organizationName,
      startDate,
      endDate,
      employmentType,
    } = req.body;
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login required to update Work experience.",
          success: false,
        });
      }
      // Update or insert work experience
      const work_Experience = await workExperience.findOneAndUpdate(
        { user: userId }, // Match user by ID
        {
          $set: {
            hasWorkExperience,
            fullTime,
            partTime,
            jobTitle,
            organizationName,
            startDate,
            endDate,
            employmentType,
          },
        },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      // Success response
      return res.status(200).json({
        message: "Work experience updated successfully.",
        success: true,
        work_Experience, // Optionally return updated data
      });
    } catch (error) {
      // Log error for debugging
      console.error(`Error updating Work experience: ${error}`);

      // Server error response
      return res.status(500).json({
        message: "Internal server error while updating Work experience.",
        success: false,
      });
    }
  },

  updateWorkExperience: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const {
        hasWorkExperience,
        experiences, // Should be "fullTime" or "partTime"
      } = req.body;

      // Log input data for debugging
      console.log("User ID:", userId);
      console.log("Request Body:", req.body);

      // Prepare the update object
      const updateFields = {
        hasWorkExperience,
        fullTime: hasWorkExperience ? experiences[0].isFullTime : false,
        partTime: hasWorkExperience ? experiences[0].isPartTime : false,
        employmentType: hasWorkExperience
          ? experiences[0].isFullTime
            ? "fullTime"
            : experiences[0].isPartTime
            ? "partTime"
            : null
          : null,

        jobTitle: hasWorkExperience ? experiences[0].jobTitle : null,
        organizationName: hasWorkExperience
          ? experiences[0].organizationName
          : null,
        startDate: hasWorkExperience ? experiences[0].dateFrom : new Date(),
        endDate: hasWorkExperience ? experiences[0].dateTo : new Date(),
      };

      // Remove `undefined` values to prevent MongoDB errors

      // Log update fields for debugging
      console.log("Update Fields:", updateFields);

      // Find and update the work experience
      const updatedExperience = await workExperience.findOneAndUpdate(
        { user: userId }, // Find the user's experience
        { $set: updateFields },
        { new: true, upsert: true } // Return updated doc & create if not found
      );

      return res.status(200).json({
        message: "User experience updated successfully.",
        success: true,
        data: updatedExperience,
      });
    } catch (error) {
      console.error(`Error updating User Experience: ${error.message}`);
      return res.status(500).json({
        message: "Internal server error while updating User Experience.",
        success: false,
      });
    }
  },
};
module.exports = profileController;
