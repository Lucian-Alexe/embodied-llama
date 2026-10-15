-- Embodied Llama D1 Schema
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_contents (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial seed data for page contents
INSERT OR IGNORE INTO page_contents (key, value) VALUES 
('home_title', 'Embodied Llama | Somatic Coaching'),
('home_hero_heading', 'Returning to the wisdom of your body'),
('home_hero_subtitle', 'Somatic coaching to help you step out of survival mode and reconnect with your true self.');

-- Initial seed articles
INSERT OR IGNORE INTO articles (id, slug, title, description, content, status) VALUES 
('art-1', 'science-of-somatic-coaching-nervous-system', 'The Science of Somatic Coaching: How the Nervous System Heals', 'Explore why body-centered somatic coaching unlocks deep emotional healing and resilience beyond traditional talk therapy.', '# The Science of Somatic Coaching: How the Nervous System Heals

Real transformation happens when we fully inhabit our physical experience. In somatic coaching, we learn that the body holds emotional memories and survival responses that intellect alone cannot resolve.

### Shifting Out of Survival Mode
When trauma or chronic stress overwhelms us, our nervous system enters fight, flight, or freeze. Somatic coaching introduces safe, body-first grounding techniques that signal safety directly to the brain stem.

### Practical Grounding
By paying mindful attention to breath, subtle muscular tension, and bodily posture, we gradually restore regulation, calm, and genuine connection with our true self.', 'published'),

('art-2', 'befriending-your-body-somatic-mindfulness', 'Befriending Your Body: Moving from Judgment to Alliance', 'How somatic coaching guides us from resisting physical discomfort to treating our body as a wise and trusted ally.', '# Befriending Your Body: Moving from Judgment to Alliance

For many of us, our relationship with our body has been one of resistance, criticism, or disconnection. Somatic coaching invites us to make peace with the vessel that carries us.

### Listening to the Soma
Instead of treating tension as a nuisance to eliminate, we ask: *What is this sensation trying to tell me?* With gentle curiosity, old emotional blocks naturally dissolve.', 'published'),

('art-3', 'why-the-llama-boundaries-strength-humor', 'Why the Llama? Boundaries, Resilience, and Soft Power', 'Discover the special symbolism behind Embodied Llama and what this resilient animal teaches us about somatic boundaries.', '# Why the Llama? Boundaries, Resilience, and Soft Power

Llamas are gentle and soft, yet fiercely capable of carrying heavy loads across rugged terrain. They are also famous for setting immediate, unapologetic boundaries!

In our somatic coaching practice, the llama reminds us that we can remain tender, compassionate, and open while firmly rooted in our authentic power.', 'published'),

('art-4', 'four-grounding-somatic-practices-for-stress', 'Four Grounding Somatic Practices to Soothe Daily Stress', 'Simple, effective somatic exercises including TTT tapping, body scans, and conscious breathwork you can use anywhere.', '# Four Grounding Somatic Practices to Soothe Daily Stress

When life accelerates, cognitive reasoning often cannot keep up with an activated nervous system. Here are four practical somatic exercises:

1. **Orienting to the Room**: Slowly turn your head and let your eyes settle on pleasant shapes and colors.
2. **TTT Tapping**: Gentle rhythmic taps along collarbones and wrists to soothe anxious energy.
3. **Long Exhalations**: Breathe out twice as long as you breathe in to stimulate the vagus nerve.
4. **Grounding Through Feet**: Sense the solid contact between your soles and the earth beneath you.', 'published');

