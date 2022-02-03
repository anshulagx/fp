const express = require("express");

const router = express.Router();
const {
  searchController,
  allController,
  dashboardController,
  apiController,
} = require("../controllers/searchController");
/**
 * @swagger
 * /api/getAll:
 *     get:
 *         summary: Retrieve all the videos in a paginated response.[made for PART 2 of BASIC REQUIREMENTS]
 *         parameters:
 *             - in: query
 *               name: limit
 *               type: integer
 *               description: max number of tweets to return. Default is 5.
 *             - in: query
 *               name: offset
 *               type: integer
 *               description: number of tweets to offset the results by. Default is 0.
 *             - in: query
 *               name: pageNo
 *               type: integer
 *               description: can be used with limit to get a paginated response
 *         responses:
 *             200:
 *                 description: A paginated list of videos
 */
router.get("/api/getAll", allController);

/**
 * @swagger
 * /api/search:
 *     get:
 *         summary: Retrieve all the videos whose title or description match the search query.[made for PART 3 of BASIC REQUIREMENTS]
 *         parameters:
 *             - in: query
 *               name: q
 *               type: string
 *               description: The search query
 *             - in: query
 *               name: search_cat
 *               type: string
 *               enum: [both,title,description]
 *               description: The search field
 *               default: both
 *
 *         responses:
 *             200:
 *                 description: A list of videos matching the search query
 */
router.get("/api/search", searchController);

/**
 * @swagger
 * /api:
 *     get:
 *         summary: Retrive videos based on a variety of filters and sorting options
 *         parameters:
 *             - in: query
 *               name: q
 *               type: string
 *               description: The search query
 *             - in: query
 *               name: search_cat
 *               type: string
 *               enum: [both,title,description]
 *               description: The search field
 *               default: both
 *             - in: query
 *               name: sort_cat
 *               type: string
 *               enum: [title,date,description]
 *               description: The field to sort by
 *               default: date
 *             - in: query
 *               name: sort_order
 *               type: integer
 *               enum: [1,-1]
 *               description: set 1 for ascending sorting,-1 for descending
 *               default: -1
 *             - in: query
 *               name: perPage
 *               type: integer
 *               description: max number of tweets to return. Default is 5.
 *             - in: query
 *               name: offset
 *               type: integer
 *               description: number of tweets to offset the results by. Default is 0.
 *             - in: query
 *               name: pageNo
 *               type: integer
 *               description: can be used with limit to get a paginated response
 *         responses:
 *             200:
 *                 description: A list of videos matching the search query
 */
router.get("/api", apiController);

// The root route handles the dashboard UI
router.get("/", dashboardController);

module.exports = router;
