import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HomeHeader from "./HomeHeader";
import Specialty from "./Section/Specialty";
import MedicalFacility from "./Section/MedicalFacility";
import OutStandingDoctor from "./Section/OutStandingDoctor";
import HandBook from "./Section/HandBook";
import HomeFooter from "./HomeFooter";
import FeaturesSection from "../../components/FeaturesSection";
import Review from "../../components/Review";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./HomePage.scss";

const HomePage = () => {
  const userInfo = useSelector((state) => state.user.userInfo);

  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const currId = userInfo?.id;

    if (!currId) {
      localStorage.removeItem("reviewShown");
      return;
    }

    const reviewShown = localStorage.getItem("reviewShown");

    if (currId && !reviewShown) {
      setTimeout(() => {
        setShowReviewModal(true);
        localStorage.setItem("reviewShown", "true");
      }, 1000);
    }
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
      <HomeHeader isShowBanner={true} />
      <FeaturesSection />
      <Specialty settings={settings} />
      <MedicalFacility settings={settings} />
      <OutStandingDoctor settings={settings} />
      <HandBook />
      <HomeFooter />

      <Review
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={userInfo?.id}
      />
    </div>
  );
};

export default HomePage;
