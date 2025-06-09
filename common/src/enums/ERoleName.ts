export const ERoleName = {
	restricted: "restricted",
	signed: "signed",
	holder: "holder",
	comunity_creator: "comunity_creator",
};

export type ERoleName = (typeof ERoleName)[keyof typeof ERoleName];
