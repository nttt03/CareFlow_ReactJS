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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        toast.success(
          language === "vi"
            ? "Xóa chuyên khoa thành công!"
            : "Delete specialty successfully!"
        );
        fetchSpecialty();
      } else {
        toast.error(
          language === "vi"
            ? "Xóa chuyên khoa thất bại!"
            : "Delete specialty failed!"
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        language === "vi"
          ? "Có lỗi xảy ra khi xóa chuyên khoa!"
          : "An error occurred while deleting specialty!"
      );
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
      title: language === "vi" ? "Chuyên khoa" : "Specialty",
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
            icon={<EyeOutlined />}
            size="small"
            onClick={() =>
              history.push(
                `/system/manage-specialty/edit-specialty/${record.id}?mode=view`
              )
            }
          />

          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              history.push(
                `/system/manage-specialty/edit-specialty/${record.id}?mode=edit`
              )
            }
          />
          <Popconfirm
            title={language === "vi" ? "Xóa bản ghi" : "Delete record"}
            description={
              language === "vi"
                ? "Bạn có chắc muốn xóa bản ghi này không?"
                : "Are you sure to delete this record?"
            }
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
    <div className="m-5 manage-specialty-container ">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-specialty.title" />
      </div>
      <div style={{ textAlign: "left", marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => history.push("/system/manage-specialty/add-specialty")}
        >
          <FormattedMessage id="admin.manage-specialty.title-add" />
        </Button>
      </div>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder={
              language === "vi"
                ? "Tìm theo tên chuyên khoa"
                : "Search by specialty name"
            }
            value={filters.name}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder={
              language === "vi" ? "Chọn trạng thái" : "Select by status"
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
