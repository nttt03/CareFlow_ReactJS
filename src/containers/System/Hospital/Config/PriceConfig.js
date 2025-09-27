import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Input, InputNumber, Button, message } from "antd";
import { Buffer } from "buffer";
import {
  getSpecialtiesByHospital,
  savePriceForHospital,
} from "../../../../services/userService";

const PriceConfig = ({ hospitalId, language }) => {
  const [specialties, setSpecialties] = useState([]);
  const [prices, setPrices] = useState({});
  const [loadingId, setLoadingId] = useState(null); // Để biết đang lưu cái nào
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHospitalSpecialties = async () => {
      if (!hospitalId) return;
      try {
        const res = await getSpecialtiesByHospital(hospitalId);
        if (res?.errCode === 0) {
          setSpecialties(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy chuyên khoa của bệnh viện:", err);
      }
    };

    fetchHospitalSpecialties();
  }, [hospitalId]);

  const handlePriceChange = (specialtyId, value) => {
    setPrices((prev) => ({ ...prev, [specialtyId]: value }));
  };

  const handleSavePrice = async (specialtyId) => {
    const price = prices[specialtyId] || 0;
    setLoadingId(specialtyId);

    try {
      const res = await savePriceForHospital({
        hospitalId,
        specialtyId,
        price,
      });

      if (res?.errCode === 0) {
        message.success("Lưu giá thành công!");
      } else {
        message.error("Lỗi khi lưu giá!");
      }
    } catch (err) {
      console.error("Lỗi khi lưu giá:", err);
      message.error("Không thể lưu giá!");
    }

    setLoadingId(null);
  };

  const filteredSpecialties = specialties.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Input
        placeholder="Tìm kiếm chuyên khoa..."
        className="mb-3"
        style={{ maxWidth: "300px" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="d-flex justify-content-center w-100">
        <div className="d-flex flex-wrap gap-4">
          {filteredSpecialties.map((specialty) => (
            <div
              key={specialty.id}
              className="d-flex align-items-center gap-3 p-3 border rounded shadow-sm"
              style={{ minWidth: "250px" }}
            >
              <img
                alt="img"
                src={Buffer.from(specialty.image, "base64").toString("binary")}
                style={{ width: "60px", height: "60px" }}
              />

              <div className="d-flex flex-column gap-2">
                <span
                  className="fw-bold text-dark"
                  style={{ fontSize: "16px" }}
                >
                  {specialty.name}
                </span>

                <InputNumber
                  className="price-input w-100"
                  value={
                    prices[specialty.id] !== undefined
                      ? prices[specialty.id]
                      : specialty.price || 0
                  }
                  onChange={(value) => handlePriceChange(specialty.id, value)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ"
                  }
                  parser={(value) => value.replace(/[^\d]/g, "")}
                  min={0}
                />

                <div className="d-flex justify-content-end">
                  <Button
                    type="primary"
                    className="px-2"
                    style={{ width: "60px" }}
                    loading={loadingId === specialty.id}
                    onClick={() => handleSavePrice(specialty.id)}
                  >
                    {language === "vi" ? "Lưu" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PriceConfig);
