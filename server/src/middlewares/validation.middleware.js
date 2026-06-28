import { ApiError } from "../utils/apiError.js";

export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return next(new ApiError(400, "Validation failed", errors));
    }
    req[source] = result.data;
    next();
  };
};
