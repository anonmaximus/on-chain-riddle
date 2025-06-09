export const ERuleName = {
	pixel_read: "pixel_read",
	pixel_create: "pixel_create",
};

export type ERuleName = (typeof ERuleName)[keyof typeof ERuleName];
