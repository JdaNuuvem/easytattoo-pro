import { useBookingStore } from "@/stores/booking";
import { STEPS } from "@/stores/bookingStateMachine";

const SIZE_STEP_INDEX = STEPS.indexOf("size");
const SHADING_STEP_INDEX = STEPS.indexOf("shading");

export function useBookingNavigation() {
  const { currentStep, maxStep, setStep, tattooDetails } = useBookingStore();

  const isClosure = tattooDetails.type === "closure";

  const shouldSkipStep = (stepIndex: number): boolean => {
    if (!isClosure) return false;
    return stepIndex === SIZE_STEP_INDEX || stepIndex === SHADING_STEP_INDEX;
  };

  const getNextValidStep = (fromStep: number): number => {
    let next = fromStep + 1;
    while (next <= maxStep && shouldSkipStep(next)) {
      next++;
    }
    return Math.min(next, maxStep);
  };

  const getPreviousValidStep = (fromStep: number): number => {
    let prev = fromStep - 1;
    while (prev >= 0 && shouldSkipStep(prev)) {
      prev--;
    }
    return Math.max(prev, 0);
  };

  const goToNextStep = () => {
    if (currentStep < maxStep) {
      setStep(getNextValidStep(currentStep));
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setStep(getPreviousValidStep(currentStep));
    }
  };

  return {
    goToNextStep,
    goToPreviousStep,
    currentStep,
    maxStep,
  };
}
