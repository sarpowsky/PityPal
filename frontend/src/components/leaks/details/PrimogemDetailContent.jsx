// Path: src/components/leaks/details/PrimogemDetailContent.jsx
import React from 'react';
import SafeImage from '../../../components/SafeImage';

const PrimogemDetailContent = ({ versionData }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="max-w-full overflow-auto">
        <SafeImage
          src={versionData.primogemCount}
          alt={`Version ${versionData.version} Primogem Count`}
          className="max-w-4xl w-full h-auto object-contain"
          fallbackSrc="/images/primogems/placeholder.png"
        />
      </div>
      
      <p className="text-sm text-white/60 text-center">
        This shows the estimated primogem count for Version {versionData.version}.
        All values are subject to change based on in-game events and rewards.
      </p>
    </div>
  );
};

export default PrimogemDetailContent;