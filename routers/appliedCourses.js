
const express = require("express");
const router = express.Router();
const UserDb = require("../database/models/UserDb");
const authenticateToken = require("../middlewares/authMiddleware");
// :white_check_mark: GET route to fetch applied course IDs
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        // Find user and get applied courses
        const user = await UserDb.findById(userId).select("appliedCourses");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.json({
            success: true,
            message: "Applied courses fetched successfully",
            data: {
                appliedCourses: user.appliedCourses || [],
                totalAppliedCourses: user.appliedCourses
                    ? user.appliedCourses.length
                    : 0,
            },
        });
    } catch (error) {
        console.error(":x: Error fetching applied courses:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
// :white_check_mark: POST route to add/remove applied course IDs
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { courseId, action } = req.body;
        const userId = req.user?.id || req.userId;
        console.log(":memo: Request received:", { courseId, action, userId }); // Debug log
        // Validate required fields
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }
        if (!action || !["add", "remove"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Action is required and must be 'add' or 'remove'",
            });
        }
        // :white_check_mark: Ensure courseId is treated as a string
        const courseIdString = courseId.toString();
        // Find user first
        const user = await UserDb.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(":bust_in_silhouette: User found:", {
            userId,
            currentAppliedCourses: user.appliedCourses,
        }); // Debug log
        let updatedUser;
        let message;
        let isApplied;
        if (action === "add") {
            // Check if course is already applied to avoid unnecessary operations
            if (user.appliedCourses && user.appliedCourses.includes(courseIdString)) {
                return res.json({
                    success: true,
                    message: "Course is already in applied courses",
                    data: {
                        appliedCourses: user.appliedCourses,
                        isApplied: true,
                        totalAppliedCourses: user.appliedCourses.length,
                        courseId: courseIdString,
                    },
                });
            }
            // Add to applied courses (using $addToSet to avoid duplicates)
            updatedUser = await UserDb.findByIdAndUpdate(
                userId,
                {
                    $addToSet: { appliedCourses: courseIdString },
                    // :white_check_mark: No need to manually set updatedAt since timestamps: true handles it
                },
                { new: true }
            );
            console.log(":white_check_mark: Course added:", {
                courseId: courseIdString,
                newAppliedCourses: updatedUser.appliedCourses,
            }); // Debug log
            message = "Course added to applied courses successfully";
            isApplied = true;
        } else {
            // Remove from applied courses
            updatedUser = await UserDb.findByIdAndUpdate(
                userId,
                {
                    $pull: { appliedCourses: courseIdString },
                    // :white_check_mark: No need to manually set updatedAt since timestamps: true handles it
                },
                { new: true }
            );
            console.log(":x: Course removed:", {
                courseId: courseIdString,
                newAppliedCourses: updatedUser.appliedCourses,
            }); // Debug log
            message = "Course removed from applied courses successfully";
            isApplied = false;
        }
        res.json({
            success: true,
            message,
            data: {
                appliedCourses: updatedUser.appliedCourses || [],
                isApplied,
                totalAppliedCourses: updatedUser.appliedCourses
                    ? updatedUser.appliedCourses.length
                    : 0,
                courseId: courseIdString, // :white_check_mark: Return the courseId for confirmation
            },
        });
    } catch (error) {
        console.error(":x: Error toggling applied courses:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});
// :white_check_mark: GET route to check if a specific course is applied
router.get("/check/:courseId", authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id || req.userId;
        const user = await UserDb.findById(userId).select("appliedCourses");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const isApplied =
            user.appliedCourses && user.appliedCourses.includes(courseId);
        res.json({
            success: true,
            data: {
                isApplied,
                courseId,
                totalAppliedCourses: user.appliedCourses
                    ? user.appliedCourses.length
                    : 0,
            },
        });
    } catch (error) {
        console.error(":x: Error checking course application status:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
// :white_check_mark: GET route to get just the applied course IDs (lightweight)
router.get("/ids", authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const user = await UserDb.findById(userId).select("appliedCourses");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.json({
            success: true,
            message: "Applied course IDs fetched successfully",
            data: {
                appliedCourseIds: user.appliedCourses || [],
                totalAppliedCourses: user.appliedCourses
                    ? user.appliedCourses.length
                    : 0,
            },
        });
    } catch (error) {
        console.error(":x: Error fetching applied course IDs:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
module.exports = router;
