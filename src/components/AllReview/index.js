import React, { useState, useEffect } from "react";
import { Rate, Avatar, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { getAllReview } from "../../services/userService";
import { useSelector } from "react-redux";
import { formatDate } from "../../utils/dateFormatter";
import { Buffer } from "buffer";

import "swiper/css";
import "swiper/css/pagination";
import "./index.scss";

const AllReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const language = useSelector((state) => state.app.language);

  const fetchAllReview = async () => {
    try {
      setLoading(true);
      const res = await getAllReview();
      if (res && res.errCode === 0) {
        setReviews(res.data);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllReview();
  }, []);

  if (loading) {
    return (
      <div className="review-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="review-section">
      <h2 className="review-title">
        {language === "vi" ? "Đánh giá từ bệnh nhân" : "Patients' Reviews"}
      </h2>

      <Swiper
        slidesPerView={3}
        spaceBetween={20}
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay]}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="review-swiper"
      >
        {reviews?.map((item, index) => {
          const patient = item?.patient;
          const doctor = item?.doctor;

          const patientName = item?.isAnonymous
            ? language === "vi"
              ? "Ẩn danh"
              : "Anonymous"
            : patient?.fullName;

          let imageBase64 = null;
          if (patient?.avatar) {
            imageBase64 = Buffer.from(patient?.avatar, "base64").toString(
              "binary"
            );
          }

          return (
            <SwiperSlide key={index}>
              <div className="review-card">
                <div className="review-header">
                  <img
                    src={
                      item?.isAnonymous
                        ? "/defaultImg.png"
                        : imageBase64 || "/defaultImg.png"
                    }
                    alt="avatar"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #ccc",
                    }}
                  />
                  <div className="review-info">
                    <span className="review-name">{patientName}</span>
                    <Rate disabled allowHalf value={Number(item.rating)} />
                  </div>
                </div>

                <p className="review-comment">"{item.comment}"</p>

                <div className="review-doctor">
                  <UserOutlined /> {doctor?.fullName}{" "}
                  <span className="role">
                    (
                    {language === "vi"
                      ? doctor?.positionData?.valueVi
                      : doctor?.positionData?.valueEn}
                    )
                  </span>
                </div>

                <div className="review-date">
                  {language === "vi" ? "Ngày đánh giá:" : "Date review:"}{" "}
                  {formatDate(item?.createdAt)}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default AllReview;
