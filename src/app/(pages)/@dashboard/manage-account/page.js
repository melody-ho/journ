import getUser from "@/helper-functions/get-user";
import ManageAccountForm from "@/client-components/manage-account-form";

export default async function ManageAccount() {
  const userData = await getUser();

  return (
    <>
      <h1>Manage Account</h1>
      <ManageAccountForm userData={userData.dataValues} />
    </>
  );
}
