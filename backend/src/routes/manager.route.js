import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import uploadImage from "../middlewares/upload.middleware.js";
import {getMyWorkshop,addServiceToWorkshop,removeServiceFromWorkshop,addEmployee,removeEmployee,listInventory,createInventory,updateInventory,deleteInventory,assignManager} from "../controllers/manager.controller.js";
import {getMyNotifications,markNotificationRead,markAllNotificationsRead} from "../controllers/notification.controller.js";
const router=express.Router();
router.use(authMiddleware);
router.get("/me",authorize("WORKSHOP_MANAGER"),getMyWorkshop);
router.post("/services",authorize("WORKSHOP_MANAGER"),addServiceToWorkshop);
router.delete("/services/:serviceId",authorize("WORKSHOP_MANAGER"),removeServiceFromWorkshop);
router.post("/employees",authorize("WORKSHOP_MANAGER"),uploadImage.single("profilePhoto"),addEmployee);
router.delete("/employees/:employeeId",authorize("WORKSHOP_MANAGER"),removeEmployee);
router.get("/inventory",authorize("WORKSHOP_MANAGER"),listInventory);
router.post("/inventory",authorize("WORKSHOP_MANAGER"),createInventory);
router.patch("/inventory/:id",authorize("WORKSHOP_MANAGER"),updateInventory);
router.delete("/inventory/:id",authorize("WORKSHOP_MANAGER"),deleteInventory);
router.patch("/admin/workshops/:workshopId/manager",authorize("ADMIN"),assignManager);

// Feature 3: new-appointment notifications for the manager's own workshop.
router.get("/notifications",authorize("WORKSHOP_MANAGER"),getMyNotifications);
router.patch("/notifications/:id/read",authorize("WORKSHOP_MANAGER"),markNotificationRead);
router.patch("/notifications/read-all",authorize("WORKSHOP_MANAGER"),markAllNotificationsRead);
export default router;
