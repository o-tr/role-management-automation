import type {
  FNamespaceWithOwnerAndAdmins,
  TNamespaceWithOwnerAndAdmins,
} from "@/types/prisma";
import { filterFUser } from "./filterFUser";

export const filterFNamespaceWithOwnerAndAdmins = (
  namespace: TNamespaceWithOwnerAndAdmins,
): FNamespaceWithOwnerAndAdmins => {
  return {
    id: namespace.id,
    name: namespace.name,
    owner: filterFUser(namespace.owner),
    admins: namespace.admins.map(filterFUser),
  };
};
