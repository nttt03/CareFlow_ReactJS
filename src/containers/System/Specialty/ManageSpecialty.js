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
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllSpecialty,
  deleteSpecialty,
} from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import { showLoading, hideLoading } from "../../../store/actions";
import moment from "moment";
import { toast } from "react-toastify";

const { Option } = Select;

function ManageSpecialty({ language }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    status: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // lấy danh sách chuyên khoa
  const fetchSpecialty = async (
    page = 1,
    pageSize = 5,
    currentFilters = filters
  ) => {
    dispatch(showLoading());
    setLoading(true);
    try {
      const res = await getAllSpecialty({
        page,
        limit: pageSize,
        ...currentFilters,
      });
      if (res && res.data && res.errCode === 0) {
        const specialtyList = res.data;
        const pagination = res.pagination;

        setSpecialties(specialtyList || []);
        setPagination({
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
        });
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", err);
    } finally {
      setLoading(false);
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    fetchSpecialty(pagination.current, pagination.pageSize);
  }, []);

  const handleDeleteSpecialty = async (id) => {
    try {
      const res = await deleteSpecialty(id);
      if (res && res.errCode === 0) {
        toast.success("Xóa chuyên khoa thành công!");
        fetchSpecialty();
      } else {
        toast.error("Xóa chuyên khoa thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi xóa chuyên khoa!");
    }
  };

  const handleTableChange = (pagination) => {
    fetchSpecialty(pagination.current, pagination.pageSize, filters);
  };

  // thay đổi filter
  const handleFilterChange = (changed) => {
    const newFilters = { ...filters, ...changed };
    setFilters(newFilters);
    fetchSpecialty(1, pagination.pageSize, newFilters); // reset về page 1 khi lọc
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
      title: "Chuyên khoa",
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
          <div style={{ fontWeight: "bold" }}>{record.name}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
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
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              history.push(
                `/system/manage-specialty/edit-specialty/${record.id}`
              )
            }
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() =>
              history.push(
                `/system/manage-specialty/detail-specialty/${record.id}`
              )
            }
          />
          <Popconfirm
            title="Xóa bản ghi"
            description="Bạn có chắc muốn xóa bản ghi này không?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteSpecialty(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-3 manage-specialty-container">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-specialty.title" />
      </div>
      <div style={{ textAlign: "left", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push("/system/manage-specialty/add-specialty")}
        >
          Thêm chuyên khoa
        </Button>
      </div>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Tìm theo tên chuyên khoa"
            value={filters.name}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder="Chọn trạng thái"
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

      <Table
        rowKey="id"
        columns={columns}
        dataSource={Array.isArray(specialties) ? specialties : []}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(ManageSpecialty);
