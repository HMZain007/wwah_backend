/**
 * @swagger
 * /studentDashboard/basicInformation:
 *   post:
 *     summary: Create or Update Basic Information
 *     description: Creates or updates the complete basic information for a student including personal details, addresses, passport info, study abroad history, sponsor details, and family members.
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyName:
 *                 type: string
 *                 example: "Smith"
 *               givenName:
 *                 type: string
 *                 example: "John"
 *               isGivenNameEmpty:
 *                 type: boolean
 *                 example: false
 *               isFamilyNameEmpty:
 *                 type: boolean
 *                 example: false
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: "2000-05-15"
 *               nationality:
 *                 type: string
 *                 example: "American"
 *               countryOfResidence:
 *                 type: string
 *                 example: "United States"
 *               nativeLanguage:
 *                 type: string
 *                 example: "English"
 *               maritalStatus:
 *                 type: string
 *                 example: "Single"
 *               religion:
 *                 type: string
 *                 example: "Christianity"
 *               homeAddress:
 *                 type: string
 *                 example: "123 Main Street"
 *               detailedAddress:
 *                 type: string
 *                 example: "Apartment 4B"
 *               currentAddress:
 *                 type: string
 *                 example: "456 Oak Avenue"
 *               permanentAddress:
 *                 type: string
 *                 example: "789 Pine Road"
 *               sameAsCurrent:
 *                 type: boolean
 *                 example: false
 *               country:
 *                 type: string
 *                 example: "United States"
 *               city:
 *                 type: string
 *                 example: "New York"
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.smith@example.com"
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               phoneNo:
 *                 type: string
 *                 example: "5551234567"
 *               currentHomeAddress:
 *                 type: string
 *               currentDetailedAddress:
 *                 type: string
 *               currentCountry:
 *                 type: string
 *               currentCity:
 *                 type: string
 *               currentZipCode:
 *                 type: string
 *               currentEmail:
 *                 type: string
 *                 format: email
 *               currentCountryCode:
 *                 type: string
 *               currentPhoneNo:
 *                 type: string
 *               hasPassport:
 *                 type: boolean
 *                 example: true
 *               noPassport:
 *                 type: boolean
 *                 example: false
 *               passportNumber:
 *                 type: string
 *                 example: "AB1234567"
 *               passportExpiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2030-12-31"
 *               oldPassportNumber:
 *                 type: string
 *               oldPassportExpiryDate:
 *                 type: string
 *                 format: date
 *               hasStudiedAbroad:
 *                 type: boolean
 *                 example: false
 *               visitedCountry:
 *                 type: string
 *               studyDuration:
 *                 type: string
 *               institution:
 *                 type: string
 *               visaType:
 *                 type: string
 *               visaExpiryDate:
 *                 type: string
 *                 format: date
 *               durationOfStudyAbroad:
 *                 type: string
 *               sponsorName:
 *                 type: string
 *                 example: "Jane Smith"
 *               sponsorRelationship:
 *                 type: string
 *                 example: "Mother"
 *               sponsorsNationality:
 *                 type: string
 *               sponsorsOccupation:
 *                 type: string
 *               sponsorsEmail:
 *                 type: string
 *                 format: email
 *               sponsorsCountryCode:
 *                 type: string
 *               sponsorsPhoneNo:
 *                 type: string
 *               familyMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     relationship:
 *                       type: string
 *                     nationality:
 *                       type: string
 *                     occupation:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phoneNo:
 *                       type: string
 *     responses:
 *       200:
 *         description: Basic Information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Basic Information Updated Successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/getBasicInformation:
 *   get:
 *     summary: Get Basic Information
 *     description: Retrieves the complete basic information for the authenticated student.
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Basic Information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Basic Information retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: Basic Information not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/applicationInformation:
 *   post:
 *     summary: Create or Update Application Information
 *     description: Creates or updates application information including country of study, language proficiency, standardized tests, educational background, and work experience. Sets complete_profile to true in UserDb.
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               countryOfStudy:
 *                 type: string
 *                 example: "United Kingdom"
 *               proficiencyLevel:
 *                 type: string
 *                 example: "Advanced"
 *               proficiencyTest:
 *                 type: string
 *                 example: "IELTS"
 *               overAllScore:
 *                 type: number
 *                 example: 7.5
 *               listeningScore:
 *                 type: number
 *                 example: 8.0
 *               writingScore:
 *                 type: number
 *                 example: 7.0
 *               readingScore:
 *                 type: number
 *                 example: 7.5
 *               speakingScore:
 *                 type: number
 *                 example: 7.5
 *               standardizedTest:
 *                 type: string
 *                 example: "GRE"
 *               standardizedOverallScore:
 *                 type: number
 *                 example: 320
 *               standardizedSubScore:
 *                 type: string
 *                 example: "Verbal: 160, Quant: 160"
 *               educationalBackground:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - highestDegree
 *                     - subjectName
 *                     - institutionAttended
 *                     - marks
 *                     - gradingType
 *                   properties:
 *                     highestDegree:
 *                       type: string
 *                       example: "Bachelor's Degree"
 *                     subjectName:
 *                       type: string
 *                       example: "Computer Science"
 *                     institutionAttended:
 *                       type: string
 *                       example: "MIT"
 *                     marks:
 *                       type: number
 *                       example: 3.8
 *                     gradingType:
 *                       type: string
 *                       example: "GPA"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - jobTitle
 *                     - organizationName
 *                     - employmentType
 *                   properties:
 *                     jobTitle:
 *                       type: string
 *                       example: "Software Engineer"
 *                     organizationName:
 *                       type: string
 *                       example: "Tech Corp"
 *                     employmentType:
 *                       type: string
 *                       example: "Full-time"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     responsibilities:
 *                       type: string
 *     responses:
 *       200:
 *         description: Application Information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application Information Updated and Response is send back to Frontend"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/getApplicationInformation:
 *   get:
 *     summary: Get Application Information
 *     description: Retrieves the complete application information for the authenticated student.
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application Information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application Information retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: Application Information not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/getDocuments:
 *   get:
 *     summary: Get All Documents
 *     description: Retrieves all documents uploaded by the authenticated student with presigned URLs for secure access (valid for 1 hour).
 *     tags:
 *       - Student Dashboard
 *       - Documents
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Documents retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Documents retrieved successfully!"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       isChecked:
 *                         type: boolean
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             key:
 *                               type: string
 *                             bucket:
 *                               type: string
 *                             url:
 *                               type: string
 *                               description: Presigned URL (valid for 1 hour)
 *                             permanent_url:
 *                               type: string
 *                             size:
 *                               type: number
 *                             mimetype:
 *                               type: string
 *                             uploadedAt:
 *                               type: string
 *                               format: date-time
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: No documents found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/uploadDocument:
 *   post:
 *     summary: Upload Document Files
 *     description: Uploads one or more document files to AWS S3 (max 10 files, 5MB each). Files are organized by document type/name.
 *     tags:
 *       - Student Dashboard
 *       - Documents
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documentName
 *               - documentId
 *               - files
 *             properties:
 *               documentName:
 *                 type: string
 *                 description: Name/type of the document (e.g., "Passport", "Transcript")
 *                 example: "Academic Transcript"
 *               documentId:
 *                 type: string
 *                 description: Unique identifier for the document category
 *                 example: "transcript_001"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10 files)
 *     responses:
 *       201:
 *         description: Documents uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Documents uploaded successfully!"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 uploadedFiles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       url:
 *                         type: string
 *                       key:
 *                         type: string
 *                       bucket:
 *                         type: string
 *                       size:
 *                         type: number
 *                       mimetype:
 *                         type: string
 *                       _id:
 *                         type: string
 *       400:
 *         description: Bad request - No files uploaded or invalid request.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/deleteDocument:
 *   delete:
 *     summary: Delete Document Files
 *     description: Deletes specified document files from both AWS S3 and the database. Removes document categories with no remaining files.
 *     tags:
 *       - Student Dashboard
 *       - Documents
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - _id
 *                     - s3_key
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Database ID of the file
 *                       example: "60d5ec49f1b2c72b8c8e4a1b"
 *                     s3_key:
 *                       type: string
 *                       description: S3 object key of the file
 *                       example: "student-docs/1234567890-transcript.pdf"
 *     responses:
 *       200:
 *         description: Document deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Document deleted successfully!"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request - Missing files array.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: User document entry not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/createStatusUpdate:
 *   post:
 *     summary: Create or Update Application Status (Admin)
 *     description: Creates or updates the application status for a student. Status values range from 1-7 representing different application stages.
 *     tags:
 *       - Student Dashboard
 *       - Admin
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationStatus
 *               - userId
 *             properties:
 *               applicationStatus:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 description: Application status (1=Started, 2=Submitted, 3=Under Review, 4=Interview, 5=Decision Pending, 6=Accepted, 7=Rejected)
 *                 example: 2
 *               userId:
 *                 type: string
 *                 description: ID of the student whose status is being updated
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Application status created or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application status created or updated successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid application status.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateStatus:
 *   put:
 *     summary: Update Application Status (Admin)
 *     description: Updates an existing application status for a student.
 *     tags:
 *       - Student Dashboard
 *       - Admin
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationStatus
 *               - userId
 *             properties:
 *               applicationStatus:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 7
 *                 example: 3
 *               userId:
 *                 type: string
 *                 example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Application status updated successfully.
 *       400:
 *         description: Invalid application status.
 *       401:
 *         description: Unauthorized - Admin access required.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/getStatusUpdate/{studentid}:
 *   get:
 *     summary: Get Student Application Status
 *     description: Retrieves the application status for a specific student by their ID.
 *     tags:
 *       - Student Dashboard
 *     parameters:
 *       - in: path
 *         name: studentid
 *         required: true
 *         schema:
 *           type: string
 *         description: Student's user ID
 *         example: "60d5ec49f1b2c72b8c8e4a1b"
 *     responses:
 *       200:
 *         description: Status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Status retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     applicationStatus:
 *                       type: integer
 *                     user:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No status found for this student.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/getStatusUpdateStudent:
 *   get:
 *     summary: Get My Application Status
 *     description: Retrieves the application status for the authenticated student.
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Status retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - User not logged in.
 *       404:
 *         description: No status found for this student.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateBasicInfoField:
 *   patch:
 *     summary: Update Single Basic Info Field
 *     description: Updates a single field in the student's basic information. Only one field can be updated per request.
 *     tags:
 *       - Student Dashboard
 *       - Field Updates
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Only include ONE field to update
 *             example:
 *               nationality: "Canadian"
 *             properties:
 *               familyName:
 *                 type: string
 *               givenName:
 *                 type: string
 *               nationality:
 *                 type: string
 *               DOB:
 *                 type: string
 *                 format: date
 *               countryOfResidence:
 *                 type: string
 *               gender:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *               religion:
 *                 type: string
 *               nativeLanguage:
 *                 type: string
 *               currentAddress:
 *                 type: string
 *               permanentAddress:
 *                 type: string
 *               city:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               email:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               phoneNo:
 *                 type: string
 *               passportNumber:
 *                 type: string
 *               passportExpiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Field updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "nationality updated successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request - Only one field allowed or invalid field name.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateApplicationInfoField:
 *   patch:
 *     summary: Update Single Application Info Field
 *     description: Updates a single field in the student's application information. Only one field can be updated per request.
 *     tags:
 *       - Student Dashboard
 *       - Field Updates
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Only include ONE field to update
 *             example:
 *               overAllScore: 7.5
 *             properties:
 *               countryOfStudy:
 *                 type: string
 *               proficiencyLevel:
 *                 type: string
 *               proficiencyTest:
 *                 type: string
 *               overAllScore:
 *                 type: number
 *               listeningScore:
 *                 type: number
 *               readingScore:
 *                 type: number
 *               writingScore:
 *                 type: number
 *               speakingScore:
 *                 type: number
 *               standardizedTest:
 *                 type: string
 *               standardizedOverallScore:
 *                 type: number
 *               standardizedSubScore:
 *                 type: string
 *     responses:
 *       200:
 *         description: Field updated successfully.
 *       400:
 *         description: Invalid request - Only one field allowed or invalid field name.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateFamilyMembers:
 *   patch:
 *     summary: Update Family Members Array
 *     description: Updates the complete family members array for the student. Replaces existing family members with the provided array.
 *     tags:
 *       - Student Dashboard
 *       - Field Updates
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - familyMembers
 *             properties:
 *               familyMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - relationship
 *                     - nationality
 *                     - occupation
 *                     - email
 *                     - phoneNo
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Jane Smith"
 *                     relationship:
 *                       type: string
 *                       example: "Mother"
 *                     nationality:
 *                       type: string
 *                       example: "American"
 *                     occupation:
 *                       type: string
 *                       example: "Teacher"
 *                     email:
 *                       type: string
 *                       example: "jane.smith@example.com"
 *                     phoneNo:
 *                       type: string
 *                       example: "+1 5551234567"
 *     responses:
 *       200:
 *         description: Family members updated successfully.
 *       400:
 *         description: Invalid request - Missing required fields in family member data.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateEducationalBackground:
 *   patch:
 *     summary: Update Educational Background Array
 *     description: Updates the complete educational background array for the student. Replaces existing education records with the provided array.
 *     tags:
 *       - Student Dashboard
 *       - Field Updates
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - educationalBackground
 *             properties:
 *               educationalBackground:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - highestDegree
 *                     - subjectName
 *                     - institutionAttended
 *                     - marks
 *                     - gradingType
 *                   properties:
 *                     highestDegree:
 *                       type: string
 *                       example: "Bachelor's Degree"
 *                     subjectName:
 *                       type: string
 *                       example: "Computer Science"
 *                     institutionAttended:
 *                       type: string
 *                       example: "MIT"
 *                     marks:
 *                       type: number
 *                       example: 3.8
 *                     gradingType:
 *                       type: string
 *                       example: "GPA"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Educational background updated successfully.
 *       400:
 *         description: Invalid request - Missing required fields in educational background.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/updateWorkExperience:
 *   patch:
 *     summary: Update Work Experience Array
 *     description: Updates the complete work experience array for the student. Replaces existing work experience records with the provided array.
 *     tags:
 *       - Student Dashboard
 *       - Field Updates
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workExperience
 *             properties:
 *               workExperience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - jobTitle
 *                     - organizationName
 *                     - employmentType
 *                   properties:
 *                     jobTitle:
 *                       type: string
 *                       example: "Software Engineer"
 *                     organizationName:
 *                       type: string
 *                       example: "Tech Corp"
 *                     employmentType:
 *                       type: string
 *                       example: "Full-time"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     responsibilities:
 *                       type: string
 *                       example: "Developed web applications"
 *     responses:
 *       200:
 *         description: Work experience updated successfully.
 *       400:
 *         description: Invalid request - Missing required fields in work experience.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /studentDashboard/finalSubmission:
 *   post:
 *     summary: Submit Complete Application
 *     description: Finalizes and submits the student's complete application. Sets isSubmitted to true, records submission timestamp, and updates application status to 2 (Submitted).
 *     tags:
 *       - Student Dashboard
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basicInfo:
 *                 type: object
 *                 description: Confirmation that basic info section is complete
 *               applicationInfo:
 *                 type: object
 *                 description: Confirmation that application info section is complete
 *               submittedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Submission timestamp (optional, defaults to current time)
 *     responses:
 *       200:
 *         description: Application submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Application submitted successfully!"
 *                 submittedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Complete all required sections before submitting.
 *       401:
 *         description: Unauthorized - User not logged in.
 *       500:
 *         description: Internal server error.
 */
const express = require("express");
const router = express.Router();
// const authenticateToken = require("../../middlewares/authMiddleware");
const stdDashboardController = require("../../controller/StdDashboardController");
const authenticateToken = require("../../middlewares/authMiddleware");

// Existing routes
router.post(
  "/basicInformation",
  authenticateToken,
  stdDashboardController.basicInformation
);

router.get(
  "/getBasicInformation",
  authenticateToken,
  stdDashboardController.getBasicInformation
);

router.post(
  "/applicationInformation",
  authenticateToken,
  stdDashboardController.applicationInformation
);

router.get(
  "/getApplicationInformation",
  authenticateToken,
  stdDashboardController.getApplicationInformation
);

router.get(
  "/getDocuments",
  authenticateToken,
  stdDashboardController.getDocuments
);

router.post(
  "/uploadDocument",
  authenticateToken,
  stdDashboardController.uploadDocument
);

router.delete(
  "/deleteDocument",
  authenticateToken,
  stdDashboardController.deleteDocument
);

router.post(
  "/createStatusUpdate",
  authenticateToken,
  stdDashboardController.createStatusUpdate
);

router.put(
  "/updateStatus",
  authenticateToken,
  stdDashboardController.updateStatus
);

router.get(
  "/getStatusUpdate/:studentid",
  stdDashboardController.getStatusUpdate
);

router.get(
  "/getStatusUpdateStudent",
  authenticateToken,
  stdDashboardController.getStatusUpdateStudent
);

// NEW ROUTES FOR FIELD-SPECIFIC UPDATES
router.patch(
  "/updateBasicInfoField",
  authenticateToken,
  stdDashboardController.updateBasicInfoField
);

router.patch(
  "/updateApplicationInfoField",
  authenticateToken,
  stdDashboardController.updateApplicationInfoField
);

router.patch(
  "/updateFamilyMembers",
  authenticateToken,
  stdDashboardController.updateFamilyMembers
);

router.patch(
  "/updateEducationalBackground",
  authenticateToken,
  stdDashboardController.updateEducationalBackground
);

router.patch(
  "/updateWorkExperience",
  authenticateToken,
  stdDashboardController.updateWorkExperience
);

router.post(
  "/finalSubmission",
  authenticateToken,
  stdDashboardController.finalSubmission
);

module.exports = router;
