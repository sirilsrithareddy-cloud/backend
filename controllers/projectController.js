const path = require("path");
const Project = require("../models/Project");

async function listProjects(req, res) {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json(project);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function createProject(req, res) {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const files = (req.files || []).map((f) => ({
      url: `/uploads/${path.basename(f.path)}`,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    }));

    const doc = await Project.create({
      title,
      description,
      owner: req.user?.id,
      files,
    });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

async function rateProject(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const score = Number(rating);
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Not found" });

    // Replace existing user rating if present, else push
    const userId = req.user?.id;
    if (userId) {
      const idx = project.ratings.findIndex((r) => String(r.user) === String(userId));
      if (idx >= 0) project.ratings[idx].score = score;
      else project.ratings.push({ user: userId, score, comment });
    } else {
      project.ratings.push({ score, comment });
    }
    project.recomputeAvg();
    await project.save();
    return res.json({ avgRating: project.avgRating });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  rateProject,
};

