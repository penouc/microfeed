import React, { useState, useEffect } from 'react';
import { UserIcon, CalendarIcon, ChatBubbleLeftIcon } from '@heroicons/react/20/solid';

function parseMarkdown(text) {
  // Simple markdown parsing for basic features
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-slate-800">$1</code>')
    .replace(/\n/g, '<br>');
}

function CommentItem({ comment, isNew = false }) {
  const formattedDate = new Date(comment.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedContent = parseMarkdown(comment.content);
  const authorName = comment.author_email ? comment.author_email.split('@')[0] : 'Anonymous';
  
  return (
    <div style={{
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: isNew ? '#eff6ff' : 'white',
      borderColor: isNew ? '#bfdbfe' : '#e5e7eb',
      marginBottom: '16px',
      opacity: isNew ? 0.8 : 1,
      transition: 'all 0.2s'
    }}>
      <div style={{display: 'flex', gap: '12px'}}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          fontSize: '12px',
          flexShrink: 0
        }}>
          {comment.author_email ? authorName.charAt(0).toUpperCase() : (
            <UserIcon style={{width: '16px', height: '16px'}} />
          )}
        </div>
        
        {/* Content */}
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{
              fontWeight: '500',
              fontSize: '14px'
            }}>
              {authorName}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <CalendarIcon style={{width: '12px', height: '12px', marginRight: '4px'}} />
              {formattedDate}
            </div>
          </div>
          <div 
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151'
            }}
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </div>
    </div>
  );
}

function CommentForm({ itemId, onCommentAdded }) {
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage('Comment content is required');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          author_email: email.trim() || null,
          content: content.trim(),
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setContent('');
        setEmail('');
        setMessage('Comment added successfully!');
        setShowPreview(false);
        if (onCommentAdded) {
          onCommentAdded(newComment);
        }
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to add comment'}`);
      }
    } catch (error) {
      setMessage('Error: Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContent = parseMarkdown(content);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px',
      backgroundColor: 'white',
      marginTop: '32px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <ChatBubbleLeftIcon style={{width: '20px', height: '20px'}} />
        Leave a Comment
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '16px'}}>
          <label htmlFor="email" style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{marginBottom: '16px'}}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <label htmlFor="content" style={{
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Comment
            </label>
            <div style={{display: 'flex', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden'}}>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: 'none',
                  backgroundColor: !showPreview ? '#3b82f6' : 'transparent',
                  color: !showPreview ? 'white' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!content.trim()}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: 'none',
                  backgroundColor: showPreview ? '#3b82f6' : 'transparent',
                  color: showPreview ? 'white' : '#6b7280',
                  cursor: content.trim() ? 'pointer' : 'not-allowed',
                  opacity: content.trim() ? 1 : 0.5
                }}
              >
                Preview
              </button>
            </div>
          </div>
          
          {showPreview ? (
            <div 
              style={{
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb'
              }}
              dangerouslySetInnerHTML={{ __html: previewContent || '<em style="color: #9ca3af">Nothing to preview</em>' }}
            />
          ) : (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your comment here... You can use **bold**, *italic*, and `code` formatting."
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            <div style={{fontSize: '12px', color: '#6b7280'}}>
              Supports: <code style={{backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px'}}>**bold**</code>, <code style={{backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px'}}>*italic*</code>, <code style={{backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px'}}>`code`</code>
            </div>
            <div style={{fontSize: '12px', color: '#9ca3af'}}>
              {content.length}/1000
            </div>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px',
            backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Error') ? '#dc2626' : '#166534',
            border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`
          }}>
            {message}
          </div>
        )}

        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (isSubmitting || !content.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !content.trim()) ? 0.5 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <svg style={{width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Comment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CommentSection({ itemId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCommentId, setNewCommentId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${itemId}`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
    setNewCommentId(newComment.id);
    // Remove the "new" highlight after 3 seconds
    setTimeout(() => setNewCommentId(null), 3000);
  };

  if (loading) {
    return (
      <section className="mt-12">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-slate-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading comments...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-700 font-medium">{error}</div>
          <button 
            onClick={fetchComments}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{marginTop: '48px'}}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <ChatBubbleLeftIcon style={{width: '20px', height: '20px', color: '#6b7280'}} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0
        }}>
          Comments
        </h2>
        <span style={{
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: '500',
          padding: '4px 8px',
          borderRadius: '16px'
        }}>
          {comments.length}
        </span>
      </div>
      
      {/* Comments List */}
      {comments.length > 0 ? (
        <div style={{marginBottom: '32px'}}>
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              isNew={comment.id === newCommentId}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          marginBottom: '32px'
        }}>
          <ChatBubbleLeftIcon style={{
            width: '48px',
            height: '48px',
            color: '#d1d5db',
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '500',
            margin: '0 0 8px 0'
          }}>
            No comments yet
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* Comment Form */}
      <CommentForm itemId={itemId} onCommentAdded={handleCommentAdded} />
    </section>
  );
}