import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import HomeHeader from "./HomeHeader";
import Specialty from "./Section/Specialty";
import MedicalFacility from "./Section/MedicalFacility";
import OutStandingDoctor from "./Section/OutStandingDoctor";
import HandBook from "./Section/HandBook";
import HomeFooter from "./HomeFooter";
import FeaturesSection from "../../components/FeaturesSection";
import Review from "../../components/Review";
import AllReview from "../../components/AllReview";
import StatsSection from "../../components/StatsSection";
import { getCurrentUserApi } from "../../services/userService";
import { io } from "socket.io-client";
import * as actions from "../../store/actions";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HomePage.scss";

const HomePage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.userInfo);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchCurrentUser = async () => {
      try {
        const res = await getCurrentUserApi();
        if (res?.errCode === 0 && res?.user) {
          console.log("Logged in user:", res?.user);
          dispatch(actions.userLoginSuccess(res.user));
        } else {
          console.log("User not logged in or no valid user data");
        }
      } catch (error) {
        console.log("Error fetching current user:", error.response?.data || error.message);
      }
    };

    if (!userInfo) {
      fetchCurrentUser();
    }
  }, [dispatch, userInfo]);


  // useEffect(() => {
  //   const currId = userInfo?.id;
  //   if (!currId) {
  //     localStorage.removeItem("reviewShownIds");
  //     return;
  //   }

  //   const checkReview = async () => {
  //     try {
  //       const res = await getAppointmentNeedReview(currId);
  //       const pending = res?.dataAppointments || [];

  //       // danh sách id người dùng cần review
  //       const idsToReview = pending.map((item) => item.id);

  //       // lấy ids đã show modal từ localStorage
  //       const shownIds = JSON.parse(
  //         localStorage.getItem("reviewShownIds") || "[]"
  //       );

  //       // tìm những id chưa show
  //       const newIds = idsToReview.filter((id) => !shownIds.includes(id));

  //       console.log("pending ids", idsToReview);
  //       console.log("shown ids", shownIds);
  //       console.log("new ids", newIds);

  //       // nếu có appointment mới cần review → show modal
  //       if (newIds.length > 0) {
  //         setShowReviewModal(true);

  //         // cập nhật vào localStorage
  //         const updatedIds = [...shownIds, ...newIds];
  //         localStorage.setItem("reviewShownIds", JSON.stringify(updatedIds));
  //       }

  //       // nếu không còn pending appointments → reset storage
  //       if (idsToReview.length === 0) {
  //         localStorage.removeItem("reviewShownIds");
  //       }
  //     } catch (err) {
  //       console.error("Review check failed", err);
  //     }
  //   };

  //   const timer = setTimeout(checkReview, 800);
  //   return () => clearTimeout(timer);
  // }, [userInfo]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL);

    // join room cho user hiện tại
    if (userInfo?.id) {
      socket.emit("joinCustomerRoom", userInfo.id);
    }

    socket.on("review-reminder", (booking) => {
      console.log("Received review reminder:", booking);
      setPendingBooking(booking);
      setShowReviewModal(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1199, settings: { slidesToShow: 3 } },
      { breakpoint: 991, settings: { slidesToShow: 2 } },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "40px",
        },
      },
    ],
  };

  return (
    <div>
      <HomeHeader
        isShowBanner
        onReviewNotification={(booking) => {
          setPendingBooking(booking);
          setShowReviewModal(true);
        }}
      />
      <div className="d-block d-lg-none">
        <StatsSection />
      </div>
      <FeaturesSection />
      <Specialty settings={settings} />
      <MedicalFacility settings={settings} />
      <OutStandingDoctor settings={settings} />
      <AllReview />
      <HandBook />
      <HomeFooter />

      <Review
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={userInfo?.id}
        socketBooking={pendingBooking}
      />
    </div>
  );
};

export default HomePage;
