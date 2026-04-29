/**
 * MediEquip Pro — Main JavaScript
 * Handles: Chatbot UI, Navbar toggle, Flash auto-dismiss
 */

// ─── Unique session ID for chat (persists tab session) ──────────────────────
const SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 9);

// ─── DOM References ─────────────────────────────────────────────────────────
const chatFab      = document.getElementById('chatFab');
const chatBox      = document.getElementById('chatBox');
const chatClose    = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');
const navToggle    = document.getElementById('navToggle');
const navLinks     = document.getElementById('navLinks');

// ─── Navbar Mobile Toggle ────────────────────────────────────────────────────
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ─── Auto-dismiss Flash Messages ────────────────────────────────────────────
document.querySelectorAll('.flash').forEach(flash => {
  setTimeout(() => {
    flash.style.transition = 'opacity .5s ease';
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 500);
  }, 5000);
});

// ─── Chatbot Toggle ──────────────────────────────────────────────────────────
chatFab.addEventListener('click', () => {
  chatBox.classList.toggle('open');
  if (chatBox.classList.contains('open')) {
    chatInput.focus();
    scrollChat();
  }
});

chatClose.addEventListener('click', () => {
  chatBox.classList.remove('open');
});

// Close chat on outside click
document.addEventListener('click', (e) => {
  if (chatBox.classList.contains('open') &&
      !chatBox.contains(e.target) &&
      !chatFab.contains(e.target)) {
    chatBox.classList.remove('open');
  }
});

// ─── Send Message on Enter or Button ────────────────────────────────────────
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSend.addEventListener('click', sendMessage);

// ─── Core Chat Functions ─────────────────────────────────────────────────────

/**
 * Appends a message bubble to the chat window.
 * @param {string} text    - message content (supports basic markdown **bold**)
 * @param {string} role    - 'user' | 'bot'
 * @param {Array}  recs    - optional recommendation tags
 */
function appendMessage(text, role, recs = []) {
  const wrap = document.createElement('div');
  wrap.className = `chat-msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  // Convert **bold** and newlines to HTML
  bubble.innerHTML = formatMarkdown(text);

  wrap.appendChild(bubble);

  // Recommendation tags (bot only)
  if (role === 'bot' && recs.length > 0) {
    const recWrap = document.createElement('div');
    recWrap.className = 'chat-recs';
    recs.forEach(rec => {
      const tag = document.createElement('span');
      tag.className = 'chat-rec-tag';
      tag.textContent = rec;
      tag.addEventListener('click', () => {
        chatInput.value = `Tell me about ${rec}`;
        sendMessage();
      });
      recWrap.appendChild(tag);
    });
    wrap.appendChild(recWrap);
  }

  chatMessages.appendChild(wrap);
  scrollChat();
  return wrap;
}

/** Show animated typing indicator */
function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot chat-typing';
  wrap.id = 'typingIndicator';
  wrap.innerHTML = `<div class="msg-bubble"><div class="typing-dots">
    <span></span><span></span><span></span>
  </div></div>`;
  chatMessages.appendChild(wrap);
  scrollChat();
}

/** Remove typing indicator */
function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/** Scroll chat to bottom */
function scrollChat() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/** Very basic markdown: **bold**, line breaks */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/**
 * Main send function — reads input, appends user msg,
 * calls /api/chat, appends bot response.
 */
async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  // Append user message
  appendMessage(msg, 'user');
  chatInput.value = '';

  // Show typing
  showTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, session_id: SESSION_ID })
    });

    const data = await res.json();
    hideTyping();

    if (data.reply) {
      appendMessage(data.reply, 'bot', data.recommendations || []);
    } else {
      appendMessage('Sorry, I could not process your request. Please try again.', 'bot');
    }
  } catch (err) {
    hideTyping();
    appendMessage('Connection error. Please refresh the page and try again. 🔄', 'bot');
    console.error('Chat API error:', err);
  }
}

// ─── Product Search Live Filter (products.html) ──────────────────────────────
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  // Debounce to avoid spammy form submissions
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Let the form's native GET submit handle filtering
    }, 400);
  });
}

// ─── Specs Table: Highlight on hover (product_detail.html) ──────────────────
document.querySelectorAll('.specs-table tr').forEach(row => {
  row.addEventListener('mouseover', () => row.style.background = 'var(--primary-light)');
  row.addEventListener('mouseout',  () => row.style.background = '');
});

// ─── Smooth scroll for anchor links ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Animate cards on scroll (Intersection Observer) ────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity    = '1';
      entry.target.style.transform  = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card, .why-card, .cat-card').forEach(card => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity .4s ease, transform .4s ease';
  observer.observe(card);
});
