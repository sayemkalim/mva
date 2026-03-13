import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

/* ───────────── helper function for export ───────────── */

const postExport = async (endpoint, filters) => {
  try {
    const apiResponse = await apiService({
      endpoint,
      method: "POST",
      data: filters,
      headers: { "Content-Type": "application/json" },
      responseType: "blob",
    });
    return apiResponse;
  } catch (error) {
    console.error(`Error exporting (${endpoint}):`, error);
    throw error;
  }
};

const getMeta = async (endpoint) => {
  try {
    const apiResponse = await apiService({
      endpoint,
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return apiResponse;
  } catch (error) {
    console.error(`Error fetching metadata (${endpoint}):`, error);
    throw error;
  }
};

/* ───────────── export functions ───────────── */

export const exportOpposingCounsel = (filters) =>
  postExport(endpoints.opposingCounselExport, filters);

export const exportAdjustersOnFiles = (filters) =>
  postExport(endpoints.adjustersOnFilesExport, filters);

export const exportVsr = (filters) => postExport(endpoints.vsrExport, filters);

export const exportMvaCases = (filters) =>
  postExport(endpoints.mvaCasesExport, filters);

export const exportVehicleOwnershipInfo = (filters) =>
  postExport(endpoints.vehicleOwnershipInfo, filters);

export const exportPoliceStations = (filters) =>
  postExport(endpoints.policeStationsExport, filters);

export const exportListOfFiles = (filters) =>
  postExport(endpoints.listOfFile, filters);

export const exportLatFiles = (filters) =>
  postExport(endpoints.latFilesExport, filters);

export const exportS33Request = (filters) =>
  postExport(endpoints.s33RequestExport, filters);

export const exportS258Request = (filters) =>
  postExport(endpoints.s258RequestExport, filters);

export const exportApplicantInfo = (filters) =>
  postExport(endpoints.exportApplicantInfo, filters);

export const exportFileAssignedInfo = (filters) =>
  postExport(endpoints.fileAssignedInfo, filters);

export const exportApplicantContactInfo = (filters) =>
  postExport(endpoints.applicantContactInfo, filters);

export const exportApplicantAccidentDetail = (filters) =>
  postExport(endpoints.applicantAccidentDetail, filters);

/* ───────────── meta functions ───────────── */

export const getVsrMeta = () => getMeta(endpoints.vsrMeta);

export const getVehicleOwnershipMeta = () =>
  getMeta(endpoints.vehicleOwnershipMeta);

export const getMvaCasesByMedicalCentreMeta = () =>
  getMeta(endpoints.mvaCasesByMedicalCentreMeta);

export const getPoliceStationsMeta = () =>
  getMeta(endpoints.policeStationsMeta);

export const getExportMetadata = () => getMeta(endpoints.exportApplicantMeta);

export const getFileAssignedMetadata = () =>
  getMeta(endpoints.fileAssignedInfoMeta);
