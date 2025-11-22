import React from "react";
import { Skeleton } from "antd";

const SpecialtySkeleton = ({ count = 8 }) => {
  return (
    <div className="row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-3 col-sm-6 col-12 mb-4">
          <div className="list-specialty__content">
            <div className="list-specialty__content__item">
              <div className="list-specialty__content__item__image">
                <Skeleton.Image style={{ width: 120, height: 120 }} active />
              </div>
              <div style={{ marginTop: 15 }}>
                <Skeleton.Input active block style={{ height: 30 }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialtySkeleton;
