import { GroupList } from "./components/GroupList";
import { CreateNSForm } from "./components/CreateNSForm";

export default async function GroupManagement() {
  return (
    <div className={"py-8 mx-auto w-5/6"}>
      <h1 className="text-2xl font-bold mb-5">グループ管理</h1>
      <GroupList />
      <CreateNSForm />
    </div>
  );
}
