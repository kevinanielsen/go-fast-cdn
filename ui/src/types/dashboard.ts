type TDashboard = {
  config: { registration_enabled: boolean };
  files: {
    documents_count: number;
    images_count: number;
    recent_uploads: {
      filename: string;
      type: "doc" | "image";
      uploaded_at: string;
    }[];
    total_size_bytes: number;
  };
  security: { users_with_2fa: number };
  users: {
    admins: number;
    recent_registrations: [
      {
        created_at: string;
        email: string;
        role: string;
      }
    ];
    total: number;
    verified: number;
  };
};

export type { TDashboard };
