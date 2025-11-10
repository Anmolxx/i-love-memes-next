import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface Props {
  onReset: () => void;
}

const CanvasControls: React.FC<Props> = ({ onReset }) => {
  console.log("CanvasControls rendered with reset only");

  return (
    <div className="p-4 space-y-4 bg-[#f9f9f9]">
      <h3 className="font-semibold text-gray-800 mb-3">Canvas Controls</h3>

      <div className="flex items-center justify-center space-x-2">
        <Button
          onClick={onReset}
          className="w-32 rounded-full h-12 border-[#1E085C] text-[#1E085C]"
          variant="outline"
        >
          Reset
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasControls;
