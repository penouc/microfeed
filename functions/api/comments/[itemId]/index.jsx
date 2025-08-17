import FeedDb from "../../../../edge-src/models/FeedDb";
import {STATUSES} from "../../../../common-src/Constants";

export async function onRequestGet({params, env, request}) {
  try {
    const {itemId} = params;

    if (!itemId) {
      return new Response(JSON.stringify({error: 'Item ID is required'}), {
        status: 400,
        headers: {'Content-Type': 'application/json'}
      });
    }

    const feedDb = new FeedDb(env, request);
    
    // Get comments for the item
    const comments = await feedDb.FEED_DB.prepare(
      `SELECT id, item_id, author_email, content, created_at 
       FROM comments 
       WHERE item_id = ? AND status = ? 
       ORDER BY created_at ASC`
    ).bind(itemId, STATUSES.PUBLISHED).all();

    const formattedComments = comments.results.map(comment => ({
      id: comment.id,
      item_id: comment.item_id,
      author_email: comment.author_email,
      content: comment.content,
      created_at: comment.created_at
    }));

    return new Response(JSON.stringify({
      item_id: itemId,
      comments: formattedComments,
      total: formattedComments.length
    }), {
      status: 200,
      headers: {'Content-Type': 'application/json'}
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
}