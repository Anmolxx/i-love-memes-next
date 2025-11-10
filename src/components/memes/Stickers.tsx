import React, { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

interface Props {
  onStickerSelect: (sticker: string) => void;  // for emojis
  onImageUpload: (imageDataUrl: string) => void; // always called when uploading image
}

const stickers = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
];

const Stickers: React.FC<Props> = ({ onStickerSelect, onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          onImageUpload(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Separator />
      <div className="flex items-center justify-between p-1">
        <h3 className="font-semibold text-gray-800 text-lg">Stickers</h3>

        {/* Add Image Button - always visible */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
          variant="outline"
        >
          Add Image
          <ImagePlus className="w-4 h-4 ml-2" />
        </Button>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Separator />

      <div className="rounded-lg p-4">
        <div className="grid grid-cols-8 gap-2">
          {stickers.map((sticker, index) => (
            <button
              key={index}
              onClick={() => onStickerSelect(sticker)}
              className="w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-lg flex items-center justify-center transition-colors"
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Stickers;
