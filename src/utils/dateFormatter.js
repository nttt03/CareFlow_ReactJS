// src/utils/dateFormatter.js
import moment from "moment";
import "moment/locale/vi"; // dùng tiếng Việt cho format

/**
 * Format ngày tháng dùng moment.js
 * @param {string|number|Date|null} value - Dữ liệu ngày (timestamp, ISO string, Date,...)
 * @param {string} format - Định dạng đầu ra (mặc định: 'DD/MM/YYYY')
 * @returns {string} - Ngày đã format hoặc 'Không có dữ liệu' / 'Không hợp lệ'
 */
export const formatDate = (value, format = "DD/MM/YYYY") => {
  if (!value) return "Không có dữ liệu";

  // Nếu là chuỗi số timestamp, convert sang number
  const date = /^\d+$/.test(value) ? moment(Number(value)) : moment(value);

  if (!date.isValid()) return "Không hợp lệ";

  return date.locale("vi").format(format);
};

/**
 * Format ngày + giờ (HH:mm)
 */
export const formatDateTime = (value) => formatDate(value, "DD/MM/YYYY HH:mm");

/**
 * Format giờ (HH:mm)
 */
export const formatTime = (value) => formatDate(value, "HH:mm");
