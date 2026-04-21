import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import {
  Button,
  Table,
  Image,
  Space,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllHospitalByAdmin,
  getAllProvince,
  deleteHospital,
} from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import { showLoading, hideLoading } from "../../../store/actions";
import moment from "moment";
import { toast } from "react-toastify";

const { Option } = Select;

function ManageHospital({ language }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const [provinces, setProvinces] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    provinceId: null,
    status: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // lấy danh sách tỉnh
  const fetchProvinces = async () => {
    try {
      const res = await getAllProvince();
      if (res && res.data) {
        setProvinces(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi fetch provinces:", err);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  // lấy danh sách bệnh viện
  const fetchHospitals = async (
    page = 1,
    pageSize = 5,
    currentFilters = filters
  ) => {
    try {
      dispatch(showLoading());
      const res = await getAllHospitalByAdmin({
        page,
        limit: pageSize,
        ...currentFilters,
      });
      if (res && res.data && res.errCode === 0) {
        const hospitalList = res.data;
        const pagination = res.pagination;

        setHospitals(hospitalList || []);
        setPagination({
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
        });
      }
    } catch (err) {
      console.error("Lỗi khi fetch hospitals:", err);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    fetchHospitals(pagination.current, pagination.pageSize);
  }, []);

  const handleDeleteHospital = async (id) => {
    try {
      const res = await deleteHospital(id);
      if (res && res.errCode === 0) {
        toast.success(
          language === "vi"
            ? "Xóa bệnh viện thành công!"
            : "Delete hospital successed!"
        );
        fetchHospitals();
      } else {
        toast.error(
          language === "vi"
            ? "Xóa bệnh viện thất bại!"
            : "Delete hospital failed"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        language === "vi"
          ? "Có lỗi xảy ra khi xóa bệnh viện!"
          : "An error occurred while deleting hospital!"
      );
    }
  };

  const handleTableChange = (pagination) => {
    fetchHospitals(pagination.current, pagination.pageSize, filters);
  };

  // thay đổi filter
  const handleFilterChange = (changed) => {
    const newFilters = { ...filters, ...changed };
    setFilters(newFilters);
    fetchHospitals(1, pagination.pageSize, newFilters); // reset về page 1 khi lọc
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 50,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: language === "vi" ? "Bệnh viện" : "Hospital",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src={record.image || undefined}
            alt={record.name}
            style={{
              width: 50,
              height: 50,
              padding: 2,
              objectFit: "cover",
              border: "1px solid #ddd",
              borderRadius: 5,
            }}
            preview={false}
            fallback="/defaultimg.png"
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.name}</div>
            <div
              style={{
                color: "#666",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <EnvironmentOutlined style={{ color: "#1890ff" }} />
              {record.provinceData?.name || "Không có thông tin"}
            </div>
          </div>
        </div>
      ),
    },
    // {
    //   title: language === "vi" ? "Địa chỉ chi tiết" : "Address detail",
    //   dataIndex: "addressDetail",
    //   key: "addressDetail",
    //   width: 250,
    //   ellipsis: true,
    // },
    {
      title: language === "vi" ? "Trạng thái" : "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (_, record) => {
        const label =
          language === "vi"
            ? record.statusData?.valueVi
            : record.statusData?.valueEn;

        const isActive = record.statusData?.keyMap === "A1";

        return (
          <Tag
            color={isActive ? "green" : "red"}
            style={{ whiteSpace: "nowrap", margin: 0 }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: language === "vi" ? "Ngày tạo" : "Create At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: language === "vi" ? "Ngày cập nhật" : "Update At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: language === "vi" ? "Hành động" : "Actions",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              history.push(`/system/manage-hospital/edit-hospital/${record.id}`)
            }
          />
          {/* <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() =>
              history.push(
                `/system/manage-hospital/detail-hospital/${record.id}`
              )
            }
          /> */}
          <Popconfirm
            title={language === "vi" ? "Xóa bản ghi" : "Delete record"}
            description={
              language === "vi"
                ? "Bạn có chắc muốn xóa bản ghi này không?"
                : "Are you sure to delete this record?"
            }
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteHospital(record.id)} // gọi hàm xoá
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-5 mt-3 manage-hospital-container">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-hospital.title" />
      </div>
      <div style={{ textAlign: "left", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push("/system/manage-hospital/add-hospital")}
        >
          <FormattedMessage id="admin.manage-hospital.title-add" />
        </Button>
      </div>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder={
              language === "vi"
                ? "Tìm theo tên bệnh viện"
                : "Search by hospital name"
            }
            value={filters.name}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            showSearch
            placeholder={
              language === "vi" ? "Chọn tỉnh thành" : "Select province"
            }
            style={{ width: "100%" }}
            allowClear
            value={filters.provinceId}
            onChange={(val) => handleFilterChange({ provinceId: val })}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {provinces.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <Select
            placeholder={
              language === "vi" ? "Chọn trạng thái" : "Select status"
            }
            style={{ width: "100%" }}
            allowClear
            value={filters.status}
            onChange={(val) => handleFilterChange({ status: val })}
          >
            <Option value="A1">
              {language === "vi" ? "Đang hoạt động" : "Active"}
            </Option>
            <Option value="A2">
              {language === "vi" ? "Ngừng hoạt động" : "Inactive"}
            </Option>
          </Select>
        </Col>
      </Row>

      <div className="overflow-auto">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={Array.isArray(hospitals) ? hospitals : []}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          // scroll={{ x: 1000, y: 400 }}
          // style={{ height: 400 }}
          // virtual
          // components={{
          //   header: {
          //     cell: (props) => (
          //       <th {...props} style={{ background: "#B7B7B7" }} />
          //     ),
          //   },
          // }}
        />
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(ManageHospital);
