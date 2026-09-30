import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import sendResponse from "../helpers/response.js";
import Workshop from "../models/workshop.model.js";
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import Inventory from "../models/inventory.model.js";

const getManagedWorkshop=async(userId)=>{
  const workshop=await Workshop.findOne({manager:userId,isActive:true}).populate("services","name category startingPrice estimatedTime").populate("employees","firstName lastName email phone role profilePicture");
  if(!workshop) throw new ApiError(404,"You are not assigned as manager of an active workshop.");
  return workshop;
};

const getMyWorkshop=asyncHandler(async(req,res)=>sendResponse(res,200,"Workshop fetched successfully",await getManagedWorkshop(req.user._id)));

const addServiceToWorkshop=asyncHandler(async(req,res)=>{
  const {serviceId}=req.body; const w=await getManagedWorkshop(req.user._id);
  const s=await Service.findOne({_id:serviceId,isActive:true}); if(!s) throw new ApiError(404,"Service not found.");
  if(!w.services.some(item=>(item._id||item).toString()===serviceId)) w.services.push(serviceId);
  await w.save(); await Service.updateOne({_id:serviceId},{$addToSet:{availableAt:w._id}});
  return sendResponse(res,200,"Service added to workshop",w);
});

const removeServiceFromWorkshop=asyncHandler(async(req,res)=>{
  const w=await getManagedWorkshop(req.user._id);
  w.services=w.services.filter(item=>(item._id||item).toString()!==req.params.serviceId); await w.save();
  await Service.updateOne({_id:req.params.serviceId},{$pull:{availableAt:w._id}});
  return sendResponse(res,200,"Service removed from workshop",w);
});

const addEmployee=asyncHandler(async(req,res)=>{
 const {firstName,lastName,email,phone,role}=req.body;
 const w=await getManagedWorkshop(req.user._id);
 if(!["MECHANIC","SERVICE_ADVISOR"].includes(role)) throw new ApiError(400,"Only MECHANIC or SERVICE_ADVISOR can be added as workshop employees.");
 if(!firstName?.trim()||!lastName?.trim()||!email?.trim()||!phone?.trim()) throw new ApiError(400,"firstName, lastName, email and phone are required.");
 const employee=await User.findOne({email:email.trim().toLowerCase(),isBlocked:false});
 if(!employee) throw new ApiError(404,"No registered user was found with this email. Ask the person to create an account first.");
 if(["ADMIN","WORKSHOP_MANAGER"].includes(employee.role)) throw new ApiError(400,"This user cannot be assigned as a workshop employee.");
 if(employee.workshop && employee.workshop.toString()!==w._id.toString()) throw new ApiError(409,"Employee already belongs to another workshop.");
 employee.firstName=firstName.trim();
 employee.lastName=lastName.trim();
 employee.phone=phone.trim();
 employee.role=role;
 employee.workshop=w._id;
 if(req.file){
   const {uploadBufferToCloudinary,deleteFromCloudinary}=await import("../config/cloudinary.js");
   const result=await uploadBufferToCloudinary(req.file.buffer,{folder:"car-detailing/profiles"});
   await deleteFromCloudinary(employee.profilePicture?.publicId);
   employee.profilePicture={url:result.secure_url,publicId:result.public_id};
 }
 await employee.save();
 // "employees" is a virtual populate on Workshop (derived from User.workshop),
 // so nothing further needs to be persisted on the Workshop document itself.
 return sendResponse(res,200,"Employee added successfully",employee);
});

const removeEmployee=asyncHandler(async(req,res)=>{
  const w=await getManagedWorkshop(req.user._id);
  const employee=await User.findOne({_id:req.params.employeeId,workshop:w._id});
  if(!employee) throw new ApiError(404,"Employee not found in your workshop.");
  employee.workshop=null; await employee.save();
  return sendResponse(res,200,"Employee removed successfully",employee);
});

const listInventory=asyncHandler(async(req,res)=>{const w=await getManagedWorkshop(req.user._id); return sendResponse(res,200,"Inventory fetched successfully",await Inventory.find({workshop:w._id}).sort({name:1}));});
const createInventory=asyncHandler(async(req,res)=>{const w=await getManagedWorkshop(req.user._id); const item=await Inventory.create({...req.body,workshop:w._id}); return sendResponse(res,201,"Inventory item created",item);});
const updateInventory=asyncHandler(async(req,res)=>{const w=await getManagedWorkshop(req.user._id); const item=await Inventory.findOneAndUpdate({_id:req.params.id,workshop:w._id},{$set:req.body},{new:true,runValidators:true}); if(!item) throw new ApiError(404,"Inventory item not found in your workshop."); return sendResponse(res,200,"Inventory item updated",item);});
const deleteInventory=asyncHandler(async(req,res)=>{const w=await getManagedWorkshop(req.user._id); const item=await Inventory.findOneAndDelete({_id:req.params.id,workshop:w._id}); if(!item) throw new ApiError(404,"Inventory item not found in your workshop."); return sendResponse(res,200,"Inventory item removed");});

const assignManager=asyncHandler(async(req,res)=>{
 const {userId}=req.body; const w=await Workshop.findById(req.params.workshopId); if(!w) throw new ApiError(404,"Workshop not found.");
 const user=await User.findById(userId); if(!user) throw new ApiError(404,"User not found.");
 if(user.role!=="WORKSHOP_MANAGER") throw new ApiError(400,"User role must be WORKSHOP_MANAGER.");
 if(user.workshop && user.workshop.toString()!==w._id.toString()) throw new ApiError(409,"Manager is already assigned to another workshop.");
 if(w.manager && w.manager.toString()!==user._id.toString()){const old=await User.findById(w.manager); if(old){old.workshop=null; await old.save();}}
 w.manager=user._id; user.workshop=w._id; await Promise.all([w.save(),user.save()]);
 return sendResponse(res,200,"Workshop manager assigned",w);
});
export {getMyWorkshop,addServiceToWorkshop,removeServiceFromWorkshop,addEmployee,removeEmployee,listInventory,createInventory,updateInventory,deleteInventory,assignManager};
