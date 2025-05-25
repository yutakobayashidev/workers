import { string, object } from "valibot";

export const QRschema = object({
	text: string(),
});
