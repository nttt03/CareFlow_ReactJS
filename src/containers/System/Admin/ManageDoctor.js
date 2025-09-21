import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import * as actions from "../../../store/actions";
import { CRUD_ACTIONS } from "../../../utils";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { getDetailInforDoctor } from "../../../services/userService";

import {
  Card,
  Form,
  Input,
  Select as AntdSelect,
  Button,
  Row,
  Col,
  InputNumber,
  Typography,
} from "antd";

const { TextArea } = Input;
const { Title } = Typography;
const mdParser = new MarkdownIt();

class ManageDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contentMarkdown: "",
      contentHTML: "",
      selectedOption: null,
      description: "",
      listDoctors: [],
      hasOlData: false,

      price: "",
      listSpecialty: [],
      listHospital: [],
      selectedSpecialty: null,
      selectedHospital: null,

      note: "",
    };
  }

  componentDidMount() {
    this.props.fetchAllDoctorsRedux();
    this.props.getAllRequiredDoctorInfor();
  }

  buildDataInputSelect = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    return inputData.map((item) => ({
      label: item.fullName || item.name,
      value: item.id,
    }));
  };

  componentDidUpdate(prevProps) {
    if (prevProps.allDoctors !== this.props.allDoctors) {
      this.setState({
        listDoctors: this.buildDataInputSelect(this.props.allDoctors),
      });
    }

    if (
      prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor
    ) {
      let { resSpecialty, resHospital } = this.props.allRequiredDoctorInfor;
      this.setState({
        listSpecialty: this.buildDataInputSelect(resSpecialty),
        listHospital: this.buildDataInputSelect(resHospital),
      });
    }
  }

  handleEditorChange = ({ html, text }) => {
    this.setState({
      contentMarkdown: text,
      contentHTML: html,
    });
  };

  handleSaveContentMarkdown = () => {
    const { hasOlData } = this.state;
    this.props.saveDetailDoctor({
      contentHTML: this.state.contentHTML,
      contentMarkdown: this.state.contentMarkdown,
      description: this.state.description,
      doctorId: this.state.selectedOption?.value,
      action: hasOlData ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
      price: this.state.price,
      note: this.state.note,
      specialtyId: this.state.selectedSpecialty?.value,
      hospitalId: this.state.selectedHospital?.value || "",
    });
  };

  handleChangeDoctor = async (value, option) => {
    this.setState({ selectedOption: option });
    let { listSpecialty, listHospital } = this.state;
    let res = await getDetailInforDoctor(value);
    if (res && res.errCode === 0 && res.data && res.data.Markdown) {
      let markdown = res.data.Markdown;
      let note = "",
        price = "",
        selectedSpecialty = null,
        selectedHospital = null;

      if (res.data.Doctor_Infor) {
        note = res.data.Doctor_Infor.note;
        price = res.data.Doctor_Infor.price;

        selectedSpecialty = listSpecialty.find(
          (item) => item.value === res.data.Doctor_Infor.specialtyId
        );
        selectedHospital = listHospital.find(
          (item) => item.value === res.data.Doctor_Infor.hospitalId
        );
      }

      this.setState({
        contentHTML: markdown.contentHTML,
        contentMarkdown: markdown.contentMarkdown,
        description: markdown.description,
        hasOlData: true,
        note,
        price,
        selectedSpecialty,
        selectedHospital,
      });
    } else {
      this.setState({
        contentHTML: "",
        contentMarkdown: "",
        description: "",
        hasOlData: false,
        note: "",
        price: "",
        selectedSpecialty: null,
        selectedHospital: null,
      });
    }
  };

  render() {
    const {
      listDoctors,
      listSpecialty,
      listHospital,
      selectedOption,
      selectedSpecialty,
      selectedHospital,
      description,
      price,
      note,
      hasOlData,
    } = this.state;

    return (
      <div className="manage-doctor-container" style={{ padding: 24 }}>
        <Title level={3} className="title">
          <FormattedMessage id="admin.manage-doctor.title" />
        </Title>

        <Card style={{ marginBottom: 24 }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <FormattedMessage id="admin.manage-doctor.choose-doctor" />
                  }
                >
                  <AntdSelect
                    showSearch
                    placeholder="Chọn bác sĩ"
                    options={listDoctors}
                    value={selectedOption}
                    onChange={this.handleChangeDoctor}
                    style={{ width: "100%" }}
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<FormattedMessage id="admin.manage-doctor.intro" />}
                >
                  <TextArea
                    rows={3}
                    value={description}
                    onChange={(e) =>
                      this.setState({ description: e.target.value })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={<FormattedMessage id="admin.manage-doctor.price" />}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    value={price}
                    onChange={(value) => this.setState({ price: value })}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ"
                    }
                    parser={(value) => value.replace(/\ VNĐ\s?|(\.)/g, "")}
                    placeholder="Nhập giá khám"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<FormattedMessage id="admin.manage-doctor.note" />}
                >
                  <Input
                    value={note}
                    onChange={(e) => this.setState({ note: e.target.value })}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <>
                      <span>
                        <FormattedMessage id="admin.manage-doctor.specialty" />
                      </span>
                      <span className="text-danger pl-2">*</span>
                    </>
                  }
                >
                  <AntdSelect
                    placeholder="Chọn chuyên khoa"
                    options={listSpecialty}
                    value={selectedSpecialty}
                    onChange={(value, option) =>
                      this.setState({ selectedSpecialty: option })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <>
                      <span>
                        <FormattedMessage id="admin.manage-doctor.hospital" />
                      </span>
                      <span className="text-danger pl-2">*</span>
                    </>
                  }
                >
                  <AntdSelect
                    placeholder="Chọn bệnh viện"
                    options={listHospital}
                    value={selectedHospital}
                    onChange={(value, option) =>
                      this.setState({ selectedHospital: option })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card title="Chi tiết & Nội dung">
          <MdEditor
            value={this.state.contentMarkdown}
            style={{ height: "300px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={this.handleEditorChange}
          />
        </Card>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            onClick={this.handleSaveContentMarkdown}
          >
            {hasOlData ? (
              <FormattedMessage id="admin.manage-doctor.save" />
            ) : (
              <FormattedMessage id="admin.manage-doctor.add" />
            )}
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.app.language,
  allDoctors: state.admin.allDoctors,
  allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor,
});

const mapDispatchToProps = (dispatch) => ({
  fetchAllDoctorsRedux: () => dispatch(actions.fetchAllDoctors()),
  getAllRequiredDoctorInfor: () => dispatch(actions.getRequiredDoctorInfor()),
  saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);
