// The workshop <-> service relationship is stored two ways in the real data,
// and either one may be the one that's actually populated for a given
// document, so both are checked:
//   - Workshop.services: [ServiceId]   (ObjectId ref array, on the workshop)
//   - Service.availableAt: [String]    (workshop *names*, on the service)
//
// See backend/models/workshop.model.js and backend/models/service.model.js.

const idsOf = (workshop) =>
  (workshop?.services || []).map((s) => String(typeof s === "string" ? s : s?._id));

const namesOf = (service) =>
  (service?.availableAt || []).map((name) => String(name).trim().toLowerCase());

// True if `service` is offered at `workshop`.
const isServiceAtWorkshop = (service, workshop) => {
  if (!service || !workshop) return false;

  const serviceId = String(service._id || service.id || service);
  if (idsOf(workshop).includes(serviceId)) return true;

  const workshopName = (workshop.name || "").trim().toLowerCase();
  return Boolean(workshopName) && namesOf(service).includes(workshopName);
};

// All services (from the full catalog) offered at `workshop`.
const servicesAtWorkshop = (allServices, workshop) =>
  (allServices || []).filter((service) => isServiceAtWorkshop(service, workshop));

// All workshops (from the full list) offering `service`.
const workshopsForService = (allWorkshops, service) =>
  (allWorkshops || []).filter((workshop) => isServiceAtWorkshop(service, workshop));

export { isServiceAtWorkshop, servicesAtWorkshop, workshopsForService };