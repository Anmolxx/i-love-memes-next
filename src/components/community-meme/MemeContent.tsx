import React, { ReactNode } from 'react';
import { Meme } from "@/utils/types/meme";
import MemeCard from './MemeCard';
import CommentsSection from './comments/CommentsSection';
import MemeActionsSidebar from './MemeActionsSidebar';
import { CommentEntity } from "@/utils/types/comment";

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
    
    <div
      className="
        flex-1 flex flex-col
        md:grid 
        md:grid-cols-[2fr_3fr]
        gap-6 
        min-w-0 
        items-start">

      <div className="
        order-1 
        md:col-start-1 
        w-full 
        md:sticky md:top-6 md:self-start 
        flex flex-col 
        gap-6
      ">
        <MemeCard
          meme={meme}
          vote={vote}
          shareMeme={shareMeme}
          setFlagMemeId={setFlagMemeId}
        />
        
        <MemeActionsSidebar meme={meme} handleCaptionClick={handleCaptionClick} />
      </div>

      <div className="order-2 md:col-start-2 w-full">
        <CommentsSection
          comments={comments}
          isLoggedIn={isLoggedIn}
          memeIdentifier={memeId}
        />
      </div>

    </div>
  );
}

export default React.memo(MemeContent);