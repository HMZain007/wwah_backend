const languageProficiencyDb = require("../database/models/languageProficiency");
const academicInfoDb = require("../database/models/userAcademicInfoDb");
const userPeferenceDb = require("../database/models/userPreference");
const bcrypt = require("bcryptjs");
const UserRefDb = require("../database/models/refPortal/refuser");
const refAcademicInfo = require("../database/models/refPortal/refAcademicInfo");
const refWorkExperience = require("../database/models/refPortal/refWorkExperience");
const refPaymentInformation = require("../database/models/refPortal/refPaymentInformation");

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
      const user = await UserRefDb.findById(userId);
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
    const {
      contactNo,
      dob,
      countryCode,
      country,
      city,
      facebook,
      instagram,
      linkedin,
    } = req.body;
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
      const user = await UserRefDb.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            contactNo,
            dob,
            countryCode,
            country,
            city,
            facebook,
            instagram,
            linkedin,
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
    const { firstName, lastName, phone } = req.body;
    console.log(
      req.body,
      "update personal information from req.body of updatePersonalInfomation controller"
    );
    try {
      const userId = req.user?.id || req.user?._id;
      console.log(userId);
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const updatePersonalInformation = await UserRefDb.findOneAndUpdate(
        { _id: userId }, // Find by user ID
        {
          $set: {
            firstName,
            lastName,
            phone,
          },
        },
        { new: true, upsert: true } // Return the updated document or insert if not found
      );

      return res.status(200).json({
        message: "Presonal information updated successfully.",
        success: true,
        data: updatePersonalInformation,
      });
    } catch (error) {
      console.error(`Error updating Presonal information: ${error}`);
      return res.status(500).json({
        message: "Internal server error while updating Presonal information.",
        success: false,
      });
    }
  },

  // Academic Information Controller
  academicInformation: async (req, res) => {
    // Destructure request body
    const { currentDegree, program, uniName, currentSemester } = req.body;
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
      const refAcademicInformation = await refAcademicInfo.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            currentDegree,
            program,
            uniName,
            currentSemester,
          },
        },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      // Return success response
      return res.status(200).json({
        message: "Updated academic information successfully.",
        success: true,
        refAcademicInformation, // Optionally return updated data
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
      const refAcademicInformation = await academicInfoDb.findOne({
        user: userId,
      });
      if (!refAcademicInformation) {
        return res.status(404).json({
          message: "No academic information found for this user.",
          success: false,
        });
      }

      // Return success response
      return res.status(200).json({
        message: "Academic information retrieved successfully.",
        success: true,
        refAcademicInformation,
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
    const { hasWorkExperience, hasBrandAmbassador, jobDescription } = req.body;

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login required to update Work experience.",
          success: false,
        });
      }

      // Log incoming data for debugging
      console.log("Received data:", {
        hasWorkExperience,
        hasBrandAmbassador,
        jobDescription,
      });

      // Prepare update fields based on logic
      const updateFields = {
        hasWorkExperience,
        hasBrandAmbassador,
      };

      // Only set jobDescription if hasWorkExperience is true
      if (hasWorkExperience && jobDescription) {
        updateFields.jobDescription = jobDescription;
      } else {
        // Clear jobDescription if hasWorkExperience is false or jobDescription is empty
        updateFields.jobDescription = null;
      }

      console.log("Update fields:", updateFields);

      // Update or insert work experience
      const work_Experience = await refWorkExperience.findOneAndUpdate(
        { user: userId }, // Match user by ID
        { $set: updateFields },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      console.log("Saved document:", work_Experience);

      // Success response
      return res.status(200).json({
        message: "Work experience updated successfully.",
        success: true,
        work_Experience,
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

      const { hasWorkExperience, hasBrandAmbassador, jobDescription } =
        req.body;

      // Log input data for debugging
      console.log("User ID:", userId);
      console.log("Request Body:", req.body);

      // Prepare the update object based on the specified logic
      const updateFields = {
        hasWorkExperience,
        hasBrandAmbassador, // Independent field - user selects yes/no
      };

      // Logic 1: jobDescription depends on hasWorkExperience
      if (hasWorkExperience) {
        updateFields.jobDescription = jobDescription;
      } else {
        // Clear jobDescription if hasWorkExperience is false
        updateFields.jobDescription = null;
      }

      // Log update fields for debugging
      console.log("Update Fields:", updateFields);

      // Find and update the work experience
      const updatedExperience = await refWorkExperience.findOneAndUpdate(
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

  paymentInformation: async (req, res) => {
    const {
      preferredPaymentMethod,
      bankAccountTitle,
      bankName,
      accountNumberIban,
      mobileWalletNumber,
      accountHolderName,
      termsAndAgreement,
    } = req.body;

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login required to update payment information.",
          success: false,
        });
      }

      // Log incoming data for debugging
      console.log("Received payment data:", {
        preferredPaymentMethod,
        bankAccountTitle,
        bankName,
        accountNumberIban,
        mobileWalletNumber,
        accountHolderName,
        termsAndAgreement,
      });

      // Prepare update fields based on logic
      const updateFields = {
        preferredPaymentMethod,
      };

      // Add termsAndAgreement to updateFields if it's provided
      if (termsAndAgreement !== undefined) {
        updateFields.termsAndAgreement = termsAndAgreement;
      }

      // Logic for bank transfer
      if (preferredPaymentMethod === "bank_transfer") {
        updateFields.bankAccountTitle = bankAccountTitle;
        updateFields.bankName = bankName;
        updateFields.accountNumberIban = accountNumberIban;

        // Clear mobile wallet fields
        updateFields.mobileWalletNumber = null;
        updateFields.accountHolderName = null;
      }
      // Logic for mobile wallet options (any option other than 'none' and 'bank_transfer')
      else if (preferredPaymentMethod && preferredPaymentMethod !== "none") {
        updateFields.mobileWalletNumber = mobileWalletNumber;
        updateFields.accountHolderName = accountHolderName;

        // Clear bank transfer fields
        updateFields.bankAccountTitle = null;
        updateFields.bankName = null;
        updateFields.accountNumberIban = null;
      }
      // Logic for 'none' option - clear all payment details
      else if (preferredPaymentMethod === "none") {
        updateFields.bankAccountTitle = null;
        updateFields.bankName = null;
        updateFields.accountNumberIban = null;
        updateFields.mobileWalletNumber = null;
        updateFields.accountHolderName = null;
      }

      console.log("Update fields:", updateFields);

      // Update or insert payment information
      const paymentInfo = await refPaymentInformation.findOneAndUpdate(
        { user: userId }, // Match user by ID
        { $set: updateFields },
        { new: true, upsert: true } // Return updated document or create if not exists
      );

      console.log("Saved document:", paymentInfo);

      // Success response
      return res.status(200).json({
        message: "Payment information updated successfully.",
        success: true,
        paymentInfo,
      });
    } catch (error) {
      // Log error for debugging
      console.error(`Error updating payment information: ${error}`);

      // Server error response
      return res.status(500).json({
        message: "Internal server error while updating payment information.",
        success: false,
      });
    }
  },

  updatePaymentInformation: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Login required.", success: false });
      }

      const {
        preferredPaymentMethod,
        bankAccountTitle,
        bankName,
        accountNumberIban,
        mobileWalletNumber,
        accountHolderName,
      } = req.body;

      // Log input data for debugging
      console.log("User ID:", userId);
      console.log("Request Body:", req.body);

      // Prepare the update object based on the specified logic
      const updateFields = {
        preferredPaymentMethod,
      };

      // Logic 1: Bank transfer fields depend on preferredPaymentMethod being 'bank_transfer'
      if (preferredPaymentMethod === "bank_transfer") {
        updateFields.bankAccountTitle = bankAccountTitle;
        updateFields.bankName = bankName;
        updateFields.accountNumberIban = accountNumberIban;

        // Clear mobile wallet fields when bank transfer is selected
        updateFields.mobileWalletNumber = null;
        updateFields.accountHolderName = null;
      }
      // Logic 2: Mobile wallet fields for any option other than 'none' and 'bank_transfer'
      else if (preferredPaymentMethod && preferredPaymentMethod !== "none") {
        updateFields.mobileWalletNumber = mobileWalletNumber;
        updateFields.accountHolderName = accountHolderName;

        // Clear bank transfer fields when mobile wallet is selected
        updateFields.bankAccountTitle = null;
        updateFields.bankName = null;
        updateFields.accountNumberIban = null;
      }
      // Logic 3: Clear all payment details when 'none' is selected
      else {
        updateFields.bankAccountTitle = null;
        updateFields.bankName = null;
        updateFields.accountNumberIban = null;
        updateFields.mobileWalletNumber = null;
        updateFields.accountHolderName = null;
      }

      // Log update fields for debugging
      console.log("Update Fields:", updateFields);

      // Find and update the payment information
      const updatedPaymentInfo = await refPaymentInformation.findOneAndUpdate(
        { user: userId }, // Find the user's payment info
        { $set: updateFields },
        { new: true, upsert: true } // Return updated doc & create if not found
      );

      return res.status(200).json({
        message: "Payment information updated successfully.",
        success: true,
        data: updatedPaymentInfo,
      });
    } catch (error) {
      console.error(`Error updating Payment Information: ${error.message}`);
      return res.status(500).json({
        message: "Internal server error while updating payment information.",
        success: false,
      });
    }
  },
};
module.exports = profileController;
