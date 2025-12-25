import prisma from '../config/database';
import {
    Like,
    LikeWithUser,
    LikeStatus,
    LikeCounts,
    LikeRequest,
    LikeWithCounts
} from '../types/like';

/**
 * Likes or dislikes a comment, or removes an existing like/dislike.
 *
 * @param commentId - The unique identifier of the comment
 * @param userId - The unique identifier of the user
 * @param type - The type of like action ('like' or 'dislike')
 * @returns Promise<LikeWithCounts> - The like action result with updated counts
 * @throws Error if comment is not found or if the operation fails
 */
export const likeComment = async (commentId: string, userId: string, type: 'like' | 'dislike'): Promise<LikeWithCounts> => {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            throw new Error('Comment not found');
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            }
        });

        if (existingLike) {
            if (existingLike.type === type) {
                await prisma.like.delete({
                    where: {
                        id: existingLike.id
                    }
                });

                const deletedLike: LikeWithUser = {
                    id: existingLike.id,
                    userId: existingLike.userId,
                    commentId: existingLike.commentId,
                    replyId: existingLike.replyId ?? undefined,
                    type: existingLike.type,
                    createdAt: existingLike.createdAt,
                    user: {
                        id: userId,
                        username: '',
                        name: undefined
                    }
                };

                const counts = await getCommentLikeCounts(commentId);
                return { like: deletedLike, counts };
            } else {
                const updatedLike = await prisma.like.update({
                    where: {
                        id: existingLike.id
                    },
                    data: {
                        type
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true
                            }
                        }
                    }
                });

                const likeWithUser: LikeWithUser = {
                    id: updatedLike.id,
                    userId: updatedLike.userId,
                    commentId: updatedLike.commentId,
                    replyId: updatedLike.replyId ?? undefined,
                    type: updatedLike.type as 'like' | 'dislike',
                    createdAt: updatedLike.createdAt,
                    user: {
                        id: updatedLike.user.id,
                        username: updatedLike.user.username,
                        name: updatedLike.user.name ?? undefined
                    }
                };

                const counts = await getCommentLikeCounts(commentId);
                return { like: likeWithUser, counts };
            }
        }

        const newLike = await prisma.like.create({
            data: {
                userId,
                commentId,
                type
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });

        const likeWithUser: LikeWithUser = {
            id: newLike.id,
            userId: newLike.userId,
            commentId: newLike.commentId,
            replyId: newLike.replyId ?? undefined,
            type: newLike.type as 'like' | 'dislike',
            createdAt: newLike.createdAt,
            user: {
                id: newLike.user.id,
                username: newLike.user.username,
                name: newLike.user.name ?? undefined
            }
        };

        const counts = await getCommentLikeCounts(commentId);
        return { like: likeWithUser, counts };
    } catch (error) {
        throw new Error(`Failed to ${type} comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Likes or dislikes a reply, or removes an existing like/dislike.
 *
 * @param replyId - The unique identifier of the reply
 * @param userId - The unique identifier of the user
 * @param type - The type of like action ('like' or 'dislike')
 * @returns Promise<LikeWithCounts> - The like action result with updated counts
 * @throws Error if reply is not found or if the operation fails
 */
export const likeReply = async (replyId: string, userId: string, type: 'like' | 'dislike'): Promise<LikeWithCounts> => {
    try {
        const reply = await prisma.reply.findUnique({
            where: { id: replyId }
        });

        if (!reply) {
            throw new Error('Reply not found');
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_replyId: {
                    userId,
                    replyId
                }
            }
        });

        if (existingLike) {
            if (existingLike.type === type) {
                await prisma.like.delete({
                    where: {
                        id: existingLike.id
                    }
                });

                const deletedLike: LikeWithUser = {
                    id: existingLike.id,
                    userId: existingLike.userId,
                    commentId: existingLike.commentId,
                    replyId: existingLike.replyId ?? undefined,
                    type: existingLike.type,
                    createdAt: existingLike.createdAt,
                    user: {
                        id: userId,
                        username: '',
                        name: undefined
                    }
                };

                const counts = await getReplyLikeCounts(replyId);
                return { like: deletedLike, counts };
            } else {
                const updatedLike = await prisma.like.update({
                    where: {
                        id: existingLike.id
                    },
                    data: {
                        type
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                name: true
                            }
                        }
                    }
                });

                const likeWithUser: LikeWithUser = {
                    id: updatedLike.id,
                    userId: updatedLike.userId,
                    commentId: updatedLike.commentId,
                    replyId: updatedLike.replyId ?? undefined,
                    type: updatedLike.type as 'like' | 'dislike',
                    createdAt: updatedLike.createdAt,
                    user: {
                        id: updatedLike.user.id,
                        username: updatedLike.user.username,
                        name: updatedLike.user.name ?? undefined
                    }
                };

                const counts = await getReplyLikeCounts(replyId);
                return { like: likeWithUser, counts };
            }
        }

        const newLike = await prisma.like.create({
            data: {
                userId,
                replyId,
                commentId: reply.commentId,
                type
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });

        const likeWithUser: LikeWithUser = {
            id: newLike.id,
            userId: newLike.userId,
            commentId: newLike.commentId,
            replyId: newLike.replyId ?? undefined,
            type: newLike.type as 'like' | 'dislike',
            createdAt: newLike.createdAt,
            user: {
                id: newLike.user.id,
                username: newLike.user.username,
                name: newLike.user.name ?? undefined
            }
        };

        const counts = await getReplyLikeCounts(replyId);
        return { like: likeWithUser, counts };
    } catch (error) {
        throw new Error(`Failed to ${type} reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Removes a like or dislike from a comment.
 *
 * @param commentId - The unique identifier of the comment
 * @param userId - The unique identifier of the user
 * @returns Promise<void>
 * @throws Error if like is not found or if removal fails
 */
export const removeLikeFromComment = async (commentId: string, userId: string): Promise<void> => {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            }
        });

        if (!existingLike) {
            throw new Error('Like not found');
        }

        await prisma.like.delete({
            where: {
                id: existingLike.id
            }
        });
    } catch (error) {
        throw new Error(`Failed to remove like: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Removes a like or dislike from a reply.
 *
 * @param replyId - The unique identifier of the reply
 * @param userId - The unique identifier of the user
 * @returns Promise<void>
 * @throws Error if like is not found or if removal fails
 */
export const removeLikeFromReply = async (replyId: string, userId: string): Promise<void> => {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_replyId: {
                    userId,
                    replyId
                }
            }
        });

        if (!existingLike) {
            throw new Error('Like not found');
        }

        await prisma.like.delete({
            where: {
                id: existingLike.id
            }
        });
    } catch (error) {
        throw new Error(`Failed to remove like: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves the like and dislike counts for a comment.
 *
 * @param commentId - The unique identifier of the comment
 * @returns Promise<LikeCounts> - The like and dislike counts
 * @throws Error if retrieval fails
 */
export const getCommentLikeCounts = async (commentId: string): Promise<LikeCounts> => {
    try {
        const likesCount = await prisma.like.count({
            where: {
                commentId,
                replyId: null,
                type: 'like'
            }
        });

        const dislikesCount = await prisma.like.count({
            where: {
                commentId,
                replyId: null,
                type: 'dislike'
            }
        });

        const likeCounts: LikeCounts = {
            likesCount,
            dislikesCount
        };
        return likeCounts;
    } catch (error) {
        throw new Error(`Failed to get like counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves the like and dislike counts for a reply.
 *
 * @param replyId - The unique identifier of the reply
 * @returns Promise<LikeCounts> - The like and dislike counts
 * @throws Error if retrieval fails
 */
export const getReplyLikeCounts = async (replyId: string): Promise<LikeCounts> => {
    try {
        const likesCount = await prisma.like.count({
            where: {
                replyId,
                type: 'like'
            }
        });

        const dislikesCount = await prisma.like.count({
            where: {
                replyId,
                type: 'dislike'
            }
        });

        const likeCounts: LikeCounts = {
            likesCount,
            dislikesCount
        };
        return likeCounts;
    } catch (error) {
        throw new Error(`Failed to get like counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves the like status of a specific user for a comment.
 *
 * @param commentId - The unique identifier of the comment
 * @param userId - The unique identifier of the user
 * @returns Promise<LikeStatus> - The user's like status (hasLiked, hasDisliked)
 * @throws Error if retrieval fails
 */
export const getUserCommentLikeStatus = async (commentId: string, userId: string): Promise<LikeStatus> => {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId
                }
            }
        });

        const likeStatus: LikeStatus = {
            hasLiked: existingLike?.type === 'like',
            hasDisliked: existingLike?.type === 'dislike'
        };
        return likeStatus;
    } catch (error) {
        throw new Error(`Failed to get like status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves the like status of a specific user for a reply.
 *
 * @param replyId - The unique identifier of the reply
 * @param userId - The unique identifier of the user
 * @returns Promise<LikeStatus> - The user's like status (hasLiked, hasDisliked)
 * @throws Error if retrieval fails
 */
export const getUserReplyLikeStatus = async (replyId: string, userId: string): Promise<LikeStatus> => {
    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_replyId: {
                    userId,
                    replyId
                }
            }
        });

        const likeStatus: LikeStatus = {
            hasLiked: existingLike?.type === 'like',
            hasDisliked: existingLike?.type === 'dislike'
        };
        return likeStatus;
    } catch (error) {
        throw new Error(`Failed to get like status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves like counts for a comment with optional user status.
 *
 * @param commentId - The unique identifier of the comment
 * @param userId - Optional user ID to include their like status
 * @returns Promise<LikeCounts> - The like counts with optional user status
 * @throws Error if retrieval fails
 */
export const getCommentLikeCountsWithUserStatus = async (commentId: string, userId?: string): Promise<LikeCounts> => {
    try {
        const counts = await getCommentLikeCounts(commentId);

        if (userId) {
            const userStatus = await getUserCommentLikeStatus(commentId, userId);
            counts.userLikeStatus = userStatus;
        }

        return counts;
    } catch (error) {
        throw new Error(`Failed to get like counts with user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Retrieves like counts for a reply with optional user status.
 *
 * @param replyId - The unique identifier of the reply
 * @param userId - Optional user ID to include their like status
 * @returns Promise<LikeCounts> - The like counts with optional user status
 * @throws Error if retrieval fails
 */
export const getReplyLikeCountsWithUserStatus = async (replyId: string, userId?: string): Promise<LikeCounts> => {
    try {
        const counts = await getReplyLikeCounts(replyId);

        if (userId) {
            const userStatus = await getUserReplyLikeStatus(replyId, userId);
            counts.userLikeStatus = userStatus;
        }

        return counts;
    } catch (error) {
        throw new Error(`Failed to get like counts with user status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};