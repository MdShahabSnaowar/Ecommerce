const express = require("express");
const {
  createPlan,
  getPlans,
  deletePlan,
} = require("../controllers/createPlan");
const authAdmin = require("../middleware/authAdmin");
const { updatePlan } = require("../controllers/plan.controller");
const router = express.Router();
router.post("/create", authAdmin,createPlan); // POST /plans
router.get("/all", getPlans); // GET /plans
router.delete("/:id", authAdmin,deletePlan); // DELETE /api/plans/:id
router.put("/:id", authAdmin,updatePlan); // PUT /api/plans/:id

module.exports = router;
