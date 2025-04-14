export const sanitizeFileName = (file: File) => {
  const ext = file.name.split(".").pop();
  const base = file.name.replace(/\.[^/.]+$/, "").replace(/\./g, "-");
  const newName = `${base}.${ext}`;
  return new File([file], newName, { type: file.type });
};
