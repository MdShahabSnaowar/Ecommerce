const planSchema = require("../models/planSchema");

exports.createPlan = async (req, res) => {
  
  try {
    const plan = await planSchema.create(req.body);

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
      error: null,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create plan",
      data: null,
      error: err.message,
    });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await planSchema.find();

    res.json({
      success: true,
      message: "Plans fetched successfully",
      data: plans,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      data: null,
      error: err.message,
    });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await planSchema.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        data: null,
        error: null,
      });
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
      data: plan,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete plan",
      data: null,
      error: err.message,
    });
  }
};
