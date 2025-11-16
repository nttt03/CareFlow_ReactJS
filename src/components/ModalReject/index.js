import React, { useState } from "react";
import { Spin, Modal, Input, Form } from "antd";
import { useSelector } from "react-redux";

export default function ModalReject({ isOpenCancelModal, onCancel, onSubmit }) {
  const language = useSelector((state) => state.app.language);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!cancelReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(cancelReason);
      setCancelReason("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      onCancel();
    }
  };

  return (
    <Modal
      title={
        <span style={{ color: "red" }}>
          {language === "vi"
            ? "Xác nhận hủy lịch hẹn"
            : "Confirm Appointment Cancellation"}
        </span>
      }
      open={isOpenCancelModal}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
    >
      <Form layout="vertical">
        <Form.Item
          label={language === "vi" ? "Lý do hủy lịch" : "Cancellation Reason"}
          required
          tooltip={language === "vi" ? "Bắt buộc nhập" : "Required"}
        >
          <Input.TextArea
            rows={4}
            placeholder={
              userInfo?.roleId !== "R3"
                ? language === "vi"
                  ? "Ví dụ: Bệnh nhân không đến, lịch trùng, yêu cầu hủy..."
                  : "E.g., Patient no-show, schedule conflict, patient request..."
                : "..."
            }
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={isSubmitting}
          />
        </Form.Item>

        <div className="text-right">
          <button
            className="mp-btn-cancel border-0 rounded-2 px-3 py-1"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ marginRight: 8 }}
          >
            {language === "vi" ? "Đóng" : "Close"}
          </button>
          <button
            className="mp-btn-confirm border-0 rounded-2 px-3 py-1 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting || !cancelReason.trim()}
            style={{
              background: "red",
              borderColor: "#d4380d",
              opacity: isSubmitting || !cancelReason.trim() ? 0.6 : 1,
            }}
          >
            {isSubmitting ? (
              <Spin size="small" />
            ) : language === "vi" ? (
              "Xác nhận hủy"
            ) : (
              "Confirm Cancel"
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
}
