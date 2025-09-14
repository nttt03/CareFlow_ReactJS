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

const getAllSpecialty = () => {
  return axios.get(`/api/get-all-specialty`);
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
    `/api/get-list-patient-for-doctor?doctorId=${data.doctorId}&date=${data.date}`
  );
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
