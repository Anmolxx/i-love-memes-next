import React from "react";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  zoom: number;
  rotation: number;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onResetImage: () => void;
}

const ImageControls: React.FC<Props> = ({
  zoom,
  rotation,
  onZoomChange,
  onRotationChange,
  onResetImage,
}) => {
  return (
    <>
      <Separator />
      <h3 className="font-semibold text-gray-800 p-1">Image Controls</h3>
      <Separator />
      <div className="p-4 space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <div className="flex items-center">
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
                // className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-sm"
              >
                <ZoomIn size={30} />
              </Button>
              <Button
                variant={"ghost"}
                size={"icon-sm"}
                onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                // className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center text-sm"
              >
                <ZoomOut size={30} />
              </Button>
            </div>
          </div>
          <Slider
            value={[zoom]}
            onValueChange={(value) => onZoomChange(value[0])}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Rotation: {Math.round(rotation)}°
            </label>
            <Button
              variant={"ghost"}
              size={"icon-sm"}
              onClick={() => {
                const currentRotation = Math.round(rotation);
                const nextRotation = (currentRotation + 90) % 360;
                onRotationChange(nextRotation);
              }}
            >
              <RotateCcw size={16} />
            </Button>
          </div>
          <Slider
            value={[rotation]}
            onValueChange={(value) => onRotationChange(value[0])}
            min={-180}
            max={180}
            step={1}
            className="w-full"
          />
        </div>

        {/* Add Image Button */}
        {/* <div className="pt-2">
        <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 text-sm transition-colors">
          Add another image
        </button>
      </div> */}

        {/* Reset Button */}
        {/* <button
        onClick={onResetImage}
        className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors"
      >
        Reset Image
      </button> */}
      </div>
    </>
  );
};

export default ImageControls;
