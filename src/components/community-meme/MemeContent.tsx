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
    <div className="flex-1 flex flex-col md:flex-row gap-6 md:flex-[3] min-w-0 items-stretch">
      {/* Mobile order: actions (first), meme card (second), comments (third).
          Desktop: left column (card + actions stacked with card on top), right column comments. */}

      {/* Left column (desktop): contains card and actions; on mobile we swap their order */}
      <div className="w-full md:w-2/5 flex flex-col gap-4">
        <div className="order-2 md:order-1">
          <MemeCard
            meme={meme}
            vote={vote}
            shareMeme={shareMeme}
            setFlagMemeId={setFlagMemeId}
          />
        </div>

        <div className="order-1 md:order-2 mt-0 md:mt-auto w-full">
          <MemeActionsSidebar meme={meme} handleCaptionClick={handleCaptionClick} />
        </div>
      </div>

      {/* Right column: comments section (always after left column on mobile) */}
      <div className="w-full md:w-3/5 h-full order-3 md:order-2">
        <CommentsSection
          comments={comments}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
export default React.memo(MemeContent);