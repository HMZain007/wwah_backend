// Add this to your existing universities route or create a new one
const express = require("express");
const router = express.Router();
const universtyDB = require("../database/models/universtyDB"); // Adjust path as needed

// Existing route for getting all universities with pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, search, country, ids } = req.query;

    let query = {};

    // If IDs are provided, fetch specific universities
    if (ids) {
      const universityIds = ids.split(",").filter((id) => id.length > 0);

      if (universityIds.length === 0) {
        return res.status(200).json({
          success: true,
          universities: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: parseInt(page),
        });
      }

      try {
        const universities = await universtyDB
          .find({
            _id: { $in: universityIds },
          })
          .select(
            "university_name country_name university_type qs_world_university_ranking acceptance_rate universityImages"
          );

        return res.status(200).json({
          success: true,
          universities,
          totalCount: universities.length,
          totalPages: 1,
          currentPage: 1,
        });
      } catch (error) {
        console.error("Error fetching universities by IDs:", error);
        return res.status(500).json({
          success: false,
          message: "Error fetching universities",
          error: error.message,
        });
      }
    }

    // Regular search and filter logic for all universities
    if (search) {
      query.$or = [
        { university_name: { $regex: search, $options: "i" } },
        { country_name: { $regex: search, $options: "i" } },
      ];
    }

    if (country && Array.isArray(country) && country.length > 0) {
      query.country_name = { $in: country };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [universities, totalCount] = await Promise.all([
      universtyDB.find(query)
        .select(
          "university_name country_name university_type qs_world_university_ranking acceptance_rate universityImages"
        )
        .skip(skip)
        .limit(parseInt(limit)),
      universtyDB.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      universities,
      totalCount,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching universities",
      error: error.message,
    });
  }
});

module.exports = router;
