import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function InviteCodePage({ params }: Props) {
  const { code } = await params;
  redirect(`/invite?code=${code}`);
}
