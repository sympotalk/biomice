import { redirect } from "next/navigation";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { HospitalDoctorList } from "./HospitalDoctorList";
import { HOSPITAL_META } from "@/lib/crawler/hospitals";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { code } = await params;
  const hospital = HOSPITAL_META.find((h) => h.code === code);
  return { title: `${hospital?.name ?? code} 의료진 · BioMICE` };
}

export default async function HospitalDoctorsPage({ params }: { params: Params }) {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/browse");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const { code } = await params;
  const hospital = HOSPITAL_META.find((h) => h.code === code);

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <HospitalDoctorList code={code} hospitalName={hospital?.name ?? code} />
      </main>
      <Footer />
    </>
  );
}
