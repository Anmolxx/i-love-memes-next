import React from 'react';
import { Meme } from "@/utils/dtos/meme.dto";
import MemeCard from './MemeCard';
import CommentsSection from './CommentsSection';
import { CommentDto } from "@/utils/dtos/comment.dto";

interface MemeContentProps {
  meme: Meme;
  vote: (newVote: number) => void;
  shareMeme: () => Promise<void>;
  setFlagMemeId: (id: string | null) => void;
  comments: CommentDto[];
  isLoggedIn: boolean;
}

function MemeContent({
  meme,
  vote,
  shareMeme,
  setFlagMemeId,
  comments,
  isLoggedIn,
}: MemeContentProps) {

  return (
    <div className="flex-1 flex flex-row gap-4 md:flex-[3] min-w-0">
      <MemeCard
        meme={meme}
        vote={vote}
        shareMeme={shareMeme}
        setFlagMemeId={setFlagMemeId}
      />
      <CommentsSection
        comments={comments}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
export default React.memo(MemeContent);