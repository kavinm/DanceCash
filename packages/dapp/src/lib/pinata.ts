const PINATA_UPLOAD_ENDPOINT = "https://uploads.pinata.cloud/v3/files";

const getJwt = () => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT is not configured");
  }
  return jwt;
};

export interface PinataUploadResponse {
  id: string;
  name: string;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
}

const uploadFormData = async (form: FormData): Promise<PinataUploadResponse> => {
  const jwt = getJwt();
  form.append("network", "public");

  const response = await fetch(PINATA_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: form,
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error || payload?.message || "Pinata upload failed";
    throw new Error(message);
  }

  return payload?.data ?? payload;
};

export const uploadFileFromUrl = async (url: string, name: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}`);
  }

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const blob = new Blob([buffer], { type: contentType });
  const file = new File([blob], name, { type: contentType });

  const form = new FormData();
  form.append("file", file);
  form.append("name", name);

  return uploadFormData(form);
};

export const uploadJson = async (fileName: string, data: any) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], fileName.endsWith(".json") ? fileName : `${fileName}.json`, {
    type: "application/json",
  });

  const form = new FormData();
  form.append("file", file);
  form.append("name", file.name);

  return uploadFormData(form);
};


