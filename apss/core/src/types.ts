export type Work = {
	work_name: string;
	intro_s: string;
	site_id: string;
	genres: { name: string; search_val: string }[];
	price: number;
	point: number;
	file_type: string;
	maker_name: string;
	maker_id: string;
	workno: string;
	work_type_string: string;
	regist_date: string;
	age_category_string: string;
	image_main: { relative_url: string };
	contents: { file_size_unit: string }[];
	pages?: string;
};
