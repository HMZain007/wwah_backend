require("dotenv").config();
const applicationInfo = require("../database/models/stdDashboard/applicationInfoDb");
const BasicInfo = require("../database/models/stdDashboard/basicInfoDb");
const userFiles = require("../database/models/stdDashboard/uploadFilesDb");
const UserDb = require("../database/models/UserDb");

const {
  upload,
  generatePresignedUrl,
  deleteFromS3,
} = require("../config/s3Config"); // Import your fixed S3 config
const statusUpdate = require("../database/models/stdDashboard/statusUpdates");
const DOCUMENT_SIZE_LIMITS_MB = {
 "Valid Passport": 2,
  "National ID Card": 2,
  "Passport Size Photograph": 1,

  "Academic Marksheet of 10th Grade": 3,
  "Academic Marksheet of 12th Grade": 3,
  "Academic Marksheet of Bachelors": 3,
  "Academic Marksheet of Masters": 3,

  "Academic Degree/Certificates of 10th Grade": 2,
  "Academic Degree/Certificates of 12th Grade": 2,
  "Academic Degree/Certificates of Bachelors": 2,
  "Academic Degree/Certificates of Masters": 2,

  "English Language Proficiency Test Certificate": 2,
  "Letter of Recommendations": 2,
  "Statement of Purpose": 2,
  "Birth Certificate": 1,
  "Curriculum Vitae/Resume": 1,

  "Portfolio (For creative courses such as art, design and architecture)": 4,
  "Translation (if your documents are not in English)": 2,
  "Standardized Test Result (If any)": 2,
};

// Helper function to determine file type
const getFileType = (extension) => {
  const imageTypes = ["jpg", "jpeg", "png"];
  const documentTypes = ["pdf", "doc", "docx"];

  if (imageTypes.includes(extension)) return "image";
  if (documentTypes.includes(extension)) return "document";
  return "other";
};

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
    // console.log("DEBUG: Fetching basic for user");
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
        isGivenNameEmpty,
        isFamilyNameEmpty,
        givenName,
        gender,
        DOB,
        nationality,
        countryOfResidence,
        nativeLanguage,
        maritalStatus,
        religion,
        // Address fields
        homeAddress,
        detailedAddress,
        currentAddress,
        permanentAddress,
        sameAsCurrent,
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
        hasPassport,
        noPassport,
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
            isGivenNameEmpty,
            isFamilyNameEmpty,
            givenName,
            gender,
            DOB,
            nationality,
            nativeLanguage,
            countryOfResidence,
            maritalStatus,
            religion,
            homeAddress,
            detailedAddress,
            currentAddress,
            permanentAddress,
            sameAsCurrent,
            country,
            city,
            zipCode,
            email,
            countryCode,
            phoneNo,
            currentHomeAddress,
            currentDetailedAddress,
            homeAddress,
            detailedAddress,
            currentCountry,
            currentCity,
            currentZipCode,
            currentEmail,
            currentCountryCode,
            currentPhoneNo,
            hasPassport,
            noPassport,
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
  // Replace your existing updateBasicInformation method with this enhanced version
  updateBasicInformation: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log("DEBUG: Updating basic information for user" , req.body);

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
        "isFamilyNameEmpty",
        "isGivenNameEmpty",
        "gender",
        "DOB",
        "nationality",
        "countryOfResidence",
        "maritalStatus",
        "religion",
        "nativeLanguage",
        "currentAddress",
        "permanentAddress",
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
        "noPassport",
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
        // Add submission tracking fields
        "isSubmitted",
        "submittedAt"
      ];

      // Only include fields that are actually provided in the request
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updatedData[field] = req.body[field];
        }
      });

      // Apply conditional logic after basic field extraction
          // Handle checkbox and name field logic
    if (req.body.isFamilyNameEmpty === true) {
      updatedData.isFamilyNameEmpty = true;
      updatedData.familyName = "";
    } else if (req.body.isFamilyNameEmpty === false) {
      updatedData.isFamilyNameEmpty = false;
      // Keep the familyName as provided in the request
    }

  
      // Keep the givenName as provided in the request
    // }
      if (req.body.isFamilyNameEmpty === true) {
        updatedData.familyName = "";
      }

      if (req.body.isGivenNameEmpty === true) {
        updatedData.givenName = "";
      }

      if (req.body.noPassport === true) {
        updatedData.hasPassport = false;
        updatedData.passportNumber = "";
        updatedData.passportExpiryDate = undefined;
        updatedData.oldPassportNumber = "";
        updatedData.oldPassportExpiryDate = undefined;
      }

      // Handle date fields - convert string dates to Date objects if needed
      const dateFields = ['DOB', 'passportExpiryDate', 'oldPassportExpiryDate', 'visaExpiryDate'];
      dateFields.forEach(field => {
        if (updatedData[field] && typeof updatedData[field] === 'string') {
          try {
            updatedData[field] = new Date(updatedData[field]);
          } catch (error) {
            console.error(`Error converting ${field} to Date:`, error);
            // Keep the original value if conversion fails
          }
        }
      });

      // Add update timestamp
      updatedData.updatedAt = new Date();

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
    // console.log(req.body);
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
      // console.log(req.body, "Request");
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
      const updatedUser = await UserDb.findByIdAndUpdate(
  userId,
  { complete_profile: true },
  { new: true } // important to see changes
);

    console.log("Updated User:", updatedUser);
      console.log(applicationInformation , "This data is save");
     
      // Return the updated user data with success message
      return res.status(200).json({
        message: "Application Information Updated  and Respone is send back to Frontend",
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
  // Add these new methods to your stdDashboardController
  // Update single basic info field
  updateBasicInfoField: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update field",
          success: false,
        });
      }

      // Validate that only one field is being updated
      const fieldKeys = Object.keys(req.body);
      if (fieldKeys.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Only one field can be updated at a time'
        });
      }

      const fieldKey = fieldKeys[0];
      const fieldValue = req.body[fieldKey];

      // Define allowed fields for basic info
      const allowedFields = [
        'familyName', 'givenName', 'nationality', 'DOB', 'countryOfResidence',
        'gender', 'maritalStatus', 'religion', 'nativeLanguage',
        'currentAddress', 'permanentAddress', 'city', 'zipCode', 'email',
        'countryCode', 'phoneNo', 'passportNumber', 'passportExpiryDate',
        'oldPassportNumber', 'oldPassportExpiryDate', 'visitedCountry',
        'institution', 'visaType', 'visaExpiryDate', 'durationOfStudyAbroad',
        'sponsorName', 'sponsorRelationship', 'sponsorsNationality',
        'sponsorsOccupation', 'sponsorsEmail', 'sponsorsCountryCode', 'sponsorsPhoneNo'
      ];

      if (!allowedFields.includes(fieldKey)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid field name'
        });
      }

      // Update the specific field
      const result = await BasicInfo.findOneAndUpdate(
        { user: userId },
        { [fieldKey]: fieldValue },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: `${fieldKey} updated successfully`,
        data: result
      });

    } catch (error) {
      console.error('Error updating basic info field:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update field'
      });
    }
  },
  // Update single application info field
  updateApplicationInfoField: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update field",
          success: false,
        });
      }

      // Validate that only one field is being updated
      const fieldKeys = Object.keys(req.body);
      if (fieldKeys.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Only one field can be updated at a time'
        });
      }

      const fieldKey = fieldKeys[0];
      const fieldValue = req.body[fieldKey];

      // Define allowed fields for application info
      const allowedFields = [
        'countryOfStudy', 'proficiencyLevel', 'proficiencyTest', 'overAllScore',
        'listeningScore', 'readingScore', 'writingScore', 'speakingScore',
        'standardizedTest', 'standardizedOverallScore', 'standardizedSubScore'
      ];

      if (!allowedFields.includes(fieldKey)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid field name'
        });
      }

      // Update the specific field
      const result = await applicationInfo.findOneAndUpdate(
        { user: userId },
        { [fieldKey]: fieldValue },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: `${fieldKey} updated successfully`,
        data: result
      });

    } catch (error) {
      console.error('Error updating application info field:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update field'
      });
    }
  },
  // Update family members array
  updateFamilyMembers: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update family members",
          success: false,
        });
      }

      const { familyMembers } = req.body;

      if (!Array.isArray(familyMembers)) {
        return res.status(400).json({
          success: false,
          message: 'familyMembers must be an array'
        });
      }

      // Validate each family member object
      for (const member of familyMembers) {
        const requiredFields = ['name', 'relationship', 'nationality', 'occupation', 'email', 'phoneNo'];
        const missingFields = requiredFields.filter(field => !member[field]);

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields in family member: ${missingFields.join(', ')}`
          });
        }
      }

      const result = await BasicInfo.findOneAndUpdate(
        { user: userId },
        { familyMembers: familyMembers },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: 'Family members updated successfully',
        data: result
      });

    } catch (error) {
      console.error('Error updating family members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update family members'
      });
    }
  },
  // Update educational background array
  updateEducationalBackground: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update educational background",
          success: false,
        });
      }

      const { educationalBackground } = req.body;

      if (!Array.isArray(educationalBackground)) {
        return res.status(400).json({
          success: false,
          message: 'educationalBackground must be an array'
        });
      }

      // Validate each education object
      for (const education of educationalBackground) {
        const requiredFields = ['highestDegree', 'subjectName', 'institutionAttended', 'marks' , 'gradingType'];
        const missingFields = requiredFields.filter(field => !education[field]);

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields in educational background: ${missingFields.join(', ')}`
          });
        }
      }

      const result = await applicationInfo.findOneAndUpdate(
        { user: userId },
        { educationalBackground: educationalBackground },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: 'Educational background updated successfully',
        data: result
      });

    } catch (error) {
      console.error('Error updating educational background:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update educational background'
      });
    }
  },
  // Update work experience array
  updateWorkExperience: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to update work experience",
          success: false,
        });
      }

      const { workExperience } = req.body;

      if (!Array.isArray(workExperience)) {
        return res.status(400).json({
          success: false,
          message: 'workExperience must be an array'
        });
      }

      // Validate each work experience object
      for (const work of workExperience) {
        const requiredFields = ['jobTitle', 'organizationName', 'employmentType'];
        const missingFields = requiredFields.filter(field => !work[field]);

        if (missingFields.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields in work experience: ${missingFields.join(', ')}`
          });
        }
      }

      const result = await applicationInfo.findOneAndUpdate(
        { user: userId },
        { workExperience: workExperience },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        message: 'Work experience updated successfully',
        data: result
      });

    } catch (error) {
      console.error('Error updating work experience:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update work experience'
      });
    }
  },
  // Final application submission
  finalSubmission: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          message: "Login First to submit application",
          success: false,
        });
      }

      const { basicInfo, applicationInfo: appInfo, submittedAt } = req.body;

      // Validate that both basic info and application info exist
      const existingBasicInfo = await BasicInfo.findOne({ user: userId });
      const existingAppInfo = await applicationInfo.findOne({ user: userId });

      if (!existingBasicInfo || !existingAppInfo) {
        return res.status(400).json({
          success: false,
          message: 'Please complete all required sections before submitting'
        });
      }

      // Update submission status and timestamp
      await Promise.all([
        BasicInfo.findOneAndUpdate(
          { user: userId },
          {
            submittedAt: submittedAt || new Date().toISOString(),
            isSubmitted: true
          }
        ),
        applicationInfo.findOneAndUpdate(
          { user: userId },
          {
            submittedAt: submittedAt || new Date().toISOString(),
            isSubmitted: true
          }
        )
      ]);

      // Create or update application status
      await statusUpdate.findOneAndUpdate(
        { user: userId },
        {
          applicationStatus: 2, // Submitted status
          updatedAt: new Date()
        },
        { upsert: true }
      );

      res.json({
        success: true,
        message: 'Application submitted successfully!',
        submittedAt: submittedAt || new Date().toISOString()
      });

    } catch (error) {
      console.error('Error submitting final application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  },
  getDocuments: async (req, res) => {
    console.log("DEBUG: Fetching documents for user");
    try {
      const userId = req.user?.id;
      console.log("DEBUG: User ID:", userId);

      if (!userId) {
        return res.status(401).json({
          message: "Login First to view documents",
          success: false,
        });
      }

      const userDocument = await userFiles.findOne({ user: userId });
      console.log("DEBUG: User document found:", !!userDocument);
      console.log(
        "DEBUG: Number of documents:",
        userDocument?.documents?.length || 0
      );

      if (!userDocument || userDocument.documents.length === 0) {
        return res.status(404).json({
          message: "No documents found",
          success: false,
        });
      }

      // Generate presigned URLs for all files
      const documentsWithUrls = await Promise.all(
        userDocument.documents.map(async (doc) => {
          console.log(
            `DEBUG: Processing document "${doc.name}" with ${doc.files?.length || 0
            } files`
          );

          const docObj = doc.toObject();
          const filesWithUrls = await Promise.all(
            doc.files.map(async (file, index) => {
              const fileObj = file.toObject();
              console.log(`DEBUG: File ${index}:`, {
                name: fileObj.name,
                s3_key: fileObj.s3_key,
                hasS3Key: !!fileObj.s3_key,
              });

              let presignedUrl = null;
              if (fileObj.s3_key) {
                try {
                  presignedUrl = await generatePresignedUrl(
                    fileObj.s3_key,
                    3600
                  );
                } catch (error) {
                  console.error(
                    `Error generating presigned URL for ${fileObj.s3_key}:`,
                    error
                  );
                }
              }

              return {
                ...fileObj,
                url: presignedUrl || fileObj.url, // Fallback to stored URL if presigned fails
                permanent_url: fileObj.s3_key,
              };
            })
          );

          return {
            ...docObj,
            files: filesWithUrls,
          };
        })
      );

      console.log("DEBUG: Successfully processed documents");

      res.status(200).json({
        message: "Documents retrieved successfully!",
        success: true,
        documents: documentsWithUrls,
      });
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // uploadDocument: async (req, res) => {
  //   try {
  //     const userId = req.user?.id;
  //     console.log("DEBUG: Upload request for user:", userId);

  //     if (!userId) {
  //       return res.status(401).json({
  //         message: "Login First to upload file",
  //         success: false,
  //       });
  //     }

  //     // Use multer middleware for file upload
  //     upload.array("files", 10)(req, res, async (err) => {
  //       if (err) {
  //         console.error("Multer error:", err);
  //         return res.status(400).json({
  //           message: err.message || "File upload failed",
  //           success: false,
  //         });
  //       }

  //       const { documentName, documentId } = req.body;
  //       const uploadedFiles = req.files;

  //       console.log("DEBUG: Request body:", { documentName, documentId });
  //       console.log("DEBUG: Uploaded files count:", uploadedFiles?.length || 0);

  //       if (!uploadedFiles || uploadedFiles.length === 0) {
  //         return res.status(400).json({
  //           message: "No files uploaded",
  //           success: false,
  //         });
  //       }

  //       // Debug: Log the structure of uploaded files
  //       console.log("DEBUG: First uploaded file structure:", {
  //         originalname: uploadedFiles[0].originalname,
  //         key: uploadedFiles[0].key,
  //         location: uploadedFiles[0].location,
  //         size: uploadedFiles[0].size,
  //         mimetype: uploadedFiles[0].mimetype,
  //       });

  //       // Find or create user document entry
  //       let userDocument = await userFiles.findOne({ user: userId });
  //       if (!userDocument) {
  //         userDocument = new userFiles({ user: userId, documents: [] });
  //         console.log("DEBUG: Created new user document entry");
  //       } else {
  //         console.log("DEBUG: Found existing user document entry");
  //       }

  //       // Process uploaded files
  //       const processedFiles = uploadedFiles.map((file) => {
  //         const fileExtension = file.originalname
  //           .split(".")
  //           .pop()
  //           .toLowerCase();
  //         const fileType = getFileType(fileExtension);

  //         // Extract bucket name from S3 URL
  //         const bucketName = file.location
  //           .split(".s3.")[0]
  //           .split("https://")[1];

  //         const processedFile = {
  //           name: file.originalname,
  //           key: file.key, // Changed from s3_key to key (matches schema)
  //           bucket: bucketName, // Added bucket field (required by schema)
  //           url: file.location,
  //           size: file.size,
  //           mimetype: file.mimetype, // Changed from content_type to mimetype (matches schema)
  //           uploadedAt: new Date(),
  //           // Optional: Add etag if available from multer-s3
  //           etag: file.etag || undefined,
  //         };

  //         console.log("DEBUG: Processed file:", processedFile);
  //         return processedFile;
  //       });

  //       // Check if document already exists
  //       const existingDocumentIndex = userDocument.documents.findIndex(
  //         (d) => d.id === documentId
  //       );

  //       if (existingDocumentIndex !== -1) {
  //         console.log("DEBUG: Updating existing document");
  //         const existingDocument =
  //           userDocument.documents[existingDocumentIndex];
  //         existingDocument.files.push(...processedFiles);
  //         existingDocument.date = new Date().toISOString(); // Ensure it's a string as per schema
  //         existingDocument.isChecked = true;
  //       } else {
  //         console.log("DEBUG: Creating new document");
  //         userDocument.documents.push({
  //           id: documentId,
  //           name: documentName,
  //           files: processedFiles,
  //           date: new Date().toISOString(), // Ensure it's a string as per schema
  //           isChecked: true,
  //         });
  //       }

  //       await userDocument.save();
  //       console.log("DEBUG: Document saved successfully");

  //       res.status(201).json({
  //         message: "Documents uploaded successfully!",
  //         success: true,
  //         uploadedFiles: processedFiles.map((file) => ({
  //           name: file.name,
  //           url: file.url,
  //           key: file.key, // Changed from s3_key to key
  //           bucket: file.bucket, // Added bucket
  //           size: file.size,
  //           mimetype: file.mimetype, // Changed from file_type to mimetype
  //           _id: file._id || new Date().getTime().toString(), // Temporary ID for frontend
  //         })),
  //       });
  //     });
  //   } catch (error) {
  //     console.error("Error uploading documents:", error);
  //     res.status(500).json({
  //       error: "Internal server error",
  //       message: error.message,
  //     });
  //   }
  // },
// uploadDocument: async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     console.log("DEBUG: Upload request for user:", userId);

//     if (!userId) {
//       return res.status(401).json({
//         message: "Login First to upload file",
//         success: false,
//       });
//     }

//     upload.array("files", 10)(req, res, async (err) => {
//       if (err) {
//         console.error("Multer error:", err);
//         return res.status(400).json({
//           message: err.message || "File upload failed",
//           success: false,
//         });
//       }

//       const { documentName, documentId } = req.body;
//       const uploadedFiles = req.files;

//       if (!documentId) {
//         return res.status(400).json({
//           message: "documentId is required",
//           success: false,
//         });
//       }

//       if (!uploadedFiles || uploadedFiles.length === 0) {
//         return res.status(400).json({
//           message: "No files uploaded",
//           success: false,
//         });
//       }

//       // ===============================
//       // 🔒 DOCUMENT SIZE VALIDATION
//       // ===============================
//       const maxAllowedMB = DOCUMENT_SIZE_LIMITS_MB[documentId];

//       if (!maxAllowedMB) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid document type",
//         });
//       }

//       for (const file of uploadedFiles) {
//         const fileSizeMB = file.size / (1024 * 1024);

//         if (fileSizeMB > maxAllowedMB) {
//           return res.status(400).json({
//             success: false,
//             message: `${documentName} allows maximum ${maxAllowedMB} MB only`,
//           });
//         }
//       }

//       // ===============================
//       // FIND / CREATE USER DOCUMENT
//       // ===============================
//       let userDocument = await userFiles.findOne({ user: userId });
//       if (!userDocument) {
//         userDocument = new userFiles({ user: userId, documents: [] });
//       }

//       // ===============================
//       // PROCESS FILES
//       // ===============================
//       const processedFiles = uploadedFiles.map((file) => {
//         const fileExtension = file.originalname.split(".").pop().toLowerCase();
//         const fileType = getFileType(fileExtension);

//         const bucketName = file.location
//           .split(".s3.")[0]
//           .split("https://")[1];

//         return {
//           name: file.originalname,
//           key: file.key,
//           bucket: bucketName,
//           url: file.location,
//           size: file.size,
//           mimetype: file.mimetype,
//           uploadedAt: new Date(),
//           etag: file.etag || undefined,
//         };
//       });

//       // ===============================
//       // SAVE TO DOCUMENT ARRAY
//       // ===============================
//       const existingIndex = userDocument.documents.findIndex(
//         (d) => d.id === documentId
//       );

//       if (existingIndex !== -1) {
//         userDocument.documents[existingIndex].files.push(...processedFiles);
//         userDocument.documents[existingIndex].date = new Date().toISOString();
//         userDocument.documents[existingIndex].isChecked = true;
//       } else {
//         userDocument.documents.push({
//           id: documentId,
//           name: documentName,
//           files: processedFiles,
//           date: new Date().toISOString(),
//           isChecked: true,
//         });
//       }

//       await userDocument.save();

//       return res.status(201).json({
//         message: "Documents uploaded successfully!",
//         success: true,
//         uploadedFiles: processedFiles,
//       });
//     });
//   } catch (error) {
//     console.error("Error uploading documents:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// },
uploadDocument: async (req, res) => {
  try {
    const userId = req.user?.id;
    // console.log("DEBUG: Upload request for user:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Login First to upload file",
        success: false,
      });
    }

    upload.array("files", 10)(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          message: err.message || "File upload failed",
          success: false,
        });
      }

      const { documentName, documentId } = req.body;
      const uploadedFiles = req.files;

      // console.log("DEBUG: documentName:", documentName);
      // console.log("DEBUG: documentId:", documentId);

      if (!documentName || !documentId) {
        return res.status(400).json({
          message: "documentName and documentId are required",
          success: false,
        });
      }

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({
          message: "No files uploaded",
          success: false,
        });
      }

      // ===============================
      // 🔒 DOCUMENT SIZE VALIDATION
      // ===============================
      // FIX: Use documentName instead of documentId
      const maxAllowedMB = DOCUMENT_SIZE_LIMITS_MB[documentName];

      // console.log("DEBUG: maxAllowedMB for", documentName, ":", maxAllowedMB);

      if (!maxAllowedMB) {
        return res.status(400).json({
          success: false,
          message: `Unknown document type: ${documentName}`,
        });
      }

      // Check each uploaded file size
      for (const file of uploadedFiles) {
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > maxAllowedMB) {
          // Delete the file from S3 since validation failed
          if (file.key) {
            await deleteFromS3(file.key);
          }
          
          return res.status(400).json({
            success: false,
            message: `${documentName} allows maximum ${maxAllowedMB} MB per file. File "${file.originalname}" is ${fileSizeMB.toFixed(2)} MB.`,
          });
        }
      }

      // ===============================
      // FIND / CREATE USER DOCUMENT
      // ===============================
      let userDocument = await userFiles.findOne({ user: userId });
      if (!userDocument) {
        userDocument = new userFiles({ user: userId, documents: [] });
        // console.log("DEBUG: Created new user document entry");
      }

      // ===============================
      // CHECK EXISTING FILES SIZE
      // ===============================
      const existingDoc = userDocument.documents.find(d => d.id === documentId);
      const existingFilesSize = existingDoc 
        ? existingDoc.files.reduce((sum, f) => sum + (f.size || 0), 0)
        : 0;

      const newFilesSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
      const totalSizeMB = (existingFilesSize + newFilesSize) / (1024 * 1024);
      const maxTotalMB = maxAllowedMB;

      // console.log("DEBUG: Existing files size (MB):", (existingFilesSize / (1024 * 1024)).toFixed(2));
      // console.log("DEBUG: New files size (MB):", (newFilesSize / (1024 * 1024)).toFixed(2));
      // console.log("DEBUG: Total size (MB):", totalSizeMB.toFixed(2));

      if (totalSizeMB > maxTotalMB) {
        // Delete uploaded files since validation failed
        for (const file of uploadedFiles) {
          if (file.key) {
            await deleteFromS3(file.key);
          }
        }

        return res.status(400).json({
          success: false,
          message: `${documentName} total size exceeds ${maxTotalMB} MB limit. Current: ${totalSizeMB.toFixed(2)} MB`,
        });
      }

      // ===============================
      // PROCESS FILES
      // ===============================
      const processedFiles = uploadedFiles.map((file) => {
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const bucketName = file.location
          .split(".s3.")[0]
          .split("https://")[1];

        return {
          name: file.originalname,
          key: file.key,
          bucket: bucketName,
          url: file.location,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date(),
          etag: file.etag || undefined,
        };
      });

      // ===============================
      // SAVE TO DOCUMENT ARRAY
      // ===============================
      const existingIndex = userDocument.documents.findIndex(
        (d) => d.id === documentId
      );

      if (existingIndex !== -1) {
        userDocument.documents[existingIndex].files.push(...processedFiles);
        userDocument.documents[existingIndex].date = new Date().toISOString();
        userDocument.documents[existingIndex].isChecked = true;
      } else {
        userDocument.documents.push({
          id: documentId,
          name: documentName,
          files: processedFiles,
          date: new Date().toISOString(),
          isChecked: true,
        });
      }

      await userDocument.save();

      // console.log("DEBUG: Upload successful, returning response");

      return res.status(201).json({
        message: "Documents uploaded successfully!",
        success: true,
        uploadedFiles: processedFiles.map(f => ({
          name: f.name,
          url: f.url,
          key: f.key,
          size: f.size,
          mimetype: f.mimetype,
          _id: f._id || new Date().getTime().toString(),
        })),
      });
    });
  } catch (error) {
    console.error("Error uploading documents:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
},

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
          message: "Invalid request. Missing files.",
          success: false,
        });
      }

      const userDocument = await userFiles.findOne({ user: userId });
      if (!userDocument) {
        return res.status(404).json({
          message: "User document entry not found.",
          success: false,
        });
      }

      const fileIdsToDelete = files.map((file) => file._id);

      // Delete files from S3
      for (const file of files) {
        try {
          const s3Key = file.s3_key;
          if (s3Key) {
            const deleteResult = await deleteFromS3(s3Key);
            if (deleteResult.success) {
              // console.log(`Successfully deleted ${s3Key} from S3`);
            } else {
              console.error(
                `Failed to delete ${s3Key} from S3:`,
                deleteResult.error
              );
            }
          }
        } catch (err) {
          console.error("Error deleting file from S3:", err);
        }
      }

      // Remove files from database
      userDocument.documents.forEach((doc) => {
        doc.files = doc.files.filter(
          (file) => !fileIdsToDelete.includes(file._id.toString())
        );
      });

      // Remove documents with no files
      userDocument.documents = userDocument.documents.filter(
        (doc) => doc.files.length > 0
      );

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

  getFileUrl: async (req, res) => {
    try {
      const { s3Key } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          success: false,
        });
      }

      // Verify the file belongs to the user
      const userDocument = await userFiles.findOne({ user: userId });
      const fileExists = userDocument?.documents.some((doc) =>
        doc.files.some((file) => file.s3_key === s3Key)
      );

      if (!fileExists) {
        return res.status(404).json({
          message: "File not found or access denied",
          success: false,
        });
      }

      const presignedUrl = await generatePresignedUrl(s3Key, 900); // 15 minutes

      res.status(200).json({
        message: "Presigned URL generated successfully",
        success: true,
        url: presignedUrl,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  createStatusUpdate: async (req, res) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({
          message: "Login First to create or update status",
          success: false,
        });
      }

      const { applicationStatus, userId } = req.body;
      const validStatuses = [1, 2, 3, 4, 5, 6, 7];

      if (!validStatuses.includes(applicationStatus)) {
        return res.status(400).json({
          message: "Invalid application status",
          success: false,
        });
      }

      const status = await statusUpdate.findOneAndUpdate(
        { user: userId }, // Find by user
        { applicationStatus }, // Update the status
        { new: true, upsert: true } // Return updated, create if not exist
      );

      return res.status(200).json({
        message: "Application status created or updated successfully",
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Error creating or updating application status:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const adminId = req.user?.id; // Ensure user is authenticated
      if (!adminId) {
        return res.status(401).json({
          message: "Login First to update status",
          success: false,
        });
      }

      const { applicationStatus, userId } = req.body;

      // Validate the status
      const validStatuses = [1, 2, 3, 4, 5, 6, 7];

      if (!validStatuses.includes(applicationStatus)) {
        return res.status(400).json({
          message: "Invalid application status",
          success: false,
        });
      }

      // Update the user's status
      const updatedStatus = await statusUpdate.findByIdAndUpdate(
        userId,
        { statusUpdate },
        { new: true }
      );

      if (!updatedStatus) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "Application status updated successfully",
        success: true,
        data: updatedStatus,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },

  

  getStatusUpdate: async (req, res) => {
    const studentId = req.params.studentid;
    console.log("DEBUG: Fetching status for student ID:", studentId);

    try {
      const status = await statusUpdate.findOne({ user: studentId }); // or whatever field matches

      if (!status) {
        return res.status(404).json({
          message: "No status found for this student",
          success: false,
        });
      }

      return res.status(200).json({
        message: "Status retrieved successfully",
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Error fetching status:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },

  getStatusUpdateStudent: async (req, res) => {
    const userId = req.user?.id;
    // console.log("DEBUG: Fetching status for user ID:", userId);
    try {
      const status = await statusUpdate.findOne({ user: userId }); // or whatever field matches

      if (!status) {
        return res.status(404).json({
          message: "No status found for this student",
          success: false,
        });
      }

      return res.status(200).json({
        message: "Status retrieved successfully",
        success: true,
        data: status,
      });
    } catch (error) {
      console.error("Error fetching status:", error);
      res.status(500).json({
        message: error.message || "Internal Server Error",
        success: false,
      });
    }
  },
};

module.exports = stdDashboardController;
