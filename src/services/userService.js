import axios from "../axios";

// const handleLoginApi = (userEmail, userPassword) => {
//   return axios.post("/api/login", { email: userEmail, password: userPassword });
// };

const handleLoginApi = (userEmail, userPassword) => {
  return axios.post(
    "/api/login",
    { email: userEmail, password: userPassword },
    { withCredentials: true }
  );
};

const registerNewUser = ({ ...formData }) => {
  return axios.post("/api/register", {
    ...formData,
  });
};

const getAllUsers = (inputId) => {
  return axios.get(`/api/get-all-users?id=${inputId}`);
};

const createNewUserService = (data) => {
  return axios.post("/api/create-new-user", data);
};

const deleteUserService = (userId) => {
  // return axios.delete('/api/delete-user', {id: userId})
  return axios.delete("/api/delete-user", {
    data: {
      id: userId,
    },
  });
};

const editUserService = (inputData) => {
  return axios.put("/api/edit-user", inputData);
};

const getAllCodeService = (inputType) => {
  return axios.get(`/api/allcode?type=${inputType}`);
};

const getTopDoctorHomeService = (limit) => {
  return axios.get(`/api/top-doctor-home?limit=${limit}`);
};

const getAllDoctors = () => {
  return axios.get(`/api/get-all-doctor`);
};

const saveDetailDoctorService = (data) => {
  return axios.post(`/api/save-infor-doctor`, data);
};

const getDetailInforDoctor = (inputId) => {
  return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`);
};

const saveBulkScheduleDoctor = (data) => {
  return axios.post(`/api/bulk-create-schedule`, data);
};

const getScheduleDoctorByDate = (doctorId, date) => {
  return axios.get(
    `/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`
  );
};

const getExtraInforDoctorById = (doctorId) => {
  return axios.get(`/api/get-extra-infor-doctor-by-id?doctorId=${doctorId}`);
};

const getProfileDoctorById = (doctorId) => {
  return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`);
};

const postPatientBookingAppointment = (data) => {
  return axios.post(`/api/patient-book-appointment`, data);
};

const postVerifyBookAppointment = (data) => {
  return axios.post(`/api/verify-book-appointment`, data);
};

const createNewSpecialty = (data) => {
  return axios.post(`/api/create-new-specialty`, data);
};

const getAllSpecialty = (params) => {
  return axios.get(`/api/get-all-specialty`, { params });
};

const getAllDetailSpecialtyById = (data) => {
  return axios.get(
    `api/get-detail-specialty-by-id?id=${data.id}&location=${data.location}`
  );
};

const createNewHospital = (data) => {
  return axios.post(`/api/create-new-hospital`, data);
};

const getAllHospital = () => {
  return axios.get(`/api/get-all-hospital`);
};

const getAllDetailHospitalById = (data) => {
  return axios.get(`api/get-detail-hospital-by-id?id=${data.id}`);
};

const getAllPatientForDoctor = (data) => {
  return axios.get(
    `/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${
      data.date || ""
    }&status=${data.status}`
  );
};

export const getListMedicalRecord = (data) => {
  return axios.get(
    `/api/get-list-medical-record?date=${data.date || ""}&status=${data.status}`
  );
};

export const getWaitingApprovalForDoctor = (data) => {
  return axios.get(
    `/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&status=${data.status}`
  );
};

export const getWaitingApprovalForAdmin = (data) => {
  return axios.get(`/api/get-list-booking-approval?status=${data.status}`);
};

export const getWaitingApprovalForLeaderHospital = (data) => {
  return axios.get(
    `/api/get-list-booking-approval-for-leader?leaderId=${data.leaderId}&status=${data.status}`
  );
};

export const updateBookingStatus = (data) => {
  return axios.put("/api/update-booking-status", data);
};

const postSendRemedy = (data) => {
  return axios.post(`/api/send-remedy`, data);
};

const getNewAppointment = (patientId) => {
  return axios.get(`/api/get-new-appointment?patientId=${patientId}`);
};

const getDoneAppointment = (patientId) => {
  return axios.get(`/api/get-done-appointment?patientId=${patientId}`);
};

export const getViewAppointmentForNoti = (bookingId) => {
  return axios.get(`/api/get-appointment-for-noti?bookingId=${bookingId}`);
};

export const getAppointmentNeedReview = (patientId) => {
  return axios.get(`/api/get-appointment-need-review?patientId=${patientId}`);
};

export const getBookingsForCalendar = async (params) => {
  return axios.get(`/api/get-bookings-calendar`, { params });
};

// const getNewAppointment = (patientId) => {
//     return axios.get(`/api/get-new-appointment`, {
//         params: { patientId } // Axios sẽ tự động encode và thêm vào query string
//     });
// };

const getInfoUser = (patientId) => {
  return axios.get(`/api/get-info-user-by-id`, {
    params: { patientId },
    withCredentials: true,
  });
};

const updateInfoByUser = (data) => {
  return axios.put("/api/update-info-by-user", data, { withCredentials: true });
};

const getAllProvince = () => {
  return axios.get(`/api/allprovince`);
};

const changePassword = (data) => {
  return axios.post("/api/changepassword", data, { withCredentials: true });
};

export const getAllHospitalByAdmin = (params) => {
  return axios.get("/api/get-all-hospital-by-admin", { params });
};

export const getHospitalById = (id) => {
  return axios.get(`/api/get-detail-hospital-by-id?id=${id}`);
};

export const updateHospital = (data) => {
  return axios.put("/api/update-hospital-by-id", data);
};

export const getAllDetailSpecialty = (specialtyId) => {
  return axios.get(`api/get-detail-specialty?id=${specialtyId}`);
};

export const updateSpecialty = (data) => {
  return axios.put("/api/update-specialty-by-id", data);
};

export const deleteHospital = (id) => {
  return axios.delete("/api/delete-hospital-by-id", { data: { id } });
};

export const deleteSpecialty = (id) => {
  return axios.delete("/api/delete-specialty-by-id", { data: { id } });
};

export const saveSpecialtiesForHospital = (data) => {
  return axios.post("/hospital-specialties", data);
};

export const getSpecialtiesByHospital = (hospitalId) => {
  return axios.get(`/hospital-specialties/${hospitalId}`);
};

export const getAllDoctorConfig = () => {
  return axios.get(`/api/get-all-doctor-config`);
};

export const getAllLeaderHospitalConfig = () => {
  return axios.get(`/api/get-all-leader-hospital`);
};

export const getDoctorsByHospital = (hospitalId) => {
  return axios.get(`/hospital-doctors/${hospitalId}`);
};

export const saveDoctorsForHospital = (data) => {
  return axios.post("/hospital-doctors", data);
};

export const saveLeaderForHospital = (data) => {
  return axios.post("/hospital-leader", data);
};

export const savePriceForHospital = (data) => {
  return axios.post("/save-price-hospital", data);
};

export const getNotifications = (userId, roleId) => {
  return axios.get(`/api/notifications`, {
    params: { userId, roleId },
  });
};

export const markAsRead = (notificationId) => {
  return axios.put(`/api/notification/read`, { id: notificationId });
};

export const toggleFavorite = (userId, hospitalId, doctorId) => {
  return axios.post(`/api/toggle-favorite`, {
    userId,
    hospitalId,
    doctorId,
  });
};

export const getFavorites = (userId) => {
  return axios.get(`/api/get-favorites`, { params: { userId } });
};

// export const postMedicalRecord = (formData) => {
//   return axios.post(`api/create-medical-record`, formData);
// };
export const postMedicalRecord = (formData) => {
  return axios.post("api/create-medical-record", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteMedicalRecord = (medicalRecordId) => {
  return axios.delete("/api/delete-medical-record", {
    data: {
      id: medicalRecordId,
    },
  });
};

export const getDoctorStatistics = (doctorId) => {
  return axios.get(`/api/doctor/${doctorId}/statistics`);
};

export const getHospitalStatistics = (hospitalId) => {
  return axios.get(`/api/hospital/${hospitalId}/statistics`);
};

export const getAdminStatistics = () => {
  return axios.get(`/api/admin/statistics`);
};

export const postForgotPassword = (email) => {
  return axios.post(`/api/forgot-password`, { email });
};

export const postResetPassword = (token, newPassword) => {
  return axios.post(`/api/reset-password`, { token, newPassword });
};

export const searchAll = ({ keyword, provinceId }) => {
  return axios.get(`/api/search`, {
    params: {
      keyword,
      provinceId,
    },
  });
};

export const reviewDoctor = (
  bookingId,
  rating,
  comment,
  isAnonymous = false
) => {
  return axios.post(
    "/api/review-doctor",
    { bookingId, rating, comment, isAnonymous },
    { withCredentials: true }
  );
};

export const chatWithDatabase = async (message, history, patientId) => {
  return await axios.post("/api/chat-with-db", {
    message,
    history,
    patientId,
  });
};

export const getAllReview = () => {
  return axios.get(`/api/reviews`);
};

export {
  handleLoginApi,
  registerNewUser,
  getAllUsers,
  createNewUserService,
  deleteUserService,
  editUserService,
  getAllCodeService,
  getTopDoctorHomeService,
  getAllDoctors,
  saveDetailDoctorService,
  getDetailInforDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  getExtraInforDoctorById,
  getProfileDoctorById,
  postPatientBookingAppointment,
  postVerifyBookAppointment,
  createNewSpecialty,
  getAllSpecialty,
  getAllDetailSpecialtyById,
  createNewHospital,
  getAllHospital,
  getAllDetailHospitalById,
  getAllPatientForDoctor,
  postSendRemedy,
  getNewAppointment,
  getDoneAppointment,
  getInfoUser,
  getAllProvince,
  updateInfoByUser,
  changePassword,
};
