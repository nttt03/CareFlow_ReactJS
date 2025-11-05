import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { Card, Row, Col, Spin, Empty, Button, message, Tabs } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { fetchAllUserFavoriteStart } from "../../../../../store/actions";
import { toggleFavorite } from "../../../../../services/userService";
import { Buffer } from "buffer";
import { useHistory } from "react-router-dom";
import DoctorImg from "../../../../../assets/specialty/doctor.jpg";

const { TabPane } = Tabs;

const Favorites = ({ userInfo, allFavorites, fetchUserFavorite }) => {
  const [loading, setLoading] = useState(true);
  const [doctorFavorites, setDoctorFavorites] = useState([]);
  const [hospitalFavorites, setHospitalFavorites] = useState([]);
  const history = useHistory();
  const language = useSelector((state) => state.app.language);

  useEffect(() => {
    const loadFavorites = async () => {
      if (userInfo?.id) {
        await fetchUserFavorite(userInfo.id);
      }
      setLoading(false);
    };
    loadFavorites();
  }, [userInfo, fetchUserFavorite]);

  useEffect(() => {
    if (allFavorites && Array.isArray(allFavorites)) {
      setDoctorFavorites(allFavorites.filter((f) => f.doctor));
      setHospitalFavorites(allFavorites.filter((f) => f.hospital));
    }
  }, [allFavorites]);

  const handleRemoveFavorite = async (fav) => {
    try {
      const res = await toggleFavorite(
        userInfo.id,
        fav.hospitalId,
        fav.doctorId
      );
      if (res && res.errCode === 0) {
        message.success(
          language === "vi"
            ? "Đã xóa khỏi danh sách yêu thích 💔"
            : "Removed from favorites list 💔"
        );
        fetchUserFavorite(userInfo.id);
      }
    } catch (error) {
      console.error(error);
      message.error(
        language === "vi"
          ? "Lỗi khi xóa yêu thích!"
          : "Error deleting favorite!"
      );
    }
  };

  const handleViewDetail = (fav) => {
    if (fav.doctorId) {
      history.push(`/detail-doctor/${fav.doctorId}`);
    } else if (fav.hospitalId) {
      history.push(`/detail-hospital/${fav.hospitalId}`);
    }
  };

  const renderFavoriteList = (list, emptyLabel) => {
    if (list.length === 0)
      return (
        <Empty
          description={
            language === "vi"
              ? `Chưa có ${emptyLabel} yêu thích`
              : `No favorite ${emptyLabel} yet`
          }
        />
      );

    return (
      <Row gutter={[16, 16]}>
        {list.map((fav, index) => {
          const doctor = fav.doctor;
          const hospital = fav.hospital;
          const name = doctor ? doctor.fullName : hospital?.name;
          const subInfo = doctor
            ? doctor.phoneNumber || "Bác sĩ"
            : hospital?.addressDetail || "Bệnh viện / Phòng khám";
          let imgSrc = DoctorImg;
          if (doctor?.avatar) {
            imgSrc = Buffer.from(doctor.avatar, "base64").toString("binary");
          } else if (hospital?.image) {
            imgSrc = Buffer.from(hospital.image, "base64").toString("binary");
          }

          return (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                className="shadow-sm rounded-4 text-center w-100"
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "20px 16px",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: 0 }}
              >
                <div className="d-flex justify-content-center mb-3">
                  <img
                    alt={name}
                    src={imgSrc}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-1">{name}</h5>
                  <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                    {subInfo}
                  </p>
                </div>
                <div
                  className="d-flex justify-content-center gap-3 mt-auto pt-2 border-top"
                  style={{ borderColor: "#f0f0f0" }}
                >
                  <Button
                    type="primary"
                    size="small"
                    style={{
                      backgroundColor: "#BFEFFF",
                      border: "none",
                      borderRadius: 15,
                      color: "#0033FF",
                    }}
                    onClick={() => handleViewDetail(fav)}
                  >
                    {language === "vi" ? "Xem chi tiết" : "See details"}
                  </Button>

                  <Button
                    size="small"
                    style={{
                      backgroundColor: "#FFCCCC",
                      border: "none",
                      borderRadius: 15,
                      color: "#FF3333",
                    }}
                    icon={<HeartFilled />}
                    onClick={() => handleRemoveFavorite(fav)}
                  >
                    {language === "vi" ? "Bỏ yêu thích" : "Unfavourite"}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4 text-primary">
        {language === "vi" ? "Danh sách yêu thích" : "Favorites list"}
      </h3>

      {loading ? (
        <div className="text-center my-5">
          <Spin size="large" />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          type="card"
          size="large"
          tabBarGutter={30}
          className="rounded-3 bg-white p-3"
        >
          <TabPane
            tab={
              <span>
                {language === "vi" ? "Bác sĩ yêu thích" : "Favorite doctor"} (
                {doctorFavorites.length})
              </span>
            }
            key="1"
          >
            {renderFavoriteList(
              doctorFavorites,
              language === "vi" ? "bác sĩ" : "doctor"
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                {language === "vi"
                  ? "Bệnh viện yêu thích"
                  : "Favorite hospital"}{" "}
                ({hospitalFavorites.length})
              </span>
            }
            key="2"
          >
            {renderFavoriteList(
              hospitalFavorites,
              language === "vi" ? "bệnh viện" : "hospital"
            )}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: state.user.userInfo,
  allFavorites: state.admin.allFavorites,
});

const mapDispatchToProps = (dispatch) => ({
  fetchUserFavorite: (userId) => dispatch(fetchAllUserFavoriteStart(userId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Favorites);
