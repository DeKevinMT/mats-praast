(() => {
  const story = document.querySelector('.scroll-story');
  if (!story) return;

  const labels = ['Begin', 'Beweeg', 'Beleef', 'Bouw'];
  const panels = [...story.querySelectorAll('.story-panel')];
  const progressButtons = [...story.querySelectorAll('.story-progress button')];
  const progressCount = story.querySelector('.progress-count');
  const progressFill = story.querySelector('.progress-line span');
  const stickyMessage = document.querySelector('.sticky-message');
  let activeScene = 0;
  let frame = 0;

  const update = () => {
    frame = 0;
    const rect = story.getBoundingClientRect();
    const distance = Math.max(story.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    const nextScene = Math.min(labels.length - 1, Math.floor(progress * labels.length));
    story.style.setProperty('--story-progress', progress.toFixed(4));

    if (nextScene !== activeScene) {
      story.classList.remove('scene-' + activeScene);
      story.classList.add('scene-' + nextScene);
      panels[activeScene]?.classList.remove('is-active');
      panels[nextScene]?.classList.add('is-active');
      progressButtons[activeScene]?.classList.remove('is-active');
      progressButtons[nextScene]?.classList.add('is-active');
      progressButtons.forEach((button, index) => {
        if (index === nextScene) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      activeScene = nextScene;
      if (progressCount) progressCount.innerHTML = '0' + (activeScene + 1) + '<small>/04</small>';
      if (progressFill) progressFill.style.transform = 'scaleY(' + ((activeScene + 1) / labels.length) + ')';
    }

    const storyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    stickyMessage?.classList.toggle('is-hidden', storyVisible);
  };

  const queueUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(update);
  };

  const goToScene = (index) => {
    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const distance = Math.max(story.offsetHeight - window.innerHeight, 1);
    const target = storyTop + (index / (labels.length - 1)) * distance;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  progressButtons.forEach((button, index) => button.addEventListener('click', () => goToScene(index)));
  story.querySelector('.button-quiet')?.addEventListener('click', () => goToScene(1));
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  update();
})();
