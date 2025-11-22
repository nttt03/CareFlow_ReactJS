import React from "react";
import { Skeleton, Rate } from "antd";

const DoctorSkeleton = ({ count = 6 }) => {
  return (
    <div className="row">
      {Array.from({ length: count }).map((_, index) => (
        <div className="col-12 col-sm-6 col-md-4 mb-4" key={index}>
          <div className="doctor-item text-center ">
            {/* Avatar Skeleton */}
            <div className="d-flex justify-content-center">
              <Skeleton.Avatar
                active
                size={80}
                shape="circle"
                style={{ marginBottom: 16 }}
              />
            </div>

            {/* Name Skeleton */}
            <div className="d-flex flex-column ms-5">
              <Skeleton.Input
                active
                style={{ width: "100%", margin: "0 auto 10px" }}
                size="small"
              />
              {/* Specialty Skeleton */}
              <Skeleton.Input
                active
                style={{ width: "100%", margin: "0 auto 10px" }}
                size="small"
              />
              {/* Rating Skeleton */}
              <Rate disabled value={0} style={{ marginTop: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorSkeleton;
