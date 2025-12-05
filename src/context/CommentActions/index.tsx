import React, { createContext, useContext } from 'react';

interface CommentActionsContextType {
  memeId: string;
}

const CommentActionsContext = createContext<CommentActionsContextType | null>(null);

export const useCommentActions = () => {
  const context = useContext(CommentActionsContext);
  if (!context) {
    throw new Error('useCommentActions must be used within a CommentActionsProvider');
  }
  return context;
};

interface CommentActionsProviderProps {
    children: React.ReactNode;
    actions: CommentActionsContextType;
}

export const CommentActionsProvider: React.FC<CommentActionsProviderProps> = ({ children, actions }) => {
    return (
        <CommentActionsContext.Provider value={actions}>
            {children}
        </CommentActionsContext.Provider>
    );
};