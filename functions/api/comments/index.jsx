import FeedDb from "../../../edge-src/models/FeedDb";
import {randomShortUUID} from "../../../common-src/StringUtils";
import {STATUSES} from "../../../common-src/Constants";

export async function onRequestPost({env, request}) {
  try {
    const body = await request.json();
    const {item_id, author_email, content} = body;

    if (!item_id || !content) {
      return new Response(JSON.stringify({error: 'Missing required fields'}), {
        status: 400,
        headers: {'Content-Type': 'application/json'}
      });
    }

    const feedDb = new FeedDb(env, request);

    // Validate that the item exists
    const itemsResult = await feedDb.FEED_DB.prepare(
      "SELECT id FROM items WHERE id = ? AND status IN (1, 2)"
    ).bind(item_id).first();

    if (!itemsResult) {
      return new Response(JSON.stringify({error: 'Item not found'}), {
        status: 404,
        headers: {'Content-Type': 'application/json'}
      });
    }

    // Create comment
    const commentId = randomShortUUID();
    const insertStatement = feedDb.getInsertSql('comments', {
      id: commentId,
      item_id,
      author_email: author_email || null,
      content,
      status: STATUSES.PUBLISHED,
    });

    await insertStatement.run();

    // Send email notification
    if (env.NOTIFICATION_EMAIL) {
      try {
        await sendEmailNotification(env, {
          item_id,
          author_email,
          content,
          comment_id: commentId
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    return new Response(JSON.stringify({
      id: commentId,
      item_id,
      author_email,
      content,
      status: STATUSES.PUBLISHED,
      created_at: new Date().toISOString()
    }), {
      status: 201,
      headers: {'Content-Type': 'application/json'}
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(JSON.stringify({error: 'Internal server error'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'}
    });
  }
}

async function sendEmailNotification(env, commentData) {
  const emailContent = `
New comment on your microfeed:

Item ID: ${commentData.item_id}
Author Email: ${commentData.author_email || 'Anonymous'}
Content: ${commentData.content}

Comment ID: ${commentData.comment_id}
Time: ${new Date().toISOString()}
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'help@baballm.com',
      to: [env.NOTIFICATION_EMAIL],
      subject: 'New comment on your microfeed',
      text: emailContent,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }
}