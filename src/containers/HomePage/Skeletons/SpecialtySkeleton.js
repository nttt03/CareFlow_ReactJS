import { Skeleton } from "antd";

const SpecialtySkeleton = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div className="col-6 col-md-4 col-lg-2" key={index}>
          <div className="p-3 text-center">
            <Skeleton.Avatar active size={80} shape="circle" className="mb-2" />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 90, margin: "0 auto" }}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default SpecialtySkeleton;
