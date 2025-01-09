export const setNamespaceName = async (namespaceId: string, name: string) => {
  const response = await fetch(`/api/ns/${namespaceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  }).then((res) => res.json());
  if (response.status === "error") {
    throw new Error(response.error);
  }
  return response.namespace;
}
