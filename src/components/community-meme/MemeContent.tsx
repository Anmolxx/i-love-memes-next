import React from 'react';
import { Meme } from "@/utils/dtos/meme.dto";
import MemeCard from './MemeCard';
import CommentsSection from './CommentsSection';
import MemeActionsSidebar from './MemeActionsSidebar';
import { CommentDto } from "@/utils/dtos/comment.dto";

interface MemeContentProps {
  meme: Meme;
  vote: (newVote: number) => void;
  shareMeme: (meme: Meme) => Promise<void>;
  setFlagMemeId: (id: string | null) => void;
  comments: CommentDto[];
  isLoggedIn: boolean;
  handleCaptionClick: () => void;
}

function MemeContent({
  meme,
  vote,
  shareMeme,
  setFlagMemeId,
  comments,
  isLoggedIn,
  handleCaptionClick,
}: MemeContentProps) {

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[2fr_3fr] gap-6 min-w-0 items-stretch">
      {/*
        Mobile DOM order: 1) MemeCard, 2) CommentsSection, 3) MemeActionsSidebar
        Desktop (md+): layout becomes a 2-col grid where MemeCard + MemeActionsSidebar
        are placed in the left column (stacked) and CommentsSection occupies the right column.
      */}

      {/* Meme card — mobile first (order 1). On md it lives in column 1 */}
      <div className="order-1 md:col-start-1 md:col-end-2">
        <MemeCard
          meme={meme}
          vote={vote}
          shareMeme={shareMeme}
          setFlagMemeId={setFlagMemeId}
        />
      </div>

      {/* Comments — mobile order 2. On md it becomes the right column and spans both rows */}
      <div className="order-2 md:col-start-2 md:col-end-3 md:row-span-2 w-full h-full overflow-auto">
        <CommentsSection
          comments={comments}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Actions — mobile order 3 (bottom). On md it sits under the card in the left column */}
      <div className="order-3 md:col-start-1 md:col-end-2 md:row-start-2 mt-0 md:mt-auto w-full">
        <MemeActionsSidebar meme={meme} handleCaptionClick={handleCaptionClick} />
      </div>
    </div>
  );
}
export default React.memo(MemeContent);