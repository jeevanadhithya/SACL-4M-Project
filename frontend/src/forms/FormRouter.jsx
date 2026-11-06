import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChangeRequisitionForm from "./ChangeRequisitionForm";
import FeasibilityReport from "./FeasibilityReport";
import RiskAnalysisCheckSheet from "./RiskAnalysisCheckSheet";
import TimingPlan from "./TimingPlan";
import ChecklistTrackingPart1 from "./ChecklistTrackingPart1";
import ChecklistTrackingPart2 from "./ChecklistTrackingPart2";
import ChecklistTrackingPart3 from "./ChecklistTrackingPart3";
import ChecklistTrackingPart4 from "./ChecklistTrackingPart4";
import PtrInitiationForm from "./PtrInitiationForm";
import PpapInitiationForm from "./PpapInitiationForm";
import Header from "../components/Header";

const formMapping = {
  "change-requisition": <ChangeRequisitionForm />,
  "feasibility-report": <FeasibilityReport />,
  "risk-analysis": <RiskAnalysisCheckSheet />,
  "timing-plan": <TimingPlan />,
  "change-tracking-1": <ChecklistTrackingPart1 />,
  "change-tracking-2": <ChecklistTrackingPart2 />,
  "change-tracking-3": <ChecklistTrackingPart3 />,
  "change-tracking-4": <ChecklistTrackingPart4 />,
  "ptr-initiation": <PtrInitiationForm />,
  "ppap-initiation": <PpapInitiationForm />
};

const FormRouter = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  if (formMapping[formId]) {
    return formMapping[formId];
  }

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center border-4 border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 uppercase mb-2">Form Not Found</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            The requested form identifier <span className="font-mono font-bold text-orange-600">"{formId}"</span> does not exist in the consultancy catalog.
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="bg-[#ff9100] hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl uppercase text-xs tracking-wider transition-all shadow"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormRouter;
