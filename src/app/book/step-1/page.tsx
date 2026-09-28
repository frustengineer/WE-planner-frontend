import { StepOneClient } from "./step-one-client";
import { JUNGLES } from "@/lib/jungles";

export default function StepOnePage() {
  return <StepOneClient jungles={JUNGLES} />;
}
