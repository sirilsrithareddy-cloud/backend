const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { auth } = require("../utils/auth");
const projectController = require("../controllers/projectController");

// GET /api/projects
router.get("/", projectController.listProjects);

// GET /api/projects/:id
router.get("/:id", projectController.getProjectById);

// POST /api/projects (multipart) - requires auth
router.post("/", auth, upload.array("files"), projectController.createProject);

// POST /api/projects/:id/rate - requires auth
router.post("/:id/rate", auth, projectController.rateProject);

module.exports = router;
