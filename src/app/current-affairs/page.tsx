import { fetchCurrentAffairs } from '@/lib/fetchCurrentAffairs';
import { fetchOfficialPDFLinks } from '@/lib/fetchOfficialPDFs';
import CurrentAffairsClient from './CurrentAffairsClient';

export const revalidate = 3600;

export default async function CurrentAffairsPage() {
  const [articles, officialPDFs] = await Promise.all([
    fetchCurrentAffairs(),
    fetchOfficialPDFLinks(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <CurrentAffairsClient articles={articles} officialPDFs={officialPDFs} />
    </div>
  );
}
