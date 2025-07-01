const planSchema = require("../models/planSchema");

// @desc Create a new plan
exports.createPlan = async (req, res) => {
  try {
    const { name, price, durationInDays, benefits } = req.body;

    const plan = await planSchema.create({
      name,
      price,
      durationInDays,
      benefits,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get all plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await planSchema.find();
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const updates = req.body;

    const updatedPlan = await planSchema.findByIdAndUpdate(planId, updates, {
      new: true,
    });

    if (!updatedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, data: updatedPlan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    const deletedPlan = await planSchema.findByIdAndDelete(planId);

    if (!deletedPlan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
