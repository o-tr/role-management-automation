import { CreateNSForm } from "./components/CreateNSForm";
import { GroupList } from "./components/GroupList";

export default async function GroupManagement() {
  return (
    <div className={"py-8 mx-auto w-5/6"}>
      <h1 className="text-2xl font-bold mb-5">ネームスペース管理</h1>
      <GroupList />
      <CreateNSForm />
    </div>
  );
}
