export type TNamespace = {
  id: string;
  name: string;
  isOwner: boolean;
};

export type TNamespaceDetail = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  admins: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  isOwner: boolean;
};

export type TTag = {
  id: string;
  name: string;
};
