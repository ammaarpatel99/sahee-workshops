import * as nodemailer from "nodemailer";
import {password} from "./password.secret";


export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sajedapat@gmail.com',
    pass: password,
  },
});
