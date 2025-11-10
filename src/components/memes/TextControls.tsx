// import React, { useState, useEffect } from "react";
// import { Textbox, Shadow } from "fabric";

// interface Props {
//   activeObject: Textbox;
//   onChange: (updates: Partial<Textbox>) => void;
// }

// const TextControls: React.FC<Props> = ({ activeObject, onChange }) => {
//   const [inputText, setInputText] = useState(activeObject.text || "");
//   const [fontSize, setFontSize] = useState(activeObject.fontSize || 28);
//   const [opacity, setOpacity] = useState(activeObject.opacity || 1);
//   const [mode, setMode] = useState<"shadow" | "outline">("shadow");
//   const [shadowBlur, setShadowBlur] = useState(activeObject.shadow?.blur || 0);
//   const [outlineWidth, setOutlineWidth] = useState(activeObject.strokeWidth || 0);
//   const [globalWidth, setGlobalWidth] = useState(mode === "shadow" ? shadowBlur : outlineWidth);
//   const [globalColor, setGlobalColor] = useState(
//     activeObject.shadow?.color || (activeObject.stroke as string) || "#000000"
//   );
//   const [shadowOffsetX, setShadowOffsetX] = useState(activeObject.shadow?.offsetX || 0);
//   const [shadowOffsetY, setShadowOffsetY] = useState(activeObject.shadow?.offsetY || 0);
//   const [textColor, setTextColor] = useState(activeObject.fill as string || "#000000");

//   // Sync input text with activeObject
//   useEffect(() => {
//     setInputText(activeObject.text || "");
//   }, [activeObject]);

//   // Update globalWidth when mode changes
//   useEffect(() => {
//     setGlobalWidth(mode === "shadow" ? shadowBlur : outlineWidth);
//   }, [mode]);

//   // Font size & opacity updates
//   useEffect(() => {
//     activeObject.set("fontSize", fontSize);
//     activeObject.set("opacity", opacity);
//     activeObject.canvas?.renderAll();
//   }, [fontSize, opacity]);

//   // Shadow/Outline updates
//   useEffect(() => {
//     if (mode === "shadow") {
//       const shadow = new Shadow({
//         color: globalColor,
//         blur: globalWidth,
//         offsetX: shadowOffsetX,
//         offsetY: shadowOffsetY,
//         affectStroke: false,
//         nonScaling: true,
//       });
//       activeObject.set("shadow", shadow);
//       activeObject.set("strokeWidth", 0);
//     } else {
//       activeObject.set({ stroke: globalColor, strokeWidth: globalWidth });
//       activeObject.set("shadow", null);
//     }
//     activeObject.canvas?.renderAll();
//   }, [globalWidth, globalColor, shadowOffsetX, shadowOffsetY, mode]);

//   // Text color
//   useEffect(() => {
//     activeObject.set("fill", textColor);
//     activeObject.canvas?.renderAll();
//   }, [textColor]);

//   const handleWidthChange = (value: number) => {
//     setGlobalWidth(value);
//     if (mode === "shadow") setShadowBlur(value);
//     else setOutlineWidth(value);
//   };

//   const removeText = () => activeObject.canvas?.remove(activeObject);

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xl flex flex-wrap gap-4 justify-between">
//       {/* Left column */}
//       <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
//         <label className="text-sm font-medium text-gray-700">Text</label>
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => {
//             setInputText(e.target.value);
//             onChange({ text: e.target.value });
//           }}
//           className="w-full px-2 py-1 border rounded-lg text-sm text-black"
//         />

//         <label className="text-sm font-medium text-gray-700">Font Size: {fontSize}</label>
//         <input
//           type="range"
//           min={12}
//           max={120}
//           value={fontSize}
//           onChange={(e) => setFontSize(parseInt(e.target.value))}
//           className="w-full"
//         />

//         <label className="text-sm font-medium text-gray-700">Opacity: {opacity}</label>
//         <input
//           type="range"
//           min={0}
//           max={1}
//           step={0.01}
//           value={opacity}
//           onChange={(e) => setOpacity(parseFloat(e.target.value))}
//           className="w-full"
//         />

//         <label className="text-sm font-medium text-gray-700">Text Color</label>
//         <input
//           type="color"
//           value={textColor}
//           onChange={(e) => setTextColor(e.target.value)}
//           className="w-full h-8 rounded-lg cursor-pointer"
//         />
//       </div>

//       {/* Right column */}
//       <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
//         {/* Shadow / Outline Selector */}
//         <div className="flex gap-2 items-center text-sm text-black">
//           <label>
//             <input
//               type="radio"
//               value="shadow"
//               checked={mode === "shadow"}
//               onChange={() => setMode("shadow")}
//             />{" "}
//             Shadow
//           </label>
//           <label>
//             <input
//               type="radio"
//               value="outline"
//               checked={mode === "outline"}
//               onChange={() => setMode("outline")}
//             />{" "}
//             Outline
//           </label>
//         </div>

//         {/* Global Color */}
//         <label className="text-sm font-medium text-gray-700">Shadow/Outline Color</label>
//         <input
//           type="color"
//           value={globalColor}
//           onChange={(e) => setGlobalColor(e.target.value)}
//           className="w-full h-8 rounded-lg cursor-pointer"
//         />

//         {/* Global Width */}
//         <label className="text-sm font-medium text-gray-700">
//           {mode === "shadow" ? "Shadow Blur" : "Outline Width"}: {globalWidth}
//         </label>
//         <input
//           type="range"
//           min={0}
//           max={9}
//           value={globalWidth}
//           onChange={(e) => handleWidthChange(parseInt(e.target.value))}
//           className="w-full"
//         />

//         {/* Shadow Offsets only if shadow */}
//         {mode === "shadow" && (
//           <>
//             <label className="text-sm font-medium text-gray-700">Offset X: {shadowOffsetX}</label>
//             <input
//               type="range"
//               min={-50}
//               max={50}
//               value={shadowOffsetX}
//               onChange={(e) => setShadowOffsetX(parseInt(e.target.value))}
//               className="w-full"
//             />

//             <label className="text-sm font-medium text-gray-700">Offset Y: {shadowOffsetY}</label>
//             <input
//               type="range"
//               min={-50}
//               max={50}
//               value={shadowOffsetY}
//               onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
//               className="w-full"
//             />
//           </>
//         )}

//         {/* Remove Text Button */}
//         <button
//           onClick={removeText}
//           className="mt-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
//         >
//           Remove Text
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TextControls;
