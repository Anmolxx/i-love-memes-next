import React, { ReactNode } from 'react';
import { Meme } from "@/utils/dtos/meme.dto";
import MemeCard from './MemeCard';
import CommentsSection from './comments/CommentsSection';
import MemeActionsSidebar from './MemeActionsSidebar';
import { CommentEntity } from "@/utils/dtos/comment.dto";

interface MemeContentProps {
  meme: Meme;
  vote: (newVote: number) => void;
  shareMeme: (meme: Meme) => Promise<void>;
  setFlagMemeId: (id: string | null) => void;
  comments: CommentEntity[];
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

  const memeId = meme?.slug || meme?.id;

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[2fr_3fr] gap-6 min-w-0 items-stretch">
      <div className="order-1 md:col-start-1 md:col-end-2">
        <MemeCard
          meme={meme}
          vote={vote}
          shareMeme={shareMeme}
          setFlagMemeId={setFlagMemeId}
        />
      </div>

      <div className="order-2 md:col-start-2 md:col-end-3 md:row-span-2 w-full h-full overflow-auto">
        <CommentsSection
          comments={comments}
          isLoggedIn={isLoggedIn}
          memeIdentifier={memeId}
        />
      </div>

      <div className="order-3 md:col-start-1 md:col-end-2 md:row-start-2 mt-0 md:mt-auto w-full">
        <MemeActionsSidebar meme={meme} handleCaptionClick={handleCaptionClick} />
      </div>
    </div>
  );
}
export default React.memo(MemeContent);