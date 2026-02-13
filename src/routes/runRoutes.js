const Run = require("../model/run");
const protect = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

router.post("/add", protect, async (req, res) => {
  try {
    const { distance, duration, date } = req.body;  
    if (!distance || !duration) {
      return res.status(400).json({ message: "Distance and duration are required" });
    }   
    const pace = duration / distance; // min/km
    const newRun = await Run.create({
      user: req.user._id,       
        distance,
        duration,
        pace,
        date: date || Date.now()
    });
    // const save =await run.save()
    res.status(201).json(newRun);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } 
});

router.get("/", protect, async (req, res) => {
  const runs = await Run.find({ user: req.user._id })
                        .sort({ date: -1 });

  res.json(runs);
});
router.get("/stats", protect, async (req, res) => {
  try {
    const runs = await Run.find({ user: req.user._id });

    if (runs.length === 0) {
      return res.json({
        totalRuns: 0,
        totalDistance: 0,
        totalDuration: 0,
        averagePace: 0,
        longestRun: 0
      });
    }

    const totalRuns = runs.length;

    const totalDistance = runs.reduce(
      (acc, run) => acc + run.distance,
      0
    );

    const totalDuration = runs.reduce(
      (acc, run) => acc + run.duration,
      0
    );

    const averagePace = totalDuration / totalDistance;

    const longestRun = Math.max(
      ...runs.map(run => run.distance)
    );

    res.json({
      totalRuns,
      totalDistance,
      totalDuration,
      averagePace,
      longestRun
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", protect, async (req, res) => {
  const run = await Run.findById(req.params.id);

  if (!run) {
    return res.status(404).json({ message: "Run not found" });
  }

  if (run.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await run.deleteOne();

  res.json({ message: "Run removed" });
});
router.put("/:id", protect, async (req, res) => {
  try {
    const { distance, duration, date } = req.body;

    const run = await Run.findById(req.params.id);

    if (!run) {
      return res.status(404).json({ message: "Run not found" });
    }

    // Ownership check
    if (run.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update fields only if provided
    if (distance) run.distance = distance;
    if (duration) run.duration = duration;
    if (date) run.date = date;

    // Recalculate pace if distance or duration changed
    if (distance || duration) {
      run.pace = run.duration / run.distance;
    }

    const updatedRun = await run.save();

    res.json(updatedRun);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;