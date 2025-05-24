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

// Helper function to determine file type
const getFileType = (extension) => {
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
  const documentTypes = ["pdf", "doc", "docx"];

  if (imageTypes.includes(extension)) return "image";
  if (documentTypes.includes(extension)) return "document";
  return "other";
};
// // Enhanced file type detection
// const getFileType = (extension) => {
//   const imageTypes = [
//     "jpg",
//     "jpeg",
//     "png",
//     "gif",
//     "bmp",
//     "webp",
//     "svg",
//     "tiff",
//     "ico",
//   ];
//   const documentTypes = [
//     "doc",
//     "docx",
//     "txt",
//     "xlsx",
//     "xls",
//     "ppt",
//     "pptx",
//     "rtf",
//     "odt",
//   ];

//   extension = extension.toLowerCase();

//   if (extension === "pdf") return "pdf";
//   if (imageTypes.includes(extension)) return "image";
//   if (documentTypes.includes(extension)) return "document";
//   return "other";
// };

// Helper function to determine Cloudinary resource type
const getCloudinaryResourceType = (fileType) => {
  switch (fileType) {
    case "image":
      return "image";
    case "pdf":
    case "document":
    case "other":
      return "raw";
    default:
      return "raw";
  }
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
  // // get user documents
  // getDocuments: async (req, res) => {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       return res.status(401).json({
  //         message: "Login First to view documents",
  //         success: false,
  //       });
  //     }

  //     // Find the user's documents
  //     const userDocument = await userFiles.findOne({ user: userId });
  //     if (!userDocument || userDocument.documents.length === 0) {
  //       return res.status(404).json({
  //         message: "No documents found",
  //         success: false,
  //       });
  //     }

  //     res.status(200).json({
  //       message: "Documents retrieved successfully!",
  //       success: true,
  //       documents: userDocument.documents,
  //     });
  //   } catch (error) {
  //     console.error("Error retrieving documents:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // },
  // // Upload Documents Controller
  // uploadDocument: async (req, res) => {
  //   try {
  //     const { documents } = req.body;
  //     const userId = req.user?.id;

  //     console.log(req.body, "Request Body");

  //     if (!userId) {
  //       return res.status(401).json({
  //         message: "Login First to upload file",
  //         success: false,
  //       });
  //     }

  //     if (!Array.isArray(documents) || documents.length === 0) {
  //       return res.status(400).json({
  //         message: "No documents provided",
  //         success: false,
  //       });
  //     }

  //     // Find user's existing document entry
  //     let userDocument = await userFiles.findOne({ user: userId });

  //     if (!userDocument) {
  //       userDocument = new userFiles({ user: userId, documents: [] });
  //     }

  //     for (const doc of documents) {
  //       const { id, name, date, isChecked, files = [] } = doc;

  //       if (!id || !name || !Array.isArray(files) || files.length === 0) {
  //         continue; // Skip invalid documents
  //       }

  //       // Enhanced file metadata mapping
  //       const uploadedFiles = files.map((file) => {
  //         const fileExtension = file.name.split(".").pop().toLowerCase();
  //         const fileType = getFileType(fileExtension);
  //         const resourceType = getCloudinaryResourceType(fileType);

  //         return {
  //           name: file.name,
  //           url: file.url,
  //           public_id: file.public_id,
  //           file_type: fileType,
  //           file_extension: fileExtension,
  //           resource_type: resourceType,
  //           // Add file size if available
  //           size: file.size || null,
  //           // Add upload timestamp
  //           uploaded_at: new Date().toISOString(),
  //         };
  //       });

  //       // Check if document already exists (by `id`)
  //       const existingDocumentIndex = userDocument.documents.findIndex(
  //         (d) => d.id === id
  //       );

  //       if (existingDocumentIndex !== -1) {
  //         // Update existing document (Avoid duplicates)
  //         const existingDocument =
  //           userDocument.documents[existingDocumentIndex];
  //         const existingFileNames = existingDocument.files.map(
  //           (file) => file.name
  //         );

  //         const newFiles = uploadedFiles.filter(
  //           (file) => !existingFileNames.includes(file.name)
  //         );

  //         existingDocument.files.push(...newFiles);
  //         existingDocument.date = date;
  //         existingDocument.isChecked = isChecked;
  //       } else {
  //         // Add a new document
  //         userDocument.documents.push({
  //           id,
  //           name,
  //           files: uploadedFiles,
  //           date,
  //           isChecked,
  //         });
  //       }
  //     }

  //     console.log(
  //       "Documents being saved:",
  //       JSON.stringify(userDocument.documents, null, 2)
  //     );

  //     await userDocument.save();

  //     res.status(201).json({
  //       message: "Documents uploaded successfully!",
  //       success: true,
  //       documents: userDocument.documents,
  //     });
  //   } catch (error) {
  //     console.error("Error saving documents:", error);
  //     res.status(500).json({
  //       error: "Internal server error",
  //       message: error.message,
  //     });
  //   }
  // },

  // deleteDocument: async (req, res) => {
  //   try {
  //     const { files } = req.body;
  //     const userId = req.user?.id;

  //     if (!userId) {
  //       return res.status(401).json({
  //         message: "Unauthorized! Please login first.",
  //         success: false,
  //       });
  //     }

  //     if (!Array.isArray(files) || files.length === 0) {
  //       return res.status(400).json({
  //         message: "Invalid request. Missing document ID or files.",
  //         success: false,
  //       });
  //     }

  //     // Find the user's document entry
  //     let userDocument = await userFiles.findOne({ user: userId });

  //     if (!userDocument) {
  //       return res.status(404).json({
  //         message: "User document entry not found.",
  //         success: false,
  //       });
  //     }

  //     // **Filter out documents that match the given file IDs**
  //     const fileIdsToDelete = files.map((file) => file._id);

  //     // Remove the specific files from each document
  //     userDocument.documents.forEach((doc) => {
  //       doc.files = doc.files.filter(
  //         (file) => !fileIdsToDelete.includes(file._id.toString())
  //       );
  //     });

  //     // Delete documents that have no files left
  //     userDocument.documents = userDocument.documents.filter(
  //       (doc) => doc.files.length > 0
  //     );

  //     for (const file of files) {
  //       try {
  //         const publicId = file.public_id; // Ensure you store `public_id` in the database

  //         if (!publicId) {
  //           console.error("Missing Cloudinary Public ID for:", file.url);
  //           continue; // Skip if no public ID
  //         }

  //         const result = await cloudinary.uploader.destroy(publicId);
  //         console.log(`Deleted ${publicId}:`, result);
  //       } catch (err) {
  //         console.error("Error deleting file from Cloudinary:", err);
  //       }
  //     }

  //     // Save the updated document list
  //     await userDocument.save();

  //     res.status(200).json({
  //       message: "Document deleted successfully!",
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting document:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // },
  //controller\StdDashboardController.js
  // Get user documents with presigned URLs
  getDocuments: async (req, res) => {
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
            `DEBUG: Processing document "${doc.name}" with ${
              doc.files?.length || 0
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

  uploadDocument: async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log("DEBUG: Upload request for user:", userId);

      if (!userId) {
        return res.status(401).json({
          message: "Login First to upload file",
          success: false,
        });
      }

      // Use multer middleware for file upload
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

        console.log("DEBUG: Request body:", { documentName, documentId });
        console.log("DEBUG: Uploaded files count:", uploadedFiles?.length || 0);

        if (!uploadedFiles || uploadedFiles.length === 0) {
          return res.status(400).json({
            message: "No files uploaded",
            success: false,
          });
        }

        // Debug: Log the structure of uploaded files
        console.log("DEBUG: First uploaded file structure:", {
          originalname: uploadedFiles[0].originalname,
          key: uploadedFiles[0].key,
          location: uploadedFiles[0].location,
          size: uploadedFiles[0].size,
          mimetype: uploadedFiles[0].mimetype,
        });

        // Find or create user document entry
        let userDocument = await userFiles.findOne({ user: userId });
        if (!userDocument) {
          userDocument = new userFiles({ user: userId, documents: [] });
          console.log("DEBUG: Created new user document entry");
        } else {
          console.log("DEBUG: Found existing user document entry");
        }

        // Process uploaded files
        const processedFiles = uploadedFiles.map((file) => {
          const fileExtension = file.originalname
            .split(".")
            .pop()
            .toLowerCase();
          const fileType = getFileType(fileExtension);

          // Extract bucket name from S3 URL
          const bucketName = file.location
            .split(".s3.")[0]
            .split("https://")[1];

          const processedFile = {
            name: file.originalname,
            key: file.key, // Changed from s3_key to key (matches schema)
            bucket: bucketName, // Added bucket field (required by schema)
            url: file.location,
            size: file.size,
            mimetype: file.mimetype, // Changed from content_type to mimetype (matches schema)
            uploadedAt: new Date(),
            // Optional: Add etag if available from multer-s3
            etag: file.etag || undefined,
          };

          console.log("DEBUG: Processed file:", processedFile);
          return processedFile;
        });

        // Check if document already exists
        const existingDocumentIndex = userDocument.documents.findIndex(
          (d) => d.id === documentId
        );

        if (existingDocumentIndex !== -1) {
          console.log("DEBUG: Updating existing document");
          const existingDocument =
            userDocument.documents[existingDocumentIndex];
          existingDocument.files.push(...processedFiles);
          existingDocument.date = new Date().toISOString(); // Ensure it's a string as per schema
          existingDocument.isChecked = true;
        } else {
          console.log("DEBUG: Creating new document");
          userDocument.documents.push({
            id: documentId,
            name: documentName,
            files: processedFiles,
            date: new Date().toISOString(), // Ensure it's a string as per schema
            isChecked: true,
          });
        }

        await userDocument.save();
        console.log("DEBUG: Document saved successfully");

        res.status(201).json({
          message: "Documents uploaded successfully!",
          success: true,
          uploadedFiles: processedFiles.map((file) => ({
            name: file.name,
            url: file.url,
            key: file.key, // Changed from s3_key to key
            bucket: file.bucket, // Added bucket
            size: file.size,
            mimetype: file.mimetype, // Changed from file_type to mimetype
            _id: file._id || new Date().getTime().toString(), // Temporary ID for frontend
          })),
        });
      });
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
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
              console.log(`Successfully deleted ${s3Key} from S3`);
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
};

// uploadDocument: async (req, res) => {
//   try {
//     const { documents } = req.body;
//     const userId = req.user?.id;
//     console.log(req.body, "Request Body");s
//     if (!userId) {
//       return res.status(401).json({
//         message: "Login First to upload file",
//         success: false,
//       });
//     }

//     if (!Array.isArray(documents) || documents.length === 0) {
//       return res.status(400).json({
//         message: "No documents provided",
//         success: false,
//       });
//     }

//     // Find user's existing document entry
//     let userDocument = await userFiles.findOne({ user: userId });

//     if (!userDocument) {
//       userDocument = new userFiles({ user: userId, documents: [] });
//     }

//     for (const doc of documents) {
//       const { id, name, date, isChecked, files = [] } = doc;

//       if (!id || !name || !Array.isArray(files) || files.length === 0) {
//         continue; // Skip invalid documents
//       }

//       // 🔥 Map uploaded file metadata
//       const uploadedFiles = files.map((file) => ({
//         name: file.name,
//         url: file.url,
//         public_id: file.public_id,
//       }));

//       // ✅ Check if document already exists (by `id`)
//       const existingDocumentIndex = userDocument.documents.findIndex(
//         (d) => d.id === id
//       );

//       if (existingDocumentIndex !== -1) {
//         // ✅ Update existing document (Avoid duplicates)
//         const existingDocument =
//           userDocument.documents[existingDocumentIndex];
//         const existingFileNames = existingDocument.files.map(
//           (file) => file.name
//         );

//         const newFiles = uploadedFiles.filter(
//           (file) => !existingFileNames.includes(file.name)
//         );

//         existingDocument.files.push(...newFiles);
//         existingDocument.date = date;
//         existingDocument.isChecked = isChecked;
//       } else {
//         // ✅ Add a new document
//         userDocument.documents.push({
//           id, // Ensure `id` is stored
//           name,
//           files: uploadedFiles,
//           date,
//           isChecked,
//         });
//       }
//     }

//     console.log("Documents received:", documents);
//     documents.forEach((doc) => {
//       doc.files.forEach((file) => {
//         console.log("File:", file);
//         console.log("Public ID:", file.public_id);
//       });
//     });

//     await userDocument.save();

//     res.status(201).json({
//       message: "Documents uploaded successfully!",
//       success: true,
//       documents: userDocument.documents,
//     });
//   } catch (error) {
//     console.error("Error saving documents:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// },
// delete Documents Controller
module.exports = stdDashboardController;
