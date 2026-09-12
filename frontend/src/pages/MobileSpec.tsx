import HeaderHero from '../components/mobile/HeaderHero';
import SafetyProtocol from '../components/mobile/SafetyProtocol';
import OutputSchema from '../components/mobile/OutputSchema';
import PlanRanking from '../components/mobile/PlanRanking';
import DataArtifacts from '../components/mobile/DataArtifacts';
import SubmissionCTAs from '../components/mobile/SubmissionCTAs';
import BottomNav from '../components/mobile/BottomNav';

export default function MobileSpec() {
  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto min-h-screen relative overflow-x-hidden bg-[#051424] text-white border-x border-slate-800/50 pb-20">
      <HeaderHero />
      <div className="px-4 md:px-8 space-y-6 md:space-y-10">
        <SafetyProtocol />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OutputSchema />
          <PlanRanking />
        </div>
        <DataArtifacts />
        <SubmissionCTAs />
      </div>
      <BottomNav />
    </div>
  );
}
