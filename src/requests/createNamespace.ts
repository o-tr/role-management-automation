export const createNamespace = async (
  name: string,
): Promise<{ id: string; name: string; isOwner: boolean }> => {
  const response = await fetch("/api/ns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  }).then((res) => res.json());
  if (response.status === "error") {
    throw new Error(response.error);
  }
  return response.namespace;
};
