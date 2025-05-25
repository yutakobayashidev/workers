import { QRschema } from "@/schema";
import { Output } from "valibot";
import writeQR from "@paulmillr/qr";

export const createQRCode = (options: Output<typeof QRschema>) => {
  const code = writeQR(options.text, "svg");

  return code;
};
