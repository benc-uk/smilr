class ApiError extends Error {
  constructor(msg, code = 500) {
    super(msg);
    this.msg = msg;
    this.code = code;
  }

  // This makes .toString() return the msg not [Object object]
  get [Symbol.toStringTag]() {
    return this.msg;
  }
}

module.exports = ApiError;
