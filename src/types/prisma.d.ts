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

export type TServiceAccounts = {
  id: string;
  name: string;
  service: string;
  icon?: string;
};

export type TAvailableGroup = {
  id: string;
  name: string;
  href?: string;
  icon?: string;
};
