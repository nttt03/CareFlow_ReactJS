export const adminMenu = [
  {
    // quản lý người dùng
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.manage-doctor",
        link: "/system/manage-doctor",
        // subMenus: [
        //     { name: 'menu.system.system-administrator.user-manage', link: '/system/user-manage' },
        //     { name: 'menu.system.system-administrator.user-redux', link: '/system/user-redux' },

        // ]
      },

      // {
      //     name: 'menu.admin.manage-admin', link: '/system/user-admin'
      // },

      {
        name: "menu.admin.crud",
        link: "/system/user-manage",
      },

      {
        name: "menu.admin.crud-redux",
        link: "/system/user-redux",
      },

      {
        // quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
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
    // quản lý cẩm nang
    name: "menu.admin.handbook",
    menus: [
      {
        name: "menu.admin.manage-handbook",
        link: "/system/manage-handbook",
      },
    ],
  },
];

export const doctorMenu = [
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        // quản lý kế hoạch khám bệnh của bác sĩ
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
      {
        // quản lý bệnh nhân của bác sĩ
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
    ],
  },
];
