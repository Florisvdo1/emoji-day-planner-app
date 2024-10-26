document.addEventListener('DOMContentLoaded', () => {
  const emojiSearch = document.getElementById('emoji-search');
  const emojiTabs = document.getElementById('tab-list');
  const tabContent = document.getElementById('tab-content');
  const timeline = document.getElementById('timeline');
  const resetButton = document.getElementById('reset-button');
  const shareButton = document.getElementById('share-button');
  const toggleModeButton = document.getElementById('toggle-mode');
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const logoutButton = document.getElementById('logout-button');
  let placedEmojis = [];
  let currentUser = null;

  // Toggle Light/Dark Mode
  toggleModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Emoji Categories and Emojis
  const emojiCategories = {
    'Smileys & Emotion': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
      '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
      '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
      '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
      '👺', '👻', '👽', '👾', '🤖'
    ],
    // Add other categories as needed...
  };

  // Flatten emojis for search functionality
  let allEmojis = [];
  for (const emojis of Object.values(emojiCategories)) {
    allEmojis = allEmojis.concat(emojis);
  }

  // Load Emoji Tabs
  function loadEmojiTabs() {
    emojiTabs.innerHTML = '';
    let firstTab = true;
    for (const category in emojiCategories) {
      const tabButton = document.createElement('button');
      tabButton.textContent = category;
      tabButton.addEventListener('click', () => {
        setActiveTab(category);
      });
      if (firstTab) {
        tabButton.classList.add('active');
        firstTab = false;
      }
      const tabListItem = document.createElement('li');
      tabListItem.appendChild(tabButton);
      emojiTabs.appendChild(tabListItem);
    }
    setActiveTab(Object.keys(emojiCategories)[0]);
  }

  // Set Active Tab
  function setActiveTab(category) {
    document.querySelectorAll('#tab-list button').forEach((btn) => {
      btn.classList.toggle('active', btn.textContent === category);
    });
    loadEmojis(emojiCategories[category]);
  }

  // Load Emojis into the Palette
  function loadEmojis(emojis) {
    tabContent.innerHTML = '';
    const emojiGrid = document.createElement('div');
    emojiGrid.classList.add('emoji-grid');

    emojis.forEach((emojiChar) => {
      const emojiSpan = document.createElement('span');
      emojiSpan.textContent = emojiChar;
      emojiSpan.classList.add('emoji');

      emojiGrid.appendChild(emojiSpan);
    });

    // Initialize Sortable.js on the emoji grid
    new Sortable(emojiGrid, {
      group: {
        name: 'shared',
        pull: 'clone',
        put: false // Do not allow items to be put back into the grid
      },
      sort: false, // Disable sorting within the emoji grid
      animation: 150,
      fallbackOnBody: true,
      forceFallback: true,
      touchStartThreshold: 5,
      onEnd: function(evt) {
        // Remove the element if it was dragged (cloned) to another list
        if (evt.from !== evt.to) {
          evt.item.parentNode.removeChild(evt.item);
        }
      }
    });

    tabContent.appendChild(emojiGrid);
  }

  // Initialize Time Slots
  function initTimeSlots() {
    timeline.innerHTML = '';
    const startHour = 7;
    const endHour = 23;
    const timeIntervals = ['00', '30'];

    for (let hour = startHour; hour <= endHour; hour++) {
      timeIntervals.forEach((minute) => {
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');

        const timeLabel = document.createElement('div');
        timeLabel.classList.add('time-label');

        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeLabel.textContent = `${displayHour}:${minute} ${ampm}`;

        const emojiContainer = document.createElement('div');
        emojiContainer.classList.add('emoji-container');

        timeSlot.appendChild(timeLabel);
        timeSlot.appendChild(emojiContainer);

        timeline.appendChild(timeSlot);

        // Make the emoji container sortable
        new Sortable(emojiContainer, {
          group: 'shared',
          animation: 150,
          fallbackOnBody: true,
          forceFallback: true,
          touchStartThreshold: 5,
          onAdd: saveState,
          onUpdate: saveState,
          onRemove: saveState
        });
      });
    }
  }

  // Search Functionality
  emojiSearch.addEventListener('input', () => {
    const query = emojiSearch.value.trim().toLowerCase();
    if (query === '') {
      setActiveTab(Object.keys(emojiCategories)[0]);
    } else {
      const filteredEmojis = allEmojis.filter((emoji) => {
        // Since we don't have descriptions, we'll match code points
        return emoji.codePointAt(0).toString(16).includes(query);
      });
      loadEmojis(filteredEmojis);
    }
  });

  // Reset Button Functionality
  resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your plan?')) {
      initTimeSlots();
      placedEmojis = [];
      saveState();
    }
  });

  // Share Button Functionality
  shareButton.addEventListener('click', () => {
    const plannerData = JSON.stringify(placedEmojis);
    // Implement sharing functionality as needed
    alert('Your plan data:\n' + plannerData);
  });

  // Local Storage Functions
  function saveState() {
    placedEmojis = [];
    document.querySelectorAll('.time-slot').forEach((slot) => {
      const time = slot.querySelector('.time-label').textContent;
      const emojis = Array.from(slot.querySelector('.emoji-container').children).map(
        (emojiSpan) => emojiSpan.textContent
      );
      if (emojis.length > 0) {
        placedEmojis.push({ time, emojis });
      }
    });

    if (currentUser) {
      // Save to backend for authenticated users
      saveToBackend();
    } else {
      // Save to localStorage for guest users
      localStorage.setItem('placedEmojis', JSON.stringify(placedEmojis));
    }
  }

  function loadState() {
    if (currentUser) {
      // Load from backend for authenticated users
      loadFromBackend();
    } else {
      const savedEmojis = JSON.parse(localStorage.getItem('placedEmojis'));
      if (savedEmojis) {
        placedEmojis = savedEmojis;
        restoreEmojis();
      }
    }
  }

  function restoreEmojis() {
    initTimeSlots();
    placedEmojis.forEach((entry) => {
      const timeSlots = document.querySelectorAll('.time-slot');
      timeSlots.forEach((slot) => {
        const timeLabel = slot.querySelector('.time-label').textContent;
        if (timeLabel === entry.time) {
          const emojiContainer = slot.querySelector('.emoji-container');
          entry.emojis.forEach((emojiChar) => {
            const emojiSpan = document.createElement('span');
            emojiSpan.textContent = emojiChar;
            emojiSpan.classList.add('emoji');

            emojiContainer.appendChild(emojiSpan);
          });

          // Re-initialize Sortable.js for the updated emojiContainer
          new Sortable(emojiContainer, {
            group: 'shared',
            animation: 150,
            fallbackOnBody: true,
            forceFallback: true,
            touchStartThreshold: 5,
            onAdd: saveState,
            onUpdate: saveState,
            onRemove: saveState
          });
        }
      });
    });
  }

  // Backend Interaction (Mocked for this example)
  function saveToBackend() {
    // Send placedEmojis to backend via API
    console.log('Saved to backend:', placedEmojis);
  }

  function loadFromBackend() {
    // Fetch placedEmojis from backend via API
    console.log('Loaded from backend');
    // Mock data for example
    placedEmojis = []; // Replace with fetched data
    restoreEmojis();
  }

  // User Authentication (Mocked for this example)
  loginButton.addEventListener('click', () => {
    currentUser = 'user@example.com';
    toggleAuthButtons();
    loadState();
  });

  signupButton.addEventListener('click', () => {
    currentUser = 'user@example.com';
    toggleAuthButtons();
    saveState();
  });

  logoutButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      currentUser = null;
      toggleAuthButtons();
      initTimeSlots();
    }
  });

  function toggleAuthButtons() {
    if (currentUser) {
      loginButton.style.display = 'none';
      signupButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';
    } else {
      loginButton.style.display = 'inline-block';
      signupButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
    }
  }

  // Initialize the App
  loadEmojiTabs();
  initTimeSlots();
  loadState();
});
