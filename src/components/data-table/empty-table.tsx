import Image from "next/image";

interface EmptyTableProps {
  title?: string;
  showTitle: boolean;
}
export default function EmptyTable({
  title,
  showTitle = false,
}: EmptyTableProps) {
  return (
    <div className="rounded-md bg-background shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
      {showTitle && <h3 className="text-2xl font-bold p-6 pb-0">{title}</h3>}

      <div className="flex items-center justify-center h-[70vh]">
        <Image
          src="/assets/no-data.png"
          width={150}
          height={150}
          alt="No data found"
        />
      </div>
    </div>
  );
}
