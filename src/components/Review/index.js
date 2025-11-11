import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Modal,
  Card,
  Rate,
  Input,
  Button,
  Tag,
  Avatar,
  message,
  Spin,
} from "antd";
import {
  ClockCircleOutlined,
  HomeOutlined,
  StarOutlined,
  UserOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  getAppointmentNeedReview,
  reviewDoctor,
} from "../../services/userService";

const { TextArea } = Input;

const Review = ({ visible, onClose, userId, socketBooking }) => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const language = useSelector((state) => state.app.language);

  const currentApt = appointments[currentPage - 1];

  const text = {
    title: language === "vi" ? "Đánh giá bác sĩ" : "Rate the doctor",
    toReview:
      language === "vi"
        ? `Có ${appointments.length} lịch hẹn cần đánh giá`
        : `${appointments.length} appointments to review`,
    reviewed: language === "vi" ? "Đã khám" : "Completed",
    time: language === "vi" ? "Thời gian" : "Time",
    hospital: language === "vi" ? "Bệnh viện" : "Hospital",
    rateLabel: language === "vi" ? "Đánh giá:" : "Your rating:",
    placeholder:
      language === "vi"
        ? "Chia sẻ trải nghiệm của bạn tại đây nhé..."
        : "Share your experience here...",
    submit: language === "vi" ? "Gửi đánh giá" : "Submit review",
    prev: language === "vi" ? "Trước" : "Previous",
    next: language === "vi" ? "Sau" : "Next",
    thank:
      language === "vi"
        ? "Cảm ơn đánh giá của bạn!"
        : "Thanks for your review!",
    already:
      language === "vi"
        ? "Bạn đã đánh giá lịch hẹn này rồi!"
        : "You have already rated this appointment!",
    error: language === "vi" ? "Lỗi gửi đánh giá" : "Submit failed",
    loadingError:
      language === "vi"
        ? "Lỗi tải lịch hẹn đánh giá"
        : "Failed to load review list",
  };

  useEffect(() => {
    if (socketBooking) {
      setAppointments((prev) => [socketBooking, ...prev]);
      setCurrentPage(1);
    }
  }, [socketBooking]);

  useEffect(() => {
    if (!visible || !userId) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await getAppointmentNeedReview(userId);
        if (res?.errCode === 0 && res.dataAppointments?.length > 0) {
          setAppointments(res.dataAppointments);
          setCurrentPage(1);
        } else {
          onClose();
        }
      } catch (err) {
        console.error(text.loadingError);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [visible, userId]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      const res = await reviewDoctor(currentApt.id, rating, comment, false);
      if (res.errCode === 0) {
        message.success(text.thank);
        const newAppointments = appointments.filter(
          (_, i) => i !== currentPage - 1
        );
        setAppointments(newAppointments);
        setRating(0);
        setComment("");
        setCurrentPage(1);
        if (newAppointments.length === 0) onClose();
      } else if (res.errCode === 5) {
        message.info(text.already);
      } else {
        message.error(res.errMessage);
      }
    } catch (err) {
      message.error(text.error);
    }
  };

  const formatDate = (ts) =>
    new Date(parseInt(ts)).toLocaleDateString(
      language === "vi" ? "vi-VN" : "en-US",
      {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  if (!visible || appointments.length === 0) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      maskClosable={true}
      closeIcon={
        <Button
          type="text"
          icon={<CloseOutlined style={{ fontSize: 18, color: "#999" }} />}
          style={{ border: "none", background: "transparent" }}
          onClick={onClose}
        />
      }
    >
      <div className="review-modal">
        <h3 className="text-primary">
          <StarOutlined className="text-primary" /> {text.title}
        </h3>
        <p className="text-danger fw-bold">{text.toReview}</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : (
          <>
            <Card
              className="border-0"
              size="small"
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar className="bg-primary" icon={<UserOutlined />} />
                  <div>
                    <strong>{currentApt.infoDataDoctor?.fullName}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {language === "vi"
                        ? currentApt.infoDataDoctor?.positionData?.valueVi
                        : currentApt.infoDataDoctor?.positionData?.valueEn}
                    </div>
                  </div>
                </div>
              }
              extra={<Tag color="green">{text.reviewed}</Tag>}
            >
              <div style={{ margin: "12px 0", fontSize: 14 }}>
                <div>
                  <ClockCircleOutlined className="text-primary" />{" "}
                  <strong className="text-primary">{text.time}:</strong>{" "}
                  {formatDate(currentApt.date)} -{" "}
                  {currentApt.timeTypeDataPatient?.valueVi}
                </div>
                <div>
                  <HomeOutlined className="text-primary" />{" "}
                  <strong className="text-primary">{text.hospital}:</strong>{" "}
                  {currentApt.doctorInfoData?.hospital?.name}
                </div>
              </div>

              <p>
                <strong>{text.rateLabel}</strong>
              </p>
              <Rate
                allowHalf
                value={rating}
                onChange={setRating}
                style={{ fontSize: 28 }}
              />
              <TextArea
                rows={2}
                placeholder={text.placeholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ margin: "12px 0" }}
              />
              <div style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  disabled={rating === 0}
                >
                  {text.submit}
                </Button>
              </div>
            </Card>

            {appointments.length > 1 && (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Button
                  className="border-0"
                  size="small"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <LeftOutlined />
                </Button>
                <span style={{ margin: "0 12px" }}>
                  {currentPage} / {appointments.length}
                </span>
                <Button
                  className="border-0"
                  size="small"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(appointments.length, p + 1))
                  }
                  disabled={currentPage === appointments.length}
                >
                  <RightOutlined />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default Review;
