export const constant = {
  queryKeys: {
    all: [{ entity: "cdn" }] as const,
    size: () => [{ ...constant.queryKeys.all[0], scope: "size" }] as const,
    image: (filename: string) =>
      [{ ...constant.queryKeys.all[0], scope: "file-data", filename }] as const,
    dimensions: (height: number, width: number) =>
      [{ ...constant.queryKeys.all[0], scope: "aaaa", height, width }] as const,
    images: (type: "documents" | "images") =>
      [{ ...constant.queryKeys.all[0], scope: "files", type }] as const,
    users: "users",
    registrationEnabled: "registration-enabled",
    dashboard: "dashboard",
  },
};
