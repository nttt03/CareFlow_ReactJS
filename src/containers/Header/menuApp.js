export const adminMenu = [
  {
    // hệ thống
    name: "menu.admin.system",
    menus: [
      {
        name: "menu.admin.dashboard",
        link: "/system/dashboard",
      },
      {
        // profile
        name: "menu.admin.profile-user",
        link: "/system/profile-user/:id",
      },
      {
        // change password
        name: "menu.admin.change-password",
        link: "/system/change-password/:id",
      },
    ],
  },

  {
    // quản lý người dùng
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.manage-account",
        link: "/system/manage-account",
      },
      {
        name: "menu.admin.manage-doctor",
        link: "/system/manage-doctor",
      },
      // {
      //   name: "menu.admin.crud",
      //   link: "/system/user-manage",
      // },
      // {
      //   name: "menu.admin.crud-redux",
      //   link: "/system/user-redux",
      // },
    ],
  },

  {
    // quản lý bệnh viện
    name: "menu.admin.hospital",
    menus: [
      {
        name: "menu.admin.manage-hospital",
        link: "/system/manage-hospital",
      },
    ],
  },

  {
    // quản lý chuyên khoa
    name: "menu.admin.specialty",
    menus: [
      {
        name: "menu.admin.manage-specialty",
        link: "/system/manage-specialty",
      },
    ],
  },

  {
    // quản lý khám bệnh
    name: "menu.admin.manage-examination",
    menus: [
      {
        // quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.doctor.manage-schedule",
        link: "/system/manage-schedule",
      },
      {
        name: "menu.doctor.waiting-approval",
        link: "/system/waiting-approval",
      },
      {
        // quản lý hồ sơ bệnh án
        name: "menu.doctor.manage-medical-record",
        link: "/system/manage-medical-record",
      },
    ],
  },

  // {
  //   // quản lý cẩm nang
  //   name: "menu.admin.handbook",
  //   menus: [
  //     {
  //       name: "menu.admin.manage-handbook",
  //       link: "/system/manage-handbook",
  //     },
  //   ],
  // },
];

export const doctorMenu = [
  {
    name: "menu.doctor.system",
    menus: [
      {
        name: "menu.doctor.dashboard",
        link: "/doctor/dashboard",
      },
      {
        // profile bác sĩ
        name: "menu.doctor.profile-user",
        link: "/doctor/profile-user/:id",
      },
      {
        // change password
        name: "menu.doctor.change-password",
        link: "/doctor/change-password/:id",
      },
    ],
  },
  {
    name: "menu.doctor.manage",
    menus: [
      {
        // quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
      {
        name: "menu.doctor.waiting-approval",
        link: "/doctor/waiting-approval",
      },
      {
        // quản lý bệnh nhân của bác sĩ
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
      {
        // quản lý hồ sơ bệnh án
        name: "menu.doctor.manage-medical-record",
        link: "/doctor/manage-medical-record",
      },
    ],
  },
];

export const leaderHospitalMenu = [
  {
    name: "menu.leader-hospital.system",
    menus: [
      {
        name: "menu.leader-hospital.dashboard",
        link: "/leader-hospital/dashboard",
      },
      {
        // profile
        name: "menu.leader-hospital.profile-user",
        link: "/leader-hospital/profile-user/:id",
      },
      {
        // change password
        name: "menu.leader-hospital.change-password",
        link: "/leader-hospital/change-password/:id",
      },
    ],
  },
  {
    name: "menu.leader-hospital.manage",
    menus: [
      {
        // quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.leader-hospital.manage-schedule",
        link: "/leader-hospital/manage-schedule",
      },
      {
        // quản lý bệnh nhân của bác sĩ
        name: "menu.leader-hospital.manage-patient",
        link: "/leader-hospital/manage-patient",
      },
    ],
  },
];
