// mongoose schema
const VideoSchema = require("../models/Video.schema");

// this controller handle all the logic required to maintain the dashboard renderings.
// It combines the logic of allController and searchController to work as a single unified endpoint
exports.dashboardController = async (req, res) => {
  try {
    //get the values of the query params if exist or init them to defaults
    const q = req.query.q; // the search query
    const search_cat = req.query.search_cat || "both"; // the DB fields to search for
    const perPage = Number(req.query.perPage) || 5; // no of docs to return per page
    const sort_cat = req.query.sort_cat || "date"; // the DB field to sort by
    const sort_order = Number(req.query.sort_order) || -1; // the order of sorting
    const pageNo = Number(req.query.pageNo) || 1; // the page number for paginated response. Starts with 1.
    const offset = Number(req.query.offset) || 0; // to offset a certain number of docs

    // throw error if perPage exceed 50
    if (perPage > 50) throw new Error("Max Value of perPage is 50");

    // the mongo aggregation query builder array
    const query = [];

    /**
     * --------THE DB QUERY LOGIC----------
     * 1. SEARCHING-
     *    If search string exist, then add the search query to the query array,
     *    and use MONGO ATLAS SEARCH for fuzzy matching
     *    based on the specific field specified in the query OR 'both' the field
     *
     * 2. SORTING-
     *    Sort the documents using the sorting field and sorting order
     *
     * 3. PAGINATION-
     *    Find the number of documents to skip from the start based on the page number, limit and offset.
     *    Skip the calulated number from start and limit the result based on user set limit
     *
     * 4. PROJECTION-
     *    Set the projection fields so that the DB sends only required fields.
     */

    //if search string exist then add the search query to the query array
    q
      ? query.push({
          $search: {
            index: "default", // using custom search-index created using MONGODB ATLAS SEARCH
            text: {
              query: q,
              path:
                search_cat === "both"
                  ? {
                      wildcard: "*",
                    }
                  : search_cat,
            },
          },
        })
      : {};

    // add sorting field and sorting order to the query array
    if (sort_cat === "date") query.push({ $sort: { publishedAt: sort_order } });
    else if (sort_cat === "title") query.push({ $sort: { title: sort_order } });
    else if (sort_cat === "description")
      query.push({ $sort: { description: sort_order } });

    // add number of documents to skip from start to the query array
    query.push({ $skip: (pageNo - 1) * perPage + offset });

    // add number of documents per page to the query array
    query.push({ $limit: perPage });

    // add projection fields to the query array
    query.push({
      $project: { title: 1, description: 1, publishedAt: 1, _id: 0 },
    });

    // make the DB request using mongodb aggregation pipeline and query array and store the result
    const data = await VideoSchema.aggregate(query);

    // render the dashboard using data and EJS
    res.render("index", { data });
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

// PART 2 of BASIC REQUIREMENTS : A GET API which returns the stored video data in a paginated response sorted in descending order of published datetime.
exports.allController = async (req, res) => {
  try {
    //get the values of the query params if exist or init them to defaults
    const _pageNo = Number(req.query.pageNo) || 1; // the page number for paginated response. Starts with 1.
    const _offset = Number(req.query.offset) || 0; // to offset a certain number of docs
    const limit = Number(req.query.limit) || 5; // no of docs to return per page

    const skip = (_pageNo - 1) * limit + _offset; // calculate the number of document to skip from start

    // throw error if limit exceed 50
    if (limit > 50) throw new Error("max value of limit is 50");

    // Perform a DB find operation.
    // Select all data -> sort them in decending order of publishing date -> Skip some documents from start -> get the next limited number of documents
    const data = await VideoSchema.find(
      {},
      { title: 1, description: 1, publishedAt: 1, _id: 0 } // projection
    )
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.send(data);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

// PART 3 of BASIC REQUIREMENTS : A basic search API to search the stored videos using their title and description.
exports.searchController = async (req, res) => {
  try {
    //get the values of the query params if exist or init them to defaults
    const q = req.query.q; // the search query
    const search_cat = req.query.search_cat || "both"; // the DB fields to search for

    // the mongo aggregation query builder array
    const query = [];

    //if search string exist then add the search query to the query array
    q
      ? query.push({
          $search: {
            index: "default", // using custom search-index created using MONGODB ATLAS SEARCH
            text: {
              query: q,
              path:
                search_cat === "both"
                  ? {
                      wildcard: "*",
                    }
                  : search_cat,
            },
          },
        })
      : {};

    query.push({ $limit: 100 }); // set a default limit of 100

    // add projection fields to the query array
    query.push({
      $project: { title: 1, description: 1, publishedAt: 1, _id: 0 },
    });

    // make the DB request using mongodb aggregation pipeline and query array and store the result
    const data = await VideoSchema.aggregate(query);

    res.send(data);
  } catch (err) {
    console.log(err);
    res.send("err");
  }
};
