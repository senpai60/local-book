class ApiResponse {
  constructor(statusCode, data, message = "Success", errors = null) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (errors) {
      this.errors = errors;
    }
  }
}

export { ApiResponse };
