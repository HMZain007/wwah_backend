require("dotenv").config();
const applicationInfo = require("../database/models/stdDashboard/applicationInfoDb");
const BasicInfo = require("../database/models/stdDashboard/basicInfoDb");
const userFiles = require("../database/models/stdDashboard/uploadFilesDb");
const UserDb = require("../database/models/UserDb");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api.resources({ type: "upload" }, (error, result) => {});
const stdDashboardController = {
  // get basic info
  getBasicInformation: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      if (!userId) {
        return res.status(401).json({
          message: "Login First to access Personal Information",
          success: false,
        });
      }
      // Fetch the user's basic information
      const basicInfo = await BasicInfo.findOne({ user: userId });
      if (!basicInfo) {
        return res.status(404).json({
          message: "Basic Information not found",
          success: false,
        });
      }
      return res.status(200).json({
        message: "Basic Information retrieved successfully",
        success: true,
        data: basicInfo,
      });
    } catch (error) {
      console.error("Error retrieving Basic information:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },
  // Basic Information Controller
  basicInformation: async (req, res) => {
    try {
      const userId = req.user?.id; // Safely access req.user and get userId

      if (!userId) {
        return res.status(401).json({
          message: "Login First to update Personal Information",
          success: false,
        });
      }
      // Validate user exists
      const userExists = await UserDb.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }
      // Extract and validate body data
      const {
        familyName,
        givenName,
        gender,
        DOB,
        nationality,
        countryOfResidence,
        maritalStatus,
        religion,
        // Address fields
        homeAddress,
        detailedAddress,
        country,
        city,
        zipCode,
        email,
        countryCode,
        phoneNo,
        // Current address fields
        currentHomeAddress,
        currentDetailedAddress,
        currentCountry,
        currentCity,
        currentZipCode,
        currentEmail,
        currentCountryCode,
        currentPhoneNo,
        // Passport info
        hasPassport,
        passportNumber,
        passportExpiryDate,
        oldPassportNumber,
        oldPassportExpiryDate,
        // Study abroad info
        hasStudiedAbroad,
        visitedCountry,
        studyDuration,
        institution,
        visaType,
        visaExpiryDate,
        durationOfStudyAbroad,
        // Sponsor info
        sponsorName,
        sponsorRelationship,
        sponsorsNationality,
        sponsorsOccupation,
        sponsorsEmail,
        sponsorsCountryCode,
        sponsorsPhoneNo,
        // Family members
        familyMembers = [],
      } = req.body;

      // Find and update or create basic info document
      const basicInformation = await BasicInfo.findOneAndUpdate(
        { user: userId }, // Correct query using the "user" field
        {
          $set: {
            familyName,
            givenName,
            gender,
            DOB,
            nationality,
            countryOfResidence,
            maritalStatus,
            religion,
            homeAddress,
            detailedAddress,
            country,
            city,
            zipCode,
            email,
            countryCode,
            phoneNo,
            currentHomeAddress,
            currentDetailedAddress,
            currentCountry,
            currentCity,
            currentZipCode,
            currentEmail,
            currentCountryCode,
            currentPhoneNo,
            hasPassport,
            passportNumber,
            passportExpiryDate,
            oldPassportNumber,
            oldPassportExpiryDate,
            hasStudiedAbroad,
            visitedCountry,
            studyDuration,
            institution,
            visaType,
            visaExpiryDate,
            durationOfStudyAbroad,
            sponsorName,
            sponsorRelationship,
            sponsorsNationality,
            sponsorsOccupation,
            sponsorsEmail,
            sponsorsCountryCode,
            sponsorsPhoneNo,
            familyMembers, // Pass the entire array
          },
        },
        { new: true, upsert: true } // Return updated doc or create new one
      );

      // Return the updated user data with success message
      return res.status(200).json({
        message: "Basic Information Updated Successfully",
        success: true,
        data: basicInformation,
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error updating Basic information:", error);
      // Return a more specific error message when possible
      const errorMessage = error.message || "Internal Server Error";

      // Return an error response
      res.status(500).json({
        message: errorMessage,
        success: false,
      });
    }
  },
  // update basic info
  updateBasicInformation: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure user is authenticated

      if (!userId) {
        return res.status(401).json({
          message: "Login First to update Personal Information",
          success: false,
        });
      }
      // Check if the user's basic information exists
      const existingBasicInfo = await BasicInfo.findOne({ user: userId });
      if (!existingBasicInfo) {
        return res.status(404).json({
          message: "Basic Information not found",
          success: false,
        });
      }
      // Extract only provided fields from the request body
      const updatedData = {};
      const allowedFields = [
        "familyName",
        "givenName",
        "gender",
        "DOB",
        "nationality",
        "countryOfResidence",
        "maritalStatus",
        "religion",
        "homeAddress",
        "detailedAddress",
        "country",
        "city",
        "zipCode",
        "email",
        "countryCode",
        "phoneNo",
        "currentHomeAddress",
        "currentDetailedAddress",
        "currentCountry",
        "currentCity",
        "currentZipCode",
        "currentEmail",
        "currentCountryCode",
        "currentPhoneNo",
        "hasPassport",
        "passportNumber",
        "passportExpiryDate",
        "oldPassportNumber",
        "oldPassportExpiryDate",
        "hasStudiedAbroad",
        "visitedCountry",
        "studyDuration",
        "institution",
        "visaType",
        "visaExpiryDate",
        "durationOfStudyAbroad",
        "sponsorName",
        "sponsorRelationship",
        "sponsorsNationality",
        "sponsorsOccupation",
        "sponsorsEmail",
        "sponsorsCountryCode",
        "sponsorsPhoneNo",
        "familyMembers",
      ];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updatedData[field] = req.body[field];
        }
      });
      // Update the existing basic information document
      const updatedBasicInfo = await BasicInfo.findOneAndUpdate(
        { user: userId },
        { $set: updatedData },
        { new: true }
      );
      return res.status(200).json({
        message: "Basic Information Updated Successfully",
        success: true,
        data: updatedBasicInfo,
      });
    } catch (error) {
      console.error("Error updating Basic information:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },
  // get application information
  getApplicationInformation: async (req, res) => {
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      if (!userId) {
        return res.status(401).json({
          message: "Login First to access Application Information",
          success: false,
        });
      }
      // Fetch the user's application information
      const applicationInformation = await applicationInfo.findOne({
        user: userId,
      });
      if (!applicationInformation) {
        return res.status(404).json({
          message: "Application Information not found",
          success: false,
        });
      }
      return res.status(200).json({
        message: "Application Information retrieved successfully",
        success: true,
        data: applicationInformation,
      });
    } catch (error) {
      console.error("Error retrieving Application Information:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },
  // Application Information Controller
  applicationInformation: async (req, res) => {
    console.log(req.body);
    try {
      const userId = req.user?.id; // Safely access req.user and get userId

      if (!userId) {
        return res.status(401).json({
          message: "Login First to update Personal Information",
          success: false,
        });
      }

      // Validate user exists
      const userExists = await UserDb.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      // Extract and validate body data
      const {
        countryOfStudy,
        proficiencyLevel,
        proficiencyTest,
        overAllScore,
        listeningScore,
        writingScore,
        readingScore,
        speakingScore,
        standardizedTest,
        standardizedOverallScore,
        standardizedSubScore,
        educationalBackground = [],
        workExperience = [],
      } = req.body;
      console.log(req.body, "Request");
      // Find and update or create basic info document
      const applicationInformation = await applicationInfo.findOneAndUpdate(
        { user: userId }, // Correct query using the "user" field
        {
          $set: {
            countryOfStudy,
            proficiencyLevel,
            proficiencyTest,
            overAllScore,
            listeningScore,
            writingScore,
            readingScore,
            speakingScore,
            standardizedTest,
            standardizedOverallScore,
            standardizedSubScore,
            educationalBackground,
            workExperience, // Pass the entire array
          },
        },
        { new: true, upsert: true } // Return updated doc or create new one
      );

      // Return the updated user data with success message
      return res.status(200).json({
        message: "Application Information Updated Successfully",
        success: true,
        data: applicationInformation,
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error updating Application Information:", error);

      // Return a more specific error message when possible
      const errorMessage = error.message || "Internal Server Error";

      // Return an error response
      res.status(500).json({
        message: errorMessage,
        success: false,
      });
    }
  },
  // get user documents
  getDocuments: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to view documents",
          success: false,
        });
      }

      // Find the user's documents
      const userDocument = await userFiles.findOne({ user: userId });
      if (!userDocument || userDocument.documents.length === 0) {
        return res.status(404).json({
          message: "No documents found",
          success: false,
        });
      }

      res.status(200).json({
        message: "Documents retrieved successfully!",
        success: true,
        documents: userDocument.documents,
      });
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // Upload Documents Controller
  uploadDocument: async (req, res) => {
    try {
      const { documents } = req.body;
      const userId = req.user?.id;
    console.log(req.body, "Request Body");
      if (!userId) {
        return res.status(401).json({
          message: "Login First to upload file",
          success: false,
        });
      }

      if (!Array.isArray(documents) || documents.length === 0) {
        return res.status(400).json({
          message: "No documents provided",
          success: false,
        });
      }

      // Find user's existing document entry
      let userDocument = await userFiles.findOne({ user: userId });

      if (!userDocument) {
        userDocument = new userFiles({ user: userId, documents: [] });
      }

      for (const doc of documents) {
        const { id, name, date, isChecked, files = [] } = doc;

        if (!id || !name || !Array.isArray(files) || files.length === 0) {
          continue; // Skip invalid documents
        }

        // 🔥 Map uploaded file metadata
        const uploadedFiles = files.map((file) => ({
          name: file.name,
          url: file.url,
          public_id: file.public_id,
        }));

        // ✅ Check if document already exists (by `id`)
        const existingDocumentIndex = userDocument.documents.findIndex(
          (d) => d.id === id
        );

        if (existingDocumentIndex !== -1) {
          // ✅ Update existing document (Avoid duplicates)
          const existingDocument =
            userDocument.documents[existingDocumentIndex];
          const existingFileNames = existingDocument.files.map(
            (file) => file.name
          );

          const newFiles = uploadedFiles.filter(
            (file) => !existingFileNames.includes(file.name)
          );

          existingDocument.files.push(...newFiles);
          existingDocument.date = date;
          existingDocument.isChecked = isChecked;
        } else {
          // ✅ Add a new document
          userDocument.documents.push({
            id, // Ensure `id` is stored
            name,
            files: uploadedFiles,
            date,
            isChecked,
          });
        }
      }

      console.log("Documents received:", documents);
      documents.forEach((doc) => {
        doc.files.forEach((file) => {
          console.log("File:", file);
          console.log("Public ID:", file.public_id);
        });
      });

      await userDocument.save();

      res.status(201).json({
        message: "Documents uploaded successfully!",
        success: true,
        documents: userDocument.documents,
      });
    } catch (error) {
      console.error("Error saving documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  // delete Documents Controller
  deleteDocument: async (req, res) => {
    try {
      const { files } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized! Please login first.",
          success: false,
        });
      }

      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({
          message: "Invalid request. Missing document ID or files.",
          success: false,
        });
      }

      // Find the user's document entry
      let userDocument = await userFiles.findOne({ user: userId });

      if (!userDocument) {
        return res.status(404).json({
          message: "User document entry not found.",
          success: false,
        });
      }

      // **Filter out documents that match the given file IDs**
      const fileIdsToDelete = files.map((file) => file._id);

      // Remove the documents from user's document list
      // userDocument.documents = userDocument.documents.filter(
      //   (doc) => !fileIdsToDelete.includes(doc._id.toString())
      // );
      // Remove the specific files from each document
      userDocument.documents.forEach((doc) => {
        doc.files = doc.files.filter(
          (file) => !fileIdsToDelete.includes(file._id.toString())
        );
      });

      // Delete documents that have no files left
      userDocument.documents = userDocument.documents.filter(
        (doc) => doc.files.length > 0
      );

      // Delete files from Cloudinary
      // for (const file of files) {
      //   try {
      //     const urlParts = file.url.split("/");
      //     const fileNameWithExtension = urlParts.pop(); // Last part of URL
      //     const publicId = fileNameWithExtension.split(".")[0]; // Extract public ID

      //     // Ensure publicId is valid
      //     if (!publicId) {
      //       console.error("Invalid Cloudinary Public ID:", file.url);
      //       continue; // Skip this file if extraction fails
      //     }

      //     const result = await cloudinary.uploader.destroy(publicId);
      //     console.log(`Deleted ${publicId}:`, result);
      //   } catch (err) {
      //     console.error("Error deleting file from Cloudinary:", err);
      //   }
      // }
      for (const file of files) {
        try {
          const publicId = file.public_id; // Ensure you store `public_id` in the database

          if (!publicId) {
            console.error("Missing Cloudinary Public ID for:", file.url);
            continue; // Skip if no public ID
          }

          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted ${publicId}:`, result);
        } catch (err) {
          console.error("Error deleting file from Cloudinary:", err);
        }
      }

      // Save the updated document list
      await userDocument.save();

      res.status(200).json({
        message: "Document deleted successfully!",
        success: true,
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = stdDashboardController;
