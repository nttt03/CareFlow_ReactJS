import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
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
import { FormattedMessage } from "react-intl";
import moment from "moment";
import { toast } from "react-toastify";
import { Buffer } from "buffer";
import * as actions from "../../../../store/actions";
import ModalAccount from "./ModalAccount";

const { Option } = Select;

function ManageAccount({
  language,
  listUsers,
  roleRedux,
  getAllUsers,
  deleteUser,
  getRoleStart,
}) {
  const history = useHistory();
  const [filters, setFilters] = useState({
    name: "",
    status: null,
    role: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingUser, setEditingUser] = useState(null);

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setModalMode("edit");
    setEditingUser(record);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getAllUsers();
    if (!roleRedux || roleRedux.length === 0) {
      getRoleStart();
    }
  }, [getAllUsers, getRoleStart, roleRedux]);

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      toast.success(
        language === "vi"
          ? "Xóa tài khoản thành công!"
          : "Account deleted successfully!"
      );
      getAllUsers();
    } catch (err) {
      toast.error(
        language === "vi"
          ? "Xóa tài khoản thất bại!"
          : "Account deletion failed!"
      );
    }
  };

  const handleFilterChange = (changed) => {
    const newFilters = { ...filters, ...changed };
    setFilters(newFilters);
  };

  const filteredUsers = Array.isArray(listUsers)
    ? listUsers.filter((u) => {
        const matchName = filters.name
          ? String(u.fullName || "")
              .toLowerCase()
              .includes(filters.name.toLowerCase())
          : true;
        const matchStatus = filters.status ? u.status === filters.status : true;
        const matchRole = filters.role ? u.roleId === filters.role : true;
        return matchName && matchStatus && matchRole;
      })
    : [];

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/defaultImg.png";
    let imageBase64 = Buffer.from(avatar, "base64").toString("binary");
    return imageBase64;
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: language === "vi" ? "Họ tên" : "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 250,
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src={getAvatarUrl(record.avatar)}
            alt={record.fullName}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: "50%",
              border: "1px solid #ddd",
              backgroundColor: "#f5f5f5",
            }}
            preview={false}
          />

          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: language === "vi" ? "Phân quyền" : "Decentralization",
      dataIndex: "roleId",
      key: "roleId",
      width: 150,
      render: (roleId) => {
        const role = roleRedux?.find((r) => r.keyMap === roleId);
        let color = "default";
        if (roleId === "R1") color = "red";
        else if (roleId === "R2") color = "green";
        else if (roleId === "R3") color = "blue";

        const label = role
          ? language === "vi"
            ? role.valueVi
            : role.valueEn
          : roleId;
        console.log("label: ", label);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: language === "vi" ? "Số điện thoại" : "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
    },
    {
      title: language === "vi" ? "Trạng thái" : "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const label =
          language === "vi"
            ? status === "A1"
              ? "Đang hoạt động"
              : "Ngừng hoạt động"
            : status === "A1"
            ? "Active"
            : "Inactive";
        return <Tag color={status === "A1" ? "green" : "red"}>{label}</Tag>;
      },
    },
    {
      title: language === "vi" ? "Ngày tạo" : "Create At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: language === "vi" ? "Ngày cập nhật" : "Update At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value) =>
        value ? moment(value).format("DD/MM/YYYY HH:mm") : "",
    },
    {
      title: language === "vi" ? "Hành động" : "Actions",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title={language === "vi" ? "Xóa tài khoản" : "Delete account"}
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-3 manage-account-container">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-account.title" />
      </div>
      <div style={{ textAlign: "left", marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
          {language === "vi" ? "Thêm tài khoản" : "Add account"}
        </Button>
      </div>
      <ModalAccount
        visible={isModalOpen}
        mode={modalMode}
        initialValues={editingUser}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder={language === "vi" ? "Tìm theo tên" : "Search by name"}
            value={filters.name}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
            allowClear
          />
        </Col>
        <Col span={8}>
          <Select
            placeholder={
              language === "vi" ? "Chọn phân quyền" : "Select permissions"
            }
            style={{ width: "100%" }}
            allowClear
            value={filters.role}
            onChange={(val) => handleFilterChange({ role: val })}
          >
            <Option value="R1">
              {language === "vi" ? "Quản trị viên" : "Admin"}
            </Option>
            <Option value="R4">
              {language === "vi" ? "Lãnh đạo bệnh viện" : "Hospital Leader"}
            </Option>
            <Option value="R2">
              {language === "vi" ? "Bác sĩ" : "Doctor"}
            </Option>
            <Option value="R3">
              {language === "vi" ? "Khách hàng" : "Customer"}
            </Option>
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

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredUsers}
        pagination={pagination}
        loading={loading}
        onChange={(p) => setPagination(p)}
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    listUsers: state.admin.users,
    roleRedux: state.admin.roles,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllUsers: () => dispatch(actions.fetchAllUsersStart()),
    deleteUser: (id) => dispatch(actions.deleteUserStart(id)),
    getRoleStart: () => dispatch(actions.fetchRoleStart()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageAccount);
