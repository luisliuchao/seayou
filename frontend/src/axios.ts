import Axios from "axios";

// custom axios instance
const axios = Axios.create();

// redirect to /login if response status is 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
