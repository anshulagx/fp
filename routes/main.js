const express = require("express");

const router = express.Router();
const {
  searchController,
  allController,
  dashboardController,
} = require("../controllers/searchController");
/**
 * @swagger
 * /api/all:
 *     get:
 *         summary: Retrieve all the videos in a paginated response.
 *         description: blah
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
router.get("/all", allController);

/**
 * @swagger
 * /api/search:
 *     get:
 *         summary: Retrieve all the videos whose title or description match the search query.
 *         description: blah
 *         parameters:
 *             - in: query
 *               name: q
 *               type: string
 *               description: The search query
 *         responses:
 *             200:
 *                 description: A list of videos matching the search query
 */
router.get("/search", searchController);

router.get("/dashboard", dashboardController);

module.exports = router;
