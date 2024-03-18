import app from "./app";
import scheduled from "./scheduled";
import email from "./email";

export default {
  fetch: app.fetch,
  scheduled,
  email
};
