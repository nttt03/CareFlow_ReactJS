import React, { Component } from "react";
import { connect } from "react-redux";
import "./AddSpecialty.scss";
import markdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import { CommonUtils } from "../../../utils";
import { createNewSpecialty } from "../../../services/userService";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";

const mdParser = new markdownIt();

class AddSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      imageBase64: "",
      descriptionHTML: "",
      descriptionMarkdown: "",
    };
  }

  async componentDidMount() {}

  async componentDidUpdate(prevProps, prevState, snapshot) {}

  handleOnchangeInput = (event, id) => {
    let stateCopy = { ...this.state };
    stateCopy[id] = event.target.value;
    this.setState({
      ...stateCopy,
    });
  };

  handleEditorChange = ({ html, text }) => {
    this.setState({
      descriptionMarkdown: text,
      descriptionHTML: html,
    });
  };

  handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      this.setState({
        imageBase64: base64,
      });
    }
  };

  handleSaveSpecialty = async () => {
    let res = await createNewSpecialty(this.state);
    if (res && res.errCode === 0) {
      toast.success("Thêm mới chuyên khoa thành công!");
      this.setState({
        name: "",
        imageBase64: "",
        descriptionHTML: "",
        descriptionMarkdown: "",
      });
    } else if (res && res.errCode === 1) {
      toast.warn("Vui lòng điền đầy đủ thông tin!");
    } else {
      toast.error("Lỗi khi thêm mới chuyên khoa!");
      console.log("check res-err: ", res);
    }
  };

  render() {
    return (
      <div>
        <div className="manage-spetialty-container">
          <div className="ms-title">
            <FormattedMessage id="admin.manage-specialty.title-add" />
          </div>

          <div className="add-new-spectialty row">
            <div className="col-6">
              <label>
                <FormattedMessage id="admin.manage-specialty.name-specialty" />
              </label>
              <input
                className="form-control"
                type="text"
                value={this.state.name}
                onChange={(e) => {
                  this.handleOnchangeInput(e, "name");
                }}
              />
            </div>
            <div className="col-6">
              <label>
                <FormattedMessage id="admin.manage-specialty.img-specialty" />
              </label>
              <input
                className="form-control-file"
                type="file"
                onChange={(e) => {
                  this.handleOnChangeImage(e);
                }}
              />
            </div>
            <div className="col-12 mt-3">
              <MdEditor
                value={this.state.descriptionMarkdown}
                style={{ height: "400px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={this.handleEditorChange}
              />
            </div>
            <div className="col-12">
              <button
                className="btn-save-specialty"
                onClick={() => {
                  this.handleSaveSpecialty();
                }}
              >
                <FormattedMessage id="admin.manage-specialty.save" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(AddSpecialty);
