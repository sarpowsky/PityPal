import React from 'react';
import PredictionForm from './PredictionForm';
import PredictionResults from './PredictionResults';

const PredictionsTab = ({
  currentBanner,
  handleBannerChange,
  currentPity,
  setCurrentPity,
  isGuaranteed,
  setIsGuaranteed,
  numPulls,
  setNumPulls,
  handleTrainModel,
  handleSimplePrediction,
  isTraining,
  loading,
  error,
  predictions,
  quickMode,
  getSoftPity,
  getHardPity,
  getBannerName
}) => {
  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <PredictionForm
        currentBanner={currentBanner}
        handleBannerChange={handleBannerChange}
        currentPity={currentPity}
        setCurrentPity={setCurrentPity}
        isGuaranteed={isGuaranteed}
        setIsGuaranteed={setIsGuaranteed}
        numPulls={numPulls}
        setNumPulls={setNumPulls}
        handleTrainModel={handleTrainModel}
        handleSimplePrediction={handleSimplePrediction}
        isTraining={isTraining}
        loading={loading}
        getSoftPity={getSoftPity}
      />

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400">
          {error}
        </div>
      )}

      {/* Prediction Results */}
      {predictions && !loading && (
        <PredictionResults
          predictions={predictions}
          quickMode={quickMode}
          getBannerName={getBannerName}
          getSoftPity={getSoftPity}
          getHardPity={getHardPity}
        />
      )}
    </div>
  );
};

export default PredictionsTab; 