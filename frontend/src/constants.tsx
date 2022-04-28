// export const apiUrl = "https://127.0.0.1:5000/api/";
// export const apiUrl = "/api/";
export const apiUrl =
  process.env.NODE_ENV && process.env.NODE_ENV === "development"
    ? "https://127.0.0.1:5000/api/"
    : "/api/";
