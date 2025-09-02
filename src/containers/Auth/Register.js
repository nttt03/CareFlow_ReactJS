import { useHistory } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../store/actions";
import { registerNewUser } from "../../services/userService";
import "./Auth.scss";

function Register() {
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const dispatch = useDispatch();
  const genders = useSelector((state) => state.admin.genders);
  const language = useSelector((state) => state.app.language);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const defaultValidInput = {
    fullName: true,
    email: true,
    phoneNumber: true,
    gender: true,
    password: true,
    confirmPassword: true,
  };

  const [objCheckInput, setObjCheckInput] = useState(defaultValidInput);

  let history = useHistory();

  const handleLogin = () => {
    history.push("/login");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValidInputs = () => {
    setObjCheckInput(defaultValidInput);

    if (!formData.fullName) {
      toast.error("Vui lòng nhập họ tên!");
      setObjCheckInput({ ...defaultValidInput, fullName: false });
      return false;
    }
    if (!formData.email) {
      toast.error("Vui lòng nhập email!");
      setObjCheckInput({ ...defaultValidInput, email: false });
      return false;
    }
    let regx = /\S+@\S+\.\S+/;
    if (!regx.test(formData.email)) {
      toast.error("Email không đúng định dạng!");
      setObjCheckInput({ ...defaultValidInput, email: false });
      return false;
    }
    if (!formData.phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại!");
      setObjCheckInput({ ...defaultValidInput, phoneNumber: false });
      return false;
    }
    let phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!");
      setObjCheckInput({ ...defaultValidInput, phoneNumber: false });
      return false;
    }
    if (
      !formData.gender ||
      !genders.some((item) => item.keyMap === formData.gender)
    ) {
      toast.error("Vui lòng chọn giới tính hợp lệ!");
      setObjCheckInput({ ...defaultValidInput, gender: false });
      return false;
    }
    if (!formData.password) {
      toast.error("Vui lòng nhập mật khẩu!");
      setObjCheckInput({ ...defaultValidInput, password: false });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không đúng!");
      setObjCheckInput({ ...defaultValidInput, confirmPassword: false });
      return false;
    }
    return true;
  };

  const handleShowHidePassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  const handleShowHideConfirmPassword = () => {
    setIsShowConfirmPassword(!isShowConfirmPassword);
  };

  useEffect(() => {
    dispatch(actions.fetchGenderStart());
  }, [dispatch]);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token); // lưu token khi user check captcha
  };

  const handleRegister = async () => {
    let check = isValidInputs();
    if (check) {
      if (!captchaToken) {
        toast.error("Vui lòng xác thực Captcha!");
        return;
      }
      try {
        let serverData = await registerNewUser({ ...formData, captchaToken });
        if (+serverData.errCode === 0) {
          toast.success(serverData.errMessage);
          history.push("/login");
        } else {
          toast.error(serverData.errMessage);
          recaptchaRef.current.reset();
        }
      } catch (e) {
        toast.error("Lỗi server khi đăng ký!");
        recaptchaRef.current.reset();
      }
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container register-container m-3">
        <div className="auth-content row">
          <div className="col-12 text-login">ĐĂNG KÝ</div>

          {/* Họ tên */}
          <div className="col-12 form-group login-input">
            <label>Họ và tên:</label>
            <input
              type="text"
              name="fullName"
              placeholder="Nhập họ và tên"
              className={
                objCheckInput.fullName
                  ? "form-control"
                  : "form-control is-invalid"
              }
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="col-12 form-group login-input">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              className={
                objCheckInput.email ? "form-control" : "form-control is-invalid"
              }
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Số điện thoại & Giới tính */}
          <div className="d-md-flex gap-3">
            <div
              className="flex-fill form-group login-input"
              style={{ flex: "1 1 50%" }}
            >
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Nhập số điện thoại"
                className={
                  objCheckInput.phoneNumber
                    ? "form-control w-100"
                    : "form-control w-100 is-invalid"
                }
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex-fill form-group login-input">
              <label>Giới tính:</label>
              <select
                className={
                  objCheckInput.gender
                    ? "form-select w-100"
                    : "form-select w-100 is-invalid"
                }
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">-- Chọn giới tính --</option>
                {genders &&
                  genders.length > 0 &&
                  genders.map((item) => (
                    <option key={item.keyMap} value={item.keyMap}>
                      {item.valueVi}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Mật khẩu & Nhập lại mật khẩu */}
          <div className="d-md-flex gap-3">
            <div className="flex-fill form-group login-input">
              <label>Mật khẩu:</label>
              <div className="custom-input-password">
                <input
                  type={isShowPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span onClick={handleShowHidePassword}>
                  <i
                    className={
                      isShowPassword ? "fas fa-eye" : "fas fa-eye-slash"
                    }
                  ></i>
                </span>
              </div>
            </div>
            <div className="flex-fill form-group login-input">
              <label>Nhập lại mật khẩu:</label>
              <div className="custom-input-password">
                <input
                  type={isShowConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span onClick={handleShowHideConfirmPassword}>
                  <i
                    className={
                      isShowConfirmPassword ? "fas fa-eye" : "fas fa-eye-slash"
                    }
                  ></i>
                </span>
              </div>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div className="col-12 mb-3 d-flex justify-content-center">
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_SITE_KEY_CAPTCHA}
              onChange={handleCaptchaChange}
              onExpired={() => setCaptchaToken("")}
              onErrored={() => toast.error("Lỗi khi tải reCAPTCHA!")}
              ref={recaptchaRef}
            />
          </div>

          {/* Button */}
          <div className="col-12">
            <button className="btn-register w-100" onClick={handleRegister}>
              Đăng ký
            </button>
          </div>

          {/* Link login */}
          <div className="col-12">
            <p className="text-end my-3">
              <span
                className="hover-effect fw-bold text-danger text-decoration-underline"
                style={{ cursor: "pointer" }}
                onClick={handleLogin}
              >
                Đã có tài khoản
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
